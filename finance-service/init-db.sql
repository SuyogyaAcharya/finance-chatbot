-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(50) NOT NULL,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);

-- Insert sample data (optional - remove in production)
INSERT INTO expenses (description, amount, category) VALUES
  ('Sample Lunch', 12.50, 'Food'),
  ('Sample Gas', 40.00, 'Transportation'),
  ('Sample Movie', 15.00, 'Entertainment')
ON CONFLICT DO NOTHING;