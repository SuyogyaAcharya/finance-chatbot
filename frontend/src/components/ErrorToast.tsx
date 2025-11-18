import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './ErrorToast.css';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto-close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="error-toast">
      <div className="error-content">
        <span>{message}</span>
        <button onClick={onClose} className="close-button">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ErrorToast;