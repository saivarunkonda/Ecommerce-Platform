#!/bin/bash

set -e

echo "========================================="
echo "E-commerce Platform Deployment Script"
echo "========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists kubectl; then
    echo "Error: kubectl is not installed"
    exit 1
fi

if ! command_exists docker; then
    echo "Error: docker is not installed"
    exit 1
fi

if ! command_exists istioctl; then
    echo "Warning: istioctl is not installed. Istio features will not be available."
fi

echo "Prerequisites check passed."
echo ""

# Build Docker images
echo "Building Docker images..."
docker build -t ecommerce/user-service:latest ./services/user-service/
docker build -t ecommerce/product-service:latest ./services/product-service/
docker build -t ecommerce/order-service:latest ./services/order-service/
docker build -t ecommerce/api-gateway:latest ./services/api-gateway/
docker build -t ecommerce/notification-service:latest ./services/notification-service/
echo "Docker images built successfully."
echo ""

# Create namespace
echo "Creating namespace..."
kubectl apply -f kubernetes/namespaces/
echo "Namespace created."
echo ""

# Apply secrets and configmaps
echo "Applying secrets and configmaps..."
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/configmaps/
echo "Secrets and configmaps applied."
echo ""

# Deploy databases and infrastructure
echo "Deploying databases and infrastructure..."
kubectl apply -f kubernetes/infrastructure/ 2>/dev/null || echo "No infrastructure folder found, skipping..."
echo ""

# Deploy services
echo "Deploying microservices..."
kubectl apply -f kubernetes/deployments/
echo "Microservices deployed."
echo ""

# Apply Istio configurations if istioctl is available
if command_exists istioctl; then
    echo "Applying Istio configurations..."
    kubectl apply -f istio/gateways/
    kubectl apply -f istio/virtual-services/
    kubectl apply -f istio/destination-rules/
    kubectl apply -f istio/peer-authentication.yaml
    kubectl apply -f istio/authorization-policy.yaml
    echo "Istio configurations applied."
    echo ""
fi

# Wait for deployments to be ready
echo "Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/user-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/product-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/order-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n ecommerce
echo "All deployments are ready."
echo ""

# Get service information
echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo ""
echo "Services:"
kubectl get services -n ecommerce
echo ""
echo "Pods:"
kubectl get pods -n ecommerce
echo ""
echo "Ingress Gateway (if using Istio):"
kubectl get svc istio-ingressgateway -n istio-system 2>/dev/null || echo "Istio ingress gateway not found"
echo ""
echo "API Gateway LoadBalancer:"
kubectl get svc api-gateway -n ecommerce
echo ""
echo "To access the API, use the external IP from the API Gateway service above."
