import axios from 'axios';
import { ChatResponse, ExpenseData, HealthCheck } from '../types';

// Base URL for API - will use environment variable
// For now, it's our nginx load balancer on port 8080
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout (fail after 10s if no response)
});

// ============ CHAT SERVICE APIs ============

export const chatApi = {
  // Send a message to the chat service
  sendMessage: async (message: string): Promise<ChatResponse> => {
    const response = await api.post('/chat/chat', { message });
    return response.data;
  },

  // Check if chat service is healthy
  healthCheck: async (): Promise<HealthCheck> => {
    const response = await api.get('/chat/health');
    return response.data;
  },
};

// ============ FINANCE SERVICE APIs ============

export const financeApi = {
  // Get all expenses
  getExpenses: async (): Promise<ExpenseData> => {
    const response = await api.get('/finance/expenses');
    return response.data;
  },

  // Add a new expense
  addExpense: async (
    description: string,
    amount: number,
    category: string
  ): Promise<any> => {
    const response = await api.post('/finance/expenses', {
      description,
      amount,
      category,
    });
    return response.data;
  },

  // Get available categories
  getCategories: async (): Promise<string[]> => {
    const response = await api.get('/finance/categories');
    return response.data.categories;
  },

  // Get spending statistics by category
  getStats: async (): Promise<any> => {
    const response = await api.get('/finance/stats');
    return response.data;
  },

  // Delete an expense by ID
  deleteExpense: async (id: number): Promise<any> => {
    const response = await api.delete(`/finance/expenses/${id}`);
    return response.data;
  },
};

// ============ ERROR HANDLING HELPER ============

// Convert axios errors to friendly messages
export const handleApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error (4xx, 5xx)
      return error.response.data.error || 'Server error occurred';
    } else if (error.request) {
      // Request made but no response (network issue)
      return 'Cannot reach server. Please check your connection.';
    }
  }
  // Something else went wrong
  return 'An unexpected error occurred';
};