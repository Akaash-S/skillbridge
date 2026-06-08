import React, { useRef, useEffect } from 'react';
import { Bot, X, Trash2, Send, Briefcase, BookOpen, MonitorPlay, Lightbulb, FileText, ClipboardList, HelpCircle, RefreshCw, Map } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import type { SuggestedPrompt } from '@/services/assistantService';

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onClearChat: () => void;
  messages: DisplayMessage[];
  isStreaming: boolean;
  streamingContent: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  suggestedPrompts: SuggestedPrompt[];
  onPromptClick: (text: string) => void;
  messageCount: number;
  maxMessages: number;
  contextRole: string;
  contextModule: string;
  contextMode: string;
}

/**
 * Sliding sidebar panel for the AI Learning Assistant.
 * Contains header with context badges, message area, typing indicator,
 * suggested prompts, and input field.
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  onClearChat,
  messages,
  isStreaming,
  streamingContent,
  inputValue,
  onInputChange,
  onSend,
  suggestedPrompts,
  onPromptClick,
  messageCount,
  maxMessages,
  contextRole,
  contextModule,
  contextMode,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Handle Enter key (send on Enter, newline on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = Math.min(target.scrollHeight, 100) + 'px';
    onInputChange(target.value);
  };

  const isAtLimit = messageCount >= maxMessages;
  const isNearLimit = messageCount >= maxMessages - 2;
  const remainingMessages = maxMessages - messageCount;
  const showSuggestions = messages.length === 0 || (!isStreaming && messages.length > 0);

  const getModeLabel = (mode: string): string => {
    switch (mode) {
      case 'video': return 'Video';
      case 'documentation': return 'Docs';
      case 'mixed': return 'Mixed';
      default: return mode || 'Mixed';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`ai-chat-overlay ${isOpen ? 'is-visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`ai-chat-panel ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-label="AI Learning Assistant"
        aria-modal="true"
      >
        {/* ── Header ── */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-top">
            <div className="ai-chat-header-title">
              <div className="header-icon">
                <Bot />
              </div>
              <div>
                <h3>Learning Assistant</h3>
                <p>Ask me anything about your roadmap</p>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <button
                onClick={onClearChat}
                title="Clear chat"
                aria-label="Clear chat history"
                disabled={messages.length === 0}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={onClose}
                title="Close assistant"
                aria-label="Close AI Assistant"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Context Badges */}
          <div className="ai-chat-context-badges">
            {contextRole && (
              <span className="ai-context-badge badge-role">
                <Briefcase />
                {contextRole}
              </span>
            )}
            {contextModule && (
              <span className="ai-context-badge badge-module">
                <BookOpen />
                {contextModule}
              </span>
            )}
            {contextMode && (
              <span className="ai-context-badge badge-mode">
                <MonitorPlay />
                {getModeLabel(contextMode)}
              </span>
            )}
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="ai-chat-messages">
          {messages.length === 0 && !isStreaming ? (
            <div className="ai-chat-empty">
              <div className="ai-chat-empty-icon">
                <Bot />
              </div>
              <h4>Hi! I'm your learning companion 👋</h4>
              <p>
                Ask me questions about your current module, roadmap topics, or anything related to your learning journey.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {isStreaming && streamingContent && (
                <ChatMessage
                  role="assistant"
                  content={streamingContent}
                  isStreaming
                />
              )}
              {isStreaming && !streamingContent && (
                <div className="ai-typing-indicator">
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Suggested Prompts ── */}
        {showSuggestions && suggestedPrompts.length > 0 && (
          <div className="ai-suggested-prompts flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, i) => {
              // Sanitize the label of any emoji prefix
              const cleanLabel = prompt.label.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]️?\s*/gu, '').trim();
              
              let IconNode = null;
              if (cleanLabel.toLowerCase().includes('explain')) {
                IconNode = <Lightbulb size={14} className="text-yellow-500 mr-1.5 shrink-0" />;
              } else if (cleanLabel.toLowerCase().includes('example')) {
                IconNode = <FileText size={14} className="text-blue-500 mr-1.5 shrink-0" />;
              } else if (cleanLabel.toLowerCase().includes('summarize')) {
                IconNode = <ClipboardList size={14} className="text-emerald-500 mr-1.5 shrink-0" />;
              } else if (cleanLabel.toLowerCase().includes('quiz')) {
                IconNode = <HelpCircle size={14} className="text-purple-500 mr-1.5 shrink-0" />;
              } else if (cleanLabel.toLowerCase().includes('revise')) {
                IconNode = <RefreshCw size={14} className="text-indigo-500 mr-1.5 shrink-0" />;
              } else if (cleanLabel.toLowerCase().includes('roadmap')) {
                IconNode = <Map size={14} className="text-orange-500 mr-1.5 shrink-0" />;
              }

              return (
                <button
                  key={i}
                  className="ai-suggested-prompt-btn flex items-center inline-flex px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:bg-muted transition-colors"
                  onClick={() => onPromptClick(prompt.text)}
                  disabled={isStreaming || isAtLimit}
                >
                  {IconNode}
                  <span>{cleanLabel}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Input Area ── */}
        <div className="ai-chat-input-area">
          <div className="ai-chat-input-row">
            <div className="ai-chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="ai-chat-input"
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAtLimit
                    ? 'Message limit reached — clear chat to continue'
                    : 'Ask about your learning...'
                }
                disabled={isStreaming || isAtLimit}
                rows={1}
                aria-label="Type your learning question"
                id="ai-assistant-input"
              />
            </div>
            <button
              className="ai-chat-send-btn"
              onClick={onSend}
              disabled={!inputValue.trim() || isStreaming || isAtLimit}
              title="Send message"
              aria-label="Send message"
              id="ai-assistant-send"
            >
              <Send />
            </button>
          </div>
          <div className="ai-chat-input-info">
            <span
              className={`ai-chat-msg-count ${
                isAtLimit ? 'is-at-limit' : isNearLimit ? 'is-near-limit' : ''
              }`}
            >
              {remainingMessages > 0
                ? `${remainingMessages} message${remainingMessages !== 1 ? 's' : ''} remaining`
                : 'Limit reached — clear chat'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;
