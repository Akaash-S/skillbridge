import React from 'react';
import { Bot, X } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/**
 * Floating action button that toggles the AI Assistant panel.
 * Shows a Bot icon when closed and X icon when open.
 * Includes a pulse animation when idle to draw attention.
 */
export const ChatButton: React.FC<ChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      className={`ai-chat-fab ${isOpen ? 'is-open' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      title={isOpen ? 'Close AI Assistant' : 'Open AI Learning Assistant'}
      id="ai-assistant-fab"
    >
      {isOpen ? (
        <X className="fab-icon" />
      ) : (
        <Bot className="fab-icon" />
      )}
    </button>
  );
};

export default ChatButton;
