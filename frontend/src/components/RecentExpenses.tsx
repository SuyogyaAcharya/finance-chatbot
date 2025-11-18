import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { Expense } from '../types';
import { financeApi } from '../services/api';
import './RecentExpenses.css';

const RecentExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await financeApi.getExpenses();
      setExpenses(data.expenses.slice(0, 10)); // Show only 10 most recent
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const deleteExpense = async (id: number) => {
    try {
      await financeApi.deleteExpense(id);
      setExpenses(expenses.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Food': '#f59e0b',
      'Transportation': '#3b82f6',
      'Entertainment': '#ec4899',
      'Utilities': '#10b981',
      'Shopping': '#8b5cf6',
      'Healthcare': '#ef4444',
      'Other': '#6b7280',
    };
    return colors[category] || colors['Other'];
  };

  if (loading) {
    return (
      <div className="recent-expenses loading">
        <RefreshCw className="spinner" size={24} />
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="recent-expenses empty">
        <p>No expenses yet. Start tracking by chatting with the assistant!</p>
      </div>
    );
  }

  return (
    <div className="recent-expenses">
      <div className="expenses-header">
        <h3>Recent Expenses</h3>
        <button onClick={fetchExpenses} className="refresh-button">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="expenses-list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div
              className="category-indicator"
              style={{ backgroundColor: getCategoryColor(expense.category) }}
            />
            <div className="expense-details">
              <div className="expense-description">{expense.description}</div>
              <div className="expense-meta">
                <span className="expense-category">{expense.category}</span>
                <span className="expense-date">
                  {new Date(expense.date).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="expense-amount">${parseFloat(expense.amount.toString()).toFixed(2)}</div>
            <button
              onClick={() => deleteExpense(expense.id)}
              className="delete-button"
              title="Delete expense"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentExpenses;