Personal Finance Chatbot

A microservices app for tracking expenses.

Progress:

Deployed to Kubernetes (Minikube)

2 replicas per service for high availability

Services can discover each other internally

Scaling and rolling updates tested

Accessible via port-forwarding

Architecture:
Kubernetes Cluster:

Chat Service (2 pods)

Finance Service (2 pods)

Services for internal/external access

Tech Stack:

Node.js + Express.js

Docker for containerization

Kubernetes for orchestration

Minikube for local cluster

Running Locally:

Start Minikube:
minikube start

Build Docker images inside Minikube:
minikube -p minikube docker-env | Invoke-Expression
docker build -t chat-service:v1 ./chat-service
docker build -t finance-service:v1 ./finance-service

Deploy to Kubernetes:
kubectl apply -f k8s/chat-deployment.yaml
kubectl apply -f k8s/finance-deployment.yaml

Access Services:

Chat Service:
kubectl port-forward service/chat-service 3001:80

Finance Service:
kubectl port-forward service/finance-service 3002:80

Access in browser:

Chat: http://localhost:3001

Finance: http://localhost:3002

Useful Commands:

kubectl get pods → list pods

kubectl get services → list services

kubectl logs <pod> → view logs

kubectl scale deployment chat-service --replicas=3 → scale service

kubectl exec -it <pod> -- sh → open shell in pod

minikube dashboard → open web UI

Endpoints:

Finance Service:

GET /expenses

POST /expenses

GET /categories

GET /health

Chat Service:

POST /chat

GET /health

Next Steps:

Add PostgreSQL for persistent storage

Integrate OpenAI API for AI chat