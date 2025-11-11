const express = require('express');
const cors = require('cors')

const app = express()

app.use(cors());           
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({ 
        status: 'Chat service is healthy - VERSION 2!', 
        timestamp: new Date().toISOString(),
        version: '2.0'
    });
});

app.post('/chat', (req, res) => {
    const { message } = req.body;
    
    res.json({ 
        response: `Echo: ${message}`,
        service: 'chat-service',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Chat service running on port ${PORT}`);
});