# AI-Powered Personal Finance Chatbot

A cloud-native microservices application using AI for expense tracking.

## Day 1 Progress
- ✅ Created chat microservice with Express.js
- ✅ Dockerized the service
- ✅ Set up secure repository structure

## Technologies
- Node.js, Express.js, Docker

## Running Locally
```bash
cd chat-service
docker build -t chat-service:v1 .
docker run -p 3001:3001 chat-service:v1