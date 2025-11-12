import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, List } from 'lucide-react';
import { ExpenseData } from '../types';
import { financeApi } from '../services/api';
import './ExpenseDashboard.css';

const ExpenseDashboard: React.FC = () => {
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    expenses: [],
    total: 0,
    count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch expense data
  const fetchExpenses = async () => {
    try {
      const data = await financeApi.getExpenses();
      setExpenseData(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and every 10 seconds
  useEffect(() => {
    fetchExpenses();
    const interval = setInterval(fetchExpenses, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="expense-dashboard">
      <div className="stat-card">
        <div className="stat-icon">
          <DollarSign size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">${expenseData.total.toFixed(2)}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <List size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Expenses</div>
          <div className="stat-value">{expenseData.count}</div>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-icon">
          <TrendingUp size={24} />
        </div>
        <div className="stat-content">
          <div className="stat-label">Average</div>
          <div className="stat-value">
            ${expenseData.count > 0
              ? (expenseData.total / expenseData.count).toFixed(2)
              : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;