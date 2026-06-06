/**
 * Assistant Service for SkillBridge AI Learning Assistant
 *
 * Handles communication with the backend assistant API endpoints,
 * including SSE streaming for real-time chat responses.
 */

import { env } from '@/config/env';
import { authService } from './auth';

const API_BASE_URL = env.apiBaseUrl;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LearningContext {
  role: string;
  module: string;
  learningMode: string;
  currentSection?: string;
  roadmapProgress?: number;
  moduleIndex?: number;
}

export interface SuggestedPrompt {
  label: string;
  text: string;
}

export interface ChatHistoryResponse {
  sessionId: string | null;
  messages: ChatMessage[];
  role?: string;
  module?: string;
  learningMode?: string;
  messageCount?: number;
}

/**
 * Send a message to the AI assistant with SSE streaming support.
 *
 * @param message - User's question
 * @param context - Current learning context
 * @param sessionId - Optional session ID to continue a conversation
 * @param onChunk - Callback invoked for each streamed text chunk
 * @param onDone - Callback invoked when streaming completes
 * @param onError - Callback invoked on error
 * @returns Object with sessionId and abort controller
 */
export async function sendMessage(
  message: string,
  context: LearningContext,
  sessionId: string | null,
  onChunk: (chunk: string) => void,
  onDone: (sessionId: string) => void,
  onError: (error: string) => void,
): Promise<{ abort: () => void }> {
  const controller = new AbortController();

  // Verify auth
  const authState = authService.getCurrentState();
  if (!authState.isAuthenticated) {
    onError('Authentication required — please log in.');
    return { abort: () => {} };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: controller.signal,
      body: JSON.stringify({
        message,
        context,
        sessionId,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 429) {
        onError(errorData.error || 'Rate limit reached. Please clear the chat to continue.');
      } else {
        onError(errorMessage);
      }
      return { abort: () => controller.abort() };
    }

    // Process SSE stream
    const reader = response.body?.getReader();
    if (!reader) {
      onError('Streaming not supported by browser');
      return { abort: () => controller.abort() };
    }

    const decoder = new TextDecoder();
    let receivedSessionId = sessionId || '';

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value, { stream: true });
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));

                // Capture session ID from first event
                if (data.sessionId && !receivedSessionId) {
                  receivedSessionId = data.sessionId;
                }

                if (data.done) {
                  onDone(receivedSessionId);
                  return;
                }

                if (data.chunk) {
                  onChunk(data.chunk);
                }

                if (data.error) {
                  onError(data.chunk || 'Streaming error occurred');
                  return;
                }
              } catch {
                // Skip malformed JSON lines
              }
            }
          }
        }

        // Stream ended without explicit done event
        onDone(receivedSessionId);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          // User cancelled — not an error
          return;
        }
        onError('Connection lost during streaming');
      }
    };

    processStream();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { abort: () => {} };
    }
    onError('Failed to connect to the assistant');
  }

  return { abort: () => controller.abort() };
}

/**
 * Send a non-streaming message to the AI assistant.
 */
export async function sendMessageSync(
  message: string,
  context: LearningContext,
  sessionId: string | null,
): Promise<{ response: string; sessionId: string }> {
  const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ message, context, sessionId, stream: false }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Get chat history for the current user.
 */
export async function getChatHistory(
  sessionId?: string,
): Promise<ChatHistoryResponse> {
  const url = new URL(`${API_BASE_URL}/assistant/history`);
  if (sessionId) url.searchParams.set('sessionId', sessionId);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to load chat history');
  }

  return res.json();
}

/**
 * Clear chat history for the current user.
 */
export async function clearChatHistory(
  sessionId?: string,
): Promise<void> {
  const url = new URL(`${API_BASE_URL}/assistant/history`);
  if (sessionId) url.searchParams.set('sessionId', sessionId);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to clear chat history');
  }
}

/**
 * Get suggested prompts based on current learning context.
 */
export async function getSuggestedPrompts(
  context: LearningContext,
): Promise<SuggestedPrompt[]> {
  const url = new URL(`${API_BASE_URL}/assistant/prompts`);
  if (context.role) url.searchParams.set('role', context.role);
  if (context.module) url.searchParams.set('module', context.module);
  if (context.currentSection) url.searchParams.set('currentSection', context.currentSection);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    // Return defaults on error
    return getDefaultPrompts();
  }

  const data = await res.json();
  return data.prompts || getDefaultPrompts();
}

/**
 * Fallback default prompts (used when API is unavailable).
 */
function getDefaultPrompts(): SuggestedPrompt[] {
  return [
    { label: '💡 Explain Simply', text: 'Explain the current topic simply' },
    { label: '📝 Give Example', text: 'Give me a practical example' },
    { label: '📋 Summarize', text: 'Summarize the current topic' },
    { label: '🧠 Quiz Me', text: 'Ask me a practice question' },
    { label: '🔄 Revise Topic', text: 'Help me revise the key concepts' },
  ];
}
