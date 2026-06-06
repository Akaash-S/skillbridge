import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  isStreaming?: boolean;
}

/**
 * Renders a single chat message bubble with basic markdown support
 * for AI responses (bold, code, lists, line breaks).
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  timestamp,
  isStreaming = false,
}) => {
  const isUser = role === 'user';

  /**
   * Basic markdown-to-HTML converter for assistant messages.
   * Handles: **bold**, `code`, ```code blocks```, - lists, numbered lists, line breaks.
   */
  const renderMarkdown = (text: string): string => {
    if (isUser) return escapeHtml(text);

    let html = escapeHtml(text);

    // Code blocks (```...```)
    html = html.replace(
      /```(\w*)\n?([\s\S]*?)```/g,
      '<pre><code>$2</code></pre>'
    );

    // Inline code (`...`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold (**...**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic (*...*)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

    // Unordered lists (- item)
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // Numbered lists (1. item)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Line breaks
    html = html.replace(/\n/g, '<br/>');

    // Clean up double <br/> inside <ul>
    html = html.replace(/<ul><br\/>/g, '<ul>');
    html = html.replace(/<br\/><\/ul>/g, '</ul>');

    return html;
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  };

  const formatTimestamp = (ts?: string): string => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`ai-chat-message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div
        className="ai-message-bubble"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
      {timestamp && !isStreaming && (
        <span className="ai-message-timestamp">
          {formatTimestamp(timestamp)}
        </span>
      )}
      {isStreaming && (
        <span className="ai-message-timestamp" style={{ opacity: 0.6 }}>
          typing...
        </span>
      )}
    </div>
  );
};

export default ChatMessage;
