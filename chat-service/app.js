const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Finance service URL (Kubernetes service name)
const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://finance-service';

// Simple in-memory conversation history (will be lost on restart)
// In production, you'd store this in Redis or a database
const conversationHistory = new Map();
const MAX_HISTORY = 5;  // Keep last 5 messages

// Get or create conversation history for a user
function getConversationHistory(userId = 'default') {
  if (!conversationHistory.has(userId)) {
    conversationHistory.set(userId, []);
  }
  return conversationHistory.get(userId);
}

// Add message to history
function addToHistory(userId = 'default', role, content) {
  const history = getConversationHistory(userId);
  history.push({ role, content });
  
  // Keep only last MAX_HISTORY messages
  if (history.length > MAX_HISTORY * 2) {  // *2 because user+assistant
    history.splice(0, 2);
  }
}

// Health check
app.get('/health', (req, res) => {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  res.json({ 
    status: 'Chat service is healthy',
    openai: hasApiKey ? 'configured' : 'missing',
    timestamp: new Date().toISOString() 
  });
});

// ============ HELPER FUNCTIONS ============

// Get expense data from finance service
async function getExpenseData() {
  try {
    const response = await axios.get(`${FINANCE_SERVICE_URL}/expenses`);
    return response.data;
  } catch (error) {
    console.error('Error fetching expenses:', error.message);
    return { expenses: [], total: 0, count: 0 };
  }
}

// Add expense to finance service
async function addExpense(description, amount, category) {
  try {
    const response = await axios.post(`${FINANCE_SERVICE_URL}/expenses`, {
      description,
      amount,
      category
    });
    return response.data;
  } catch (error) {
    console.error('Error adding expense:', error.message);
    return null;
  }
}

// Get categories from finance service
async function getCategories() {
  try {
    const response = await axios.get(`${FINANCE_SERVICE_URL}/categories`);
    return response.data.categories;
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    return ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Other'];
  }
}

// ============ INTENT DETECTION ============

// Detect user intent from message
// Detect user intent from message
function detectIntent(message) {
  const lower = message.toLowerCase();
  
  // Check for stats/breakdown BEFORE general list
  if (lower.includes('stat') || lower.includes('breakdown') || 
      lower.includes('by category') || lower.includes('spending by') ||
      lower.includes('category breakdown')) {
    return 'get_stats';
  }
  
  // Check for expense-related keywords
  if (lower.includes('spent') || lower.includes('bought') || 
      lower.includes('paid') || lower.includes('purchase') ||
      lower.match(/\$\d+/) || lower.match(/\d+\s*dollar/)) {
    return 'add_expense';
  }
  
  // Check for viewing expenses
  if (lower.includes('show') || lower.includes('list') || 
      lower.includes('see my') || lower.includes('my expenses')) {
    return 'list_expenses';
  }
  
  // Check for summary/total
  if (lower.includes('total') || lower.includes('how much') || 
      lower.includes('spent so far') || lower.includes('summary')) {
    return 'get_summary';
  }
  
  // Default to general chat
  return 'general_chat';
}

// ============ EXPENSE PARSING ============

// Extract expense details from natural language
// Extract expense details from natural language
// Extract expense details from natural language
function parseExpenseFromMessage(message) {
  console.log(`🔍 Parsing message: "${message}"`);
  
  // Extract amount - try multiple patterns
  let amount = null;
  
  // Pattern 1: $50 or $50.00
  let match = message.match(/\$(\d+(?:\.\d{1,2})?)/);
  if (match) {
    amount = parseFloat(match[1]);
    console.log(`💰 Found amount (pattern 1): $${amount}`);
  }
  
  // Pattern 2: 50 dollars or 50.00 dollars
  if (!amount) {
    match = message.match(/(\d+(?:\.\d{1,2})?)\s*dollars?/i);
    if (match) {
      amount = parseFloat(match[1]);
      console.log(`💰 Found amount (pattern 2): $${amount}`);
    }
  }
  
  // Pattern 3: spent 50, paid 50
  if (!amount) {
    match = message.match(/(?:spent|paid|bought)\s+(\d+(?:\.\d{1,2})?)/i);
    if (match) {
      amount = parseFloat(match[1]);
      console.log(`💰 Found amount (pattern 3): $${amount}`);
    }
  }
  
  // Pattern 4: Just find any number as last resort
  if (!amount) {
    match = message.match(/(\d+(?:\.\d{1,2})?)/);
    if (match) {
      amount = parseFloat(match[1]);
      console.log(`💰 Found amount (pattern 4 - fallback): $${amount}`);
    }
  }
  
  if (!amount) {
    console.log('❌ No amount found');
  }
  
  // Extract category keywords
  const categoryKeywords = {
    'Food': ['lunch', 'dinner', 'breakfast', 'food', 'restaurant', 'coffee', 'meal', 'groceries', 'snack', 'ate', 'eating'],
    'Transportation': ['gas', 'uber', 'lyft', 'taxi', 'bus', 'train', 'parking', 'fuel', 'metro'],
    'Entertainment': ['movie', 'concert', 'game', 'ticket', 'show', 'entertainment', 'netflix', 'spotify', 'hulu'],
    'Utilities': ['electric', 'water', 'internet', 'phone', 'bill', 'utility'],
    'Shopping': ['amazon', 'target', 'walmart', 'store', 'clothes', 'shop', 'bought', 'purchase', 'book', 'item'],
    'Healthcare': ['doctor', 'medicine', 'pharmacy', 'hospital', 'medical', 'health'],
  };
  
  let category = 'Other';
  const lowerMessage = message.toLowerCase();
  
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      category = cat;
      console.log(`📁 Detected category: ${category}`);
      break;
    }
  }
  
  // Extract description (clean up the message)
  let description = message
    .replace(/\$\d+(?:\.\d{1,2})?/g, '')        // Remove $50
    .replace(/\d+(?:\.\d{1,2})?\s*dollars?/gi, '') // Remove "50 dollars"
    .replace(/i spent|i paid|i bought|spent|paid|bought/gi, '') // Remove action words
    .replace(/\s+on\s+|\s+for\s+|\s+at\s+/gi, ' ') // Clean up prepositions
    .trim();
  
  // Remove leading/trailing punctuation and extra spaces
  description = description.replace(/^[^\w]+|[^\w]+$/g, '').trim();
  
  if (!description || description.length < 2) {
    description = `${category} expense`;
  }
  
  console.log(`📝 Description: "${description}"`);
  console.log(`✅ Final parsed: amount=${amount}, category=${category}, description=${description}`);
  
  return { amount, category, description };
}

// Use AI to help categorize ambiguous expenses
async function aiCategorizeExpense(description, amount) {
  try {
    const categories = await getCategories();
    
    const prompt = `Categorize this expense: "${description}" ($${amount})
        Categories: ${categories.join(', ')}
        Reply with ONLY the category name, nothing else.`;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a financial categorization assistant. Reply with only the category name." },
        { role: "user", content: prompt }
      ],
      max_tokens: 10,  // Very short response
      temperature: 0.3, // Low temperature for consistent categorization
    });
    
    const suggestedCategory = completion.choices[0].message.content.trim();
    
    // Validate it's a real category
    if (categories.some(cat => cat.toLowerCase() === suggestedCategory.toLowerCase())) {
      console.log(`🤖 AI categorized "${description}" as ${suggestedCategory}`);
      return suggestedCategory;
    }
    
    // 💰 COST: ~30 tokens = $0.00006 (0.006 cents)
    
  } catch (error) {
    console.error('AI categorization error:', error);
  }
  
  return 'Other';
}

// ============ CHAT ENDPOINT ============

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`📨 Received message: "${message}"`);
    
    // Detect intent
    const intent = detectIntent(message);
    console.log(`🎯 Detected intent: ${intent}`);
    
    let response = '';
    
    // ============ HANDLE DIFFERENT INTENTS ============
    
    if (intent === 'add_expense') {
      const expenseData = parseExpenseFromMessage(message);

      if (!expenseData.amount) {
        response = "I'd love to help you track that expense! Could you include the amount?";
      } else {
        if (expenseData.category === 'Other' && expenseData.description.length > 3) {
          expenseData.category = await aiCategorizeExpense(expenseData.description, expenseData.amount);
        }

        const result = await addExpense(expenseData.description, expenseData.amount, expenseData.category);

        response = result
          ? `✅ Got it! Recorded: ${expenseData.description} ($${expenseData.amount}) in ${expenseData.category}`
          : "❌ Oops! Couldn't save the expense.";
      }

    } else if (intent === 'list_expenses') {
      // Get expenses from database
      const data = await getExpenseData();
      
      if (data.count === 0) {
        response = "📋 You haven't recorded any expenses yet. Try saying something like 'I spent $10 on coffee'!";
      } else {
        const recentExpenses = data.expenses.slice(0, 5);
        response = `📋 Here are your ${data.count > 5 ? 'most recent' : ''} expenses:\n\n`;
        
        recentExpenses.forEach(exp => {
          const date = new Date(exp.date).toLocaleDateString();
          response += `• $${parseFloat(exp.amount).toFixed(2)} - ${exp.description} (${exp.category}) - ${date}\n`;
        });
        
        if (data.count > 5) {
          response += `\n...and ${data.count - 5} more. Total spending: $${data.total.toFixed(2)}`;
        }
      }
      
    } else if (intent === 'get_summary') {
      // Get summary from database
      const data = await getExpenseData();
      
      response = `📊 Your spending summary:\n\n💰 Total spent: $${data.total.toFixed(2)}\n📝 Number of expenses: ${data.count}\n`;
      
      if (data.count > 0) {
        const avgExpense = data.total / data.count;
        response += `📈 Average expense: $${avgExpense.toFixed(2)}`;
      }
      
    } else if (intent === 'get_stats') {
      // Get category breakdown
      try {
        const statsResponse = await axios.get(`${FINANCE_SERVICE_URL}/stats`);
        const stats = statsResponse.data.stats;
        
        if (stats.length === 0) {
          response = "📊 No expenses recorded yet to show statistics.";
        } else {
          response = "📊 Spending breakdown by category:\n\n";
          stats.forEach(stat => {
            const percentage = (stat.total / stats.reduce((sum, s) => sum + parseFloat(s.total), 0) * 100).toFixed(1);
            response += `${stat.category}: $${parseFloat(stat.total).toFixed(2)} (${percentage}%) - ${stat.count} expenses\n`;
          });
        }
      } catch (error) {
        response = "I had trouble fetching your statistics. Please try again.";
      }
      
    } else {
         
        const expenseData = await getExpenseData();
        const systemPrompt = `You are a helpful personal finance assistant. Keep responses brief and friendly.
        Current user data: ${expenseData.count} expenses totaling $${expenseData.total.toFixed(2)}.
        Help users track expenses and provide financial insights.`;
        
        try {
            // Get conversation history
            const userId = req.headers['user-id'] || 'default';
            const history = getConversationHistory(userId);
            
            // Build messages array with context
            const messages = [
            { role: "system", content: systemPrompt },
            ...history,  // Include previous messages
            { role: "user", content: message }
            ];
            
            const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            max_tokens: 150,
            temperature: 0.7,
            });
            
            response = completion.choices[0].message.content;
            
            // Save to history
            addToHistory(userId, 'user', message);
            addToHistory(userId, 'assistant', response);
            
            const tokensUsed = completion.usage.total_tokens;
            const estimatedCost = (tokensUsed / 1000) * 0.002;
            console.log(`💰 OpenAI API call: ${tokensUsed} tokens (~$${estimatedCost.toFixed(6)})`);
            
        } catch (error) {
            console.error('OpenAI API error:', error);
            response = "I'm having trouble connecting to my AI brain right now. But I can still help you track expenses! Try saying 'I spent $10 on lunch'.";
        }
}
    
    // Send response
    res.json({ 
      response,
      intent,
      service: 'chat-service',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      response: "I encountered an error. Please try again!",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`💬 Chat service running on port ${PORT}`);
  console.log(`🤖 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
  console.log(`💰 Finance service: ${FINANCE_SERVICE_URL}`);
});