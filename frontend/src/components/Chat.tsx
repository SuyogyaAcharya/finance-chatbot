import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Message } from '../types';
import { chatApi, handleApiError } from '../services/api';
import ChatMessage from './ChatMessage';
import './Chat.css';

const Chat: React.FC = () => {
  // ============ STATE ============
  
  // Array of all messages in the conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your personal finance assistant. 💰\n\nI can help you:\n• Track expenses: 'I spent $20 on lunch'\n• View expenses: 'Show my expenses'\n• Get summaries: 'What's my total?'\n• Financial advice: 'How can I save money?'\n\nWhat would you like to do?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  
  // Current text in input box
  const [inputMessage, setInputMessage] = useState('');
  
  // Is bot currently processing a message?
  const [isLoading, setIsLoading] = useState(false);
  
  // Reference to the bottom of messages (for auto-scroll)
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============ EFFECTS ============
  
  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]); // Run when messages change

  // ============ HANDLERS ============
  
  // Send message to backend
  const sendMessage = async () => {
    // Don't send empty messages or while loading
    if (!inputMessage.trim() || isLoading) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage(''); // Clear input box
    setIsLoading(true);  // Show loading indicator

    try {
      // Call chat API
      const response = await chatApi.sendMessage(inputMessage);

      // Add bot response to UI
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'bot',
        timestamp: new Date(),
        intent: response.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      // Show error message as bot message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ ${handleApiError(error)}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Hide loading indicator
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Don't add newline
      sendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    'Show my expenses',
    "What's my total?",
    'I spent $15 on coffee',
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  // ============ RENDER ============
  
  return (
    <div className="chat-container">
      {/* Messages area */}
      <div className="messages">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="message bot">
            <div className="message-content loading">
              <Loader2 className="spinner" size={20} />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {/* Invisible div at bottom for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="quick-action"
            onClick={() => handleQuickAction(action)}
            disabled={isLoading}
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="input-area">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about your finances or add an expense..."
          disabled={isLoading}
          rows={2}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !inputMessage.trim()}
          className="send-button"
        >
          {isLoading ? (
            <Loader2 className="spinner" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default Chat;