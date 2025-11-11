Day 4 Complete ✅

Integrated PostgreSQL database with persistent storage

Implemented PersistentVolumeClaims for data durability

Updated finance service with database operations

Added Kubernetes Secrets for credential management

Data persists across pod restarts and deletions

Architecture

Kubernetes Cluster:

Chat Service (2 pods) - Stateless

Finance Service (2 pods) - Stateless

PostgreSQL (1 pod) - Stateful with PersistentVolume

Services for networking

Technologies

Backend: Node.js, Express.js

Database: PostgreSQL

Containerization: Docker

Orchestration: Kubernetes

Storage: PersistentVolumes

Security: Kubernetes Secrets

Running

Start minikube:
minikube start
eval $(minikube docker-env)

Build images:
docker build -t chat-service:v1 ./chat-service
docker build -t finance-service:v2 ./finance-service

Deploy everything:
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/chat-deployment.yaml
kubectl apply -f k8s/finance-deployment.yaml

Access services:
kubectl port-forward service/finance-service 3002:80

Database Schema

CREATE TABLE expenses (
id SERIAL PRIMARY KEY,
description TEXT NOT NULL,
amount DECIMAL(10,2) NOT NULL,
category VARCHAR(50) NOT NULL,
date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);