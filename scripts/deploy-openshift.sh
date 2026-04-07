#!/bin/bash

set -e

echo "========================================="
echo "OpenShift Deployment Script"
echo "========================================="
echo ""

# Check if oc command exists
if ! command -v oc &> /dev/null; then
    echo "Error: OpenShift CLI (oc) is not installed"
    exit 1
fi

# Check if logged in
if ! oc whoami &> /dev/null; then
    echo "Error: Not logged into OpenShift. Please run 'oc login' first."
    exit 1
fi

# Create project
echo "Creating OpenShift project..."
oc new-project ecommerce || oc project ecommerce
echo ""

# Build images using OpenShift BuildConfigs
echo "Building container images..."
oc new-build --name user-service --binary --strategy docker -n ecommerce || true
oc start-build user-service --from-dir=./services/user-service/ -n ecommerce

oc new-build --name product-service --binary --strategy docker -n ecommerce || true
oc start-build product-service --from-dir=./services/product-service/ -n ecommerce

oc new-build --name order-service --binary --strategy docker -n ecommerce || true
oc start-build order-service --from-dir=./services/order-service/ -n ecommerce

oc new-build --name api-gateway --binary --strategy docker -n ecommerce || true
oc start-build api-gateway --from-dir=./services/api-gateway/ -n ecommerce

oc new-build --name notification-service --binary --strategy docker -n ecommerce || true
oc start-build notification-service --from-dir=./services/notification-service/ -n ecommerce
echo ""

# Wait for builds to complete
echo "Waiting for builds to complete..."
oc logs -f bc/user-service -n ecommerce || true
oc logs -f bc/product-service -n ecommerce || true
oc logs -f bc/order-service -n ecommerce || true
oc logs -f bc/api-gateway -n ecommerce || true
oc logs -f bc/notification-service -n ecommerce || true
echo ""

# Apply templates
echo "Applying OpenShift templates..."
oc process -f openshift/templates/02-database-template.yaml | oc apply -f -
oc process -f openshift/templates/01-ecommerce-template.yaml | oc apply -f -
echo ""

# Wait for deployments
echo "Waiting for deployments to be ready..."
oc rollout status dc/user-service -n ecommerce || true
oc rollout status dc/api-gateway -n ecommerce || true
echo ""

# Display routes
echo "========================================="
echo "OpenShift Deployment Complete!"
echo "========================================="
echo ""
echo "Routes:"
oc get routes -n ecommerce
echo ""
echo "Services:"
oc get services -n ecommerce
echo ""
echo "Access your application at the route URLs listed above."
