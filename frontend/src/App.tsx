import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import Chat from './components/Chat';
import ExpenseDashboard from './components/ExpenseDashboard';
import { chatApi, financeApi } from './services/api';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await Promise.all([
          chatApi.healthCheck(),
          financeApi.getCategories(),
        ]);
        setIsConnected(true);
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkConnection();
  }, []);

  if (isChecking) {
    return (
      <div className="app loading">
        <div className="loading-spinner">
          <Activity size={48} className="spinner" />
          <p>Connecting to services...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="app error">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Cannot Connect to Backend</h2>
          <p>Please ensure your services are running:</p>
          <pre>kubectl port-forward service/chat-service 3001:80</pre>
          <pre>kubectl port-forward service/finance-service 3002:80</pre>
          <button onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>💰 Finance Assistant</h1>
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span>Connected</span>
          </div>
        </div>
      </header>

      <ExpenseDashboard />

      <main className="app-main">
        <Chat />
      </main>
    </div>
  );
}

export default App;