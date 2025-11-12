// Message in chat interface
export interface Message {
  id: string;                    // Unique identifier
  text: string;                  // Message content
  sender: 'user' | 'bot';        // Who sent it (only these 2 options)
  timestamp: Date;               // When it was sent
  intent?: string;               // Optional: detected intent from backend
}

// Single expense record
export interface Expense {
  id: number;                    // Database ID
  description: string;           // "Lunch", "Coffee", etc.
  amount: number;                // Dollar amount (e.g., 25.50)
  category: string;              // "Food", "Transportation", etc.
  date: string;                  // ISO date string from database
  created_at: string;            // When record was created
}

// Response from /expenses endpoint
export interface ExpenseData {
  expenses: Expense[];           // Array of all expenses
  total: number;                 // Sum of all amounts
  count: number;                 // Number of expenses
}

// Response from /chat endpoint
export interface ChatResponse {
  response: string;              // Bot's reply text
  intent: string;                // Detected intent (add_expense, list_expenses, etc.)
  service: string;               // Which service responded
  timestamp: string;             // ISO timestamp
}

// Response from /health endpoint
export interface HealthCheck {
  status: string;                // "healthy" or error message
  openai?: string;               // Optional: OpenAI API status
  database?: string;             // Optional: Database status
  timestamp: string;             // ISO timestamp
}