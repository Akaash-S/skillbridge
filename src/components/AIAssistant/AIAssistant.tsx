import React, { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { ChatButton } from './ChatButton';
import { ChatPanel, type DisplayMessage } from './ChatPanel';
import {
  sendMessage,
  clearChatHistory,
  type LearningContext,
  type SuggestedPrompt,
} from '@/services/assistantService';
import './AIAssistant.css';

/** Max messages per session (mirrors backend config) */
const MAX_MESSAGES_PER_SESSION = 10;

/** Routes where the assistant should NOT appear */
const BLOCKED_ROUTES = [
  '/assessment',  // Final assessment (matches /assessment/:roleId too)
  '/login',
  '/onboarding',
];

/** Routes that are public / non-learning (hide the FAB) */
const HIDDEN_ROUTES = ['/', '/login', '/onboarding'];

/**
 * Context-Aware AI Learning Assistant
 *
 * Global component that renders a floating chat button and a sliding
 * sidebar panel. It automatically reads the user's current learning
 * context (role, module, learning mode) from AppDataContext and passes
 * it to the backend with every message.
 *
 * The assistant hides itself on assessment and certificate screens.
 */
export const AIAssistant: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const {
    selectedRole,
    learningMode,
    roadmapModules,
    roadmap,
    roadmapProgress,
  } = useAppData();

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [suggestedPrompts, setSuggestedPrompts] = useState<SuggestedPrompt[]>([]);
  const [abortFn, setAbortFn] = useState<(() => void) | null>(null);

  // ── Derived context ──
  const currentRole = selectedRole?.title || '';
  const currentModule = (() => {
    // Try to find the current active (unlocked, not completed) module
    if (roadmapModules && roadmapModules.length > 0) {
      const activeModule = roadmapModules.find(
        (m: { unlocked?: boolean; completed?: boolean; quizPassed?: boolean }) =>
          m.unlocked && !m.completed && !m.quizPassed
      );
      if (activeModule) return activeModule.title || activeModule.name || '';
      // Fallback: last unlocked module
      const unlockedModules = roadmapModules.filter((m: { unlocked?: boolean }) => m.unlocked);
      if (unlockedModules.length > 0) {
        const last = unlockedModules[unlockedModules.length - 1];
        return last.title || last.name || '';
      }
    }
    // Fallback to roadmap items
    if (roadmap && roadmap.length > 0) {
      const active = roadmap.find((r) => !r.completed);
      return active?.skillName || '';
    }
    return '';
  })();
  const currentMode = learningMode || 'mixed';
  const progress = roadmapProgress?.progress || 0;

  const learningContext: LearningContext = {
    role: currentRole,
    module: currentModule,
    learningMode: currentMode,
    roadmapProgress: progress,
  };

  // ── Visibility check ──
  const shouldShow = (() => {
    if (!isAuthenticated) return false;
    const path = location.pathname;
    // Hide on explicitly blocked routes
    if (BLOCKED_ROUTES.some((route) => path.startsWith(route))) return false;
    // Hide on public/non-learning routes
    if (HIDDEN_ROUTES.includes(path)) return false;
    return true;
  })();

  // Close panel when navigating to a blocked route
  useEffect(() => {
    if (!shouldShow && isOpen) {
      setIsOpen(false);
    }
  }, [shouldShow, isOpen]);

  // Manage body class for split-view layout
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('assistant-open');
    } else {
      document.body.classList.remove('assistant-open');
    }
    return () => document.body.classList.remove('assistant-open');
  }, [isOpen]);

  // Generate suggested prompts based on context
  useEffect(() => {
    const prompts: SuggestedPrompt[] = [];

    if (currentModule) {
      prompts.push(
        { label: 'Explain Simply', text: `Explain ${currentModule} in simple terms` },
        { label: 'Give Example', text: `Give me a practical example of ${currentModule}` },
        { label: 'Summarize', text: `Summarize what I need to know about ${currentModule}` },
        { label: 'Quiz Me', text: `Ask me a practice question about ${currentModule}` },
        { label: 'Revise Topic', text: `Help me revise the key concepts of ${currentModule}` },
      );
    } else {
      prompts.push(
        { label: 'Explain Simply', text: 'Explain the current topic simply' },
        { label: 'Give Example', text: 'Give me a practical example' },
        { label: 'Summarize', text: 'Summarize the current topic' },
        { label: 'Quiz Me', text: 'Ask me a practice question' },
        { label: 'Revise Topic', text: 'Help me revise the key concepts' },
      );
    }

    if (currentRole) {
      prompts.push({
        label: 'Roadmap Help',
        text: `What should I focus on next in my ${currentRole} roadmap?`,
      });
    }

    setSuggestedPrompts(prompts);
  }, [currentRole, currentModule]);

  // ── Handlers ──
  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isStreaming) return;

    // Add user message to display
    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsStreaming(true);
    setStreamingContent('');
    setMessageCount((prev) => prev + 1);

    // Collect streaming content
    let fullResponse = '';

    const result = await sendMessage(
      text,
      learningContext,
      sessionId,
      // onChunk
      (chunk) => {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      },
      // onDone
      (returnedSessionId) => {
        // Add completed assistant message
        const assistantMsg: DisplayMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setStreamingContent('');
        setIsStreaming(false);
        if (returnedSessionId) {
          setSessionId(returnedSessionId);
        }
      },
      // onError
      (error) => {
        const errorMsg: DisplayMessage = {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          content: error,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        setStreamingContent('');
        setIsStreaming(false);
      },
    );

    setAbortFn(() => result.abort);
  }, [inputValue, isStreaming, learningContext, sessionId]);

  const handleClearChat = useCallback(async () => {
    // Abort any in-progress stream
    if (abortFn) abortFn();

    // Clear locally
    setMessages([]);
    setStreamingContent('');
    setIsStreaming(false);
    setMessageCount(0);
    setInputValue('');

    // Clear on server
    if (sessionId) {
      try {
        await clearChatHistory(sessionId);
      } catch (e) {
        console.error('Failed to clear chat history on server:', e);
      }
    }
    setSessionId(null);
  }, [abortFn, sessionId]);

  const handlePromptClick = useCallback(
    (text: string) => {
      setInputValue(text);
      // Auto-send after a brief delay for UX
      setTimeout(() => {
        const sendBtn = document.getElementById('ai-assistant-send');
        if (sendBtn) sendBtn.click();
      }, 100);
    },
    [],
  );

  // ── Don't render if the assistant should be hidden ──
  if (!shouldShow) return null;

  return (
    <>
      <ChatButton isOpen={isOpen} onClick={handleToggle} />
      <ChatPanel
        isOpen={isOpen}
        onClose={handleClose}
        onClearChat={handleClearChat}
        messages={messages}
        isStreaming={isStreaming}
        streamingContent={streamingContent}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSend={handleSend}
        suggestedPrompts={suggestedPrompts}
        onPromptClick={handlePromptClick}
        messageCount={messageCount}
        maxMessages={MAX_MESSAGES_PER_SESSION}
        contextRole={currentRole}
        contextModule={currentModule}
        contextMode={currentMode}
      />
    </>
  );
};

export default AIAssistant;
