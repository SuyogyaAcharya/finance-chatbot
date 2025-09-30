# AI-Powered Personal Finance Chatbot

A cloud-native microservices application using AI for expense tracking.

## Day 2 Progress
- ✅ Created finance microservice for expense management
- ✅ Implemented Docker Compose for multi-container orchestration
- ✅ Added Nginx load balancer for request routing
- ✅ Both services accessible through single entry point

## Architecture
User → Nginx (port 8080) → Chat Service (3001)
→ Finance Service (3002)

## Technologies
- Node.js, Express.js
- Docker, Docker Compose
- Nginx Load Balancer

## Running Locally
```bash
docker-compose up --build

Access services at:

Load Balancer: http://localhost:8080/health
Chat API: http://localhost:8080/api/chat/
Finance API: http://localhost:8080/api/finance/

Available Endpoints
Finance Service

GET /api/finance/expenses - Get all expenses
POST /api/finance/expenses - Add new expense
GET /api/finance/categories - Get expense categories
DELETE /api/finance/expenses/:id - Delete expense

Chat Service

POST /api/chat/chat - Send chat message