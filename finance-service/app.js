const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors());
app.use(express.json());
let expenses = [];

// Predefined categories
const categories = [
    'Food', 
    'Transportation', 
    'Entertainment', 
    'Utilities', 
    'Shopping', 
    'Healthcare',
    'Other'
];



app.get('/health', (req, res) => {
  res.json({
    status: 'Finanace Service is health',
    timestamp: new Date().toISOString()
  });
});


app.get('/expenses', (req, res) => {
  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    res.json({ 
        expenses, 
        total,
        count: expenses.length
    });
});

app.post('/expenses', (req, res) => {
    const { description, amount, category } = req.body;
    
    // Validate input
    if (!description || !amount || !category) {
        return res.status(400).json({ 
            error: 'Missing required fields: description, amount, category' 
        });
    }
    
    // Create expense object
    const expense = {
        id: Date.now().toString(),
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString()
    };
    
    expenses.push(expense);
    
    res.status(201).json({ 
        message: 'Expense added successfully', 
        expense 
    });
});

// Get categories
app.get('/categories', (req, res) => {
    res.json({ categories });
});

// Delete expense (bonus endpoint)
app.delete('/expenses/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = expenses.length;
    
    expenses = expenses.filter(exp => exp.id !== id);
    
    if (expenses.length < initialLength) {
        res.json({ message: 'Expense deleted successfully' });
    } else {
        res.status(404).json({ error: 'Expense not found' });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Finance service running on port ${PORT}`);
});