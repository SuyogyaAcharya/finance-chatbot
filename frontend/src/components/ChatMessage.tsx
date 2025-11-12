import React from 'react';
import { Message } from '../types';
import './ChatMessage.css';

// Props this component accepts
interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div className={`message ${message.sender}`}>
      <div className="message-content">
        {/* Split by newlines and render with <br> tags */}
        {message.text.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < message.text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
      <div className="message-time">
        {message.timestamp.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </div>
    </div>
  );
};

export default ChatMessage;