A cloud-native microservices application using AI to track and manage personal expenses.

Progress

Day 5 Complete ✅

Integrated OpenAI GPT-3.5 Turbo for natural language understanding

Implemented intent detection system

Built expense parsing from natural language

Added AI-powered categorization for ambiguous expenses

Enabled conversation context/memory

Connected chat service to finance service

Cost-optimized AI usage (~$0.01-0.05 per day)

Architecture

User → Chat Service (AI-powered) ↔ Finance Service → PostgreSQL
                ↓
              OpenAI GPT-3.5 API

Technologies

Backend: Node.js, Express.js

Database: PostgreSQL

AI/ML: OpenAI GPT-3.5 Turbo

Containerization: Docker

Orchestration: Kubernetes

Security: Kubernetes Secrets

Features

Track expenses using natural language: e.g., "I spent $15 on coffee"

View expenses: "Show my expenses"

Get summaries: "What's my total?"

AI financial advice: "How can I save money?"

Automatic expense categorization

Conversation memory/context

Category breakdown and statistics

Cost Optimization

Most requests use zero AI calls

Average cost per interaction: ~$0.0003

Daily usage cost: ~$0.01-$0.05

OpenAI free credits last for weeks

Running

Start Minikube: minikube start

Configure Docker environment: eval $(minikube docker-env)

Build Docker images for services

Deploy services using Kubernetes manifests

Port-forward chat service to localhost: kubectl port-forward service/chat-service 3001:80

Testing Chat

Send a test message:

curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"I spent $20 on lunch"}'

API Endpoints

Chat Service

POST /chat – Send message to AI chatbot

GET /health – Health check

Finance Service

GET /expenses – List all expenses

POST /expenses – Add an expense

GET /stats – Category breakdown

GET /categories – Available categories

Next Steps

Build React frontend with chat UI

Deploy to AWS (EKS, RDS, S3)

Production polish and monitoring