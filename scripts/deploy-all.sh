#!/bin/bash

# E-Commerce Platform - Complete Deployment Script
# This script deploys all components to Kubernetes

set -e

echo "🚀 Starting E-Commerce Platform Deployment..."

# Create namespace
echo "📦 Creating namespace..."
kubectl apply -f kubernetes/namespaces/01-ecommerce.yaml

# Apply ConfigMaps
echo "⚙️  Applying ConfigMaps..."
kubectl apply -f kubernetes/configmaps/01-configmaps.yaml

# Apply Secrets
echo "🔐 Applying Secrets..."
kubectl apply -f kubernetes/secrets/01-secrets.yaml

# Apply Services
echo "🌐 Creating Services..."
kubectl apply -f kubernetes/services/01-services.yaml

# Apply Deployments
echo "🎯 Deploying Services..."
kubectl apply -f kubernetes/deployments/01-deployments.yaml

# Apply Istio configurations
echo "🔧 Configuring Istio..."
kubectl apply -f istio/virtual-services/
kubectl apply -f istio/destination-rules/
kubectl apply -f istio/gateways/

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/user-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/product-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/order-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/notification-service -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/api-gateway -n ecommerce
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n ecommerce

echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Service Status:"
kubectl get pods -n ecommerce
echo ""
echo "🌐 Service URLs:"
kubectl get services -n ecommerce
echo ""
echo "🎉 E-Commerce Platform is now running!"
