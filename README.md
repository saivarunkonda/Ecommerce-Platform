# E-Commerce Microservices Platform

A comprehensive e-commerce platform built with microservices architecture, demonstrating advanced container orchestration with Kubernetes, OpenShift, and Istio.

## Architecture Overview

This project implements a real-world e-commerce platform with the following microservices:

- **User Service**: User management and authentication
- **Product Catalog Service**: Product management and search
- **Order Service**: Order processing and management
- **API Gateway**: Entry point and request routing
- **Notification Service**: Email and SMS notifications

## Technology Stack

- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL (for each service)
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Service Mesh**: Istio
- **Platform**: OpenShift
- **Authentication**: JWT
- **API Documentation**: OpenAPI/Swagger

## Features Demonstrated

- **Kubernetes**: Deployments, Services, ConfigMaps, Secrets, Ingress
- **Istio**: Service mesh, traffic management, security, observability
- **OpenShift**: Templates, Routes, BuildConfigs, DeploymentConfigs
- **Microservices**: Service discovery, load balancing, circuit breakers
- **Security**: mTLS, authentication, authorization
- **Monitoring**: Prometheus, Grafana, Jaeger tracing

## Project Structure

```
├── services/
│   ├── user-service/
│   ├── product-service/
│   ├── order-service/
│   ├── api-gateway/
│   └── notification-service/
├── kubernetes/
│   ├── namespaces/
│   ├── deployments/
│   ├── services/
│   └── configmaps/
├── istio/
│   ├── virtual-services/
│   ├── destination-rules/
│   └── gateways/
├── openshift/
│   ├── templates/
│   └── routes/
├── monitoring/
└── scripts/
```

## Quick Start

### Prerequisites
- Docker
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Istio installed
- OpenShift CLI (oc) if using OpenShift

### Local Development

1. Clone the repository
2. Build all services: `npm run build`
3. Start databases: `docker-compose up -d`
4. Run services: `npm run dev`

### Kubernetes Deployment

1. Install Istio: `istioctl install`
2. Deploy services: `kubectl apply -f kubernetes/`
3. Configure Istio: `kubectl apply -f istio/`
4. Access the application via the gateway

### OpenShift Deployment

1. Create project: `oc new-project ecommerce`
2. Apply templates: `oc apply -f openshift/templates/`
3. Deploy: `oc process ecommerce-template | oc apply -f -`

## API Endpoints

- **API Gateway**: http://localhost:8080
- **User Service**: http://localhost:8081
- **Product Service**: http://localhost:8082
- **Order Service**: http://localhost:8083
- **Notification Service**: http://localhost:8084

## Monitoring

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686

## Documentation

Each service includes OpenAPI documentation accessible at `/docs` endpoint.

## License

MIT License
