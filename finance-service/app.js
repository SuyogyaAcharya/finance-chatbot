const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,          // e.g., 'postgres' in Docker
  port: parseInt(process.env.DB_PORT), // 5432
  database: process.env.DB_NAME,      // 'financedb'
  user: process.env.DB_USER,          // 'financeuser'
  password: process.env.DB_PASSWORD,  // 'financepass'
});

// Initialize database tables
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
  }
}

// Initialize on startup
initDB();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'Finance service is healthy',
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Get all expenses
app.get('/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    const totalResult = await pool.query('SELECT COALESCE(SUM(amount), 0) as total FROM expenses');
    
    res.json({ 
      expenses: result.rows, 
      total: parseFloat(totalResult.rows[0].total),
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add new expense
app.post('/expenses', async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    
    if (!description || !amount || !category) {
      return res.status(400).json({ 
        error: 'Missing required fields: description, amount, category' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO expenses (description, amount, category) VALUES ($1, $2, $3) RETURNING *',
      [description, parseFloat(amount), category]
    );
    
    res.status(201).json({ 
      message: 'Expense added successfully', 
      expense: result.rows[0] 
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get categories
app.get('/categories', (req, res) => {
  const categories = [
    'Food', 
    'Transportation', 
    'Entertainment', 
    'Utilities', 
    'Shopping', 
    'Healthcare',
    'Other'
  ];
  res.json({ categories });
});

// Delete expense
app.delete('/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length > 0) {
      res.json({ message: 'Expense deleted successfully', expense: result.rows[0] });
    } else {
      res.status(404).json({ error: 'Expense not found' });
    }
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get expense statistics
app.get('/stats', async (req, res) => {
  try {
    const categoryStats = await pool.query(`
      SELECT category, 
             COUNT(*) as count, 
             SUM(amount) as total,
             AVG(amount) as average
      FROM expenses 
      GROUP BY category 
      ORDER BY total DESC
    `);
    
    res.json({ stats: categoryStats.rows });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`💰 Finance service running on port ${PORT}`);
  console.log(`📊 Connected to database at ${process.env.DB_HOST || 'postgres'}`);
});