# E-Commerce Platform - Deployment Guide

## 🚀 Quick Start

### Local Development (Docker Compose)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes Deployment

```bash
# Deploy all components
chmod +x scripts/deploy-all.sh
./scripts/deploy-all.sh

# Or deploy manually
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/services/
kubectl apply -f kubernetes/deployments/
kubectl apply -f istio/
```

### OpenShift Deployment

```bash
# Create project
oc new-project ecommerce

# Apply OpenShift templates
oc process -f openshift/templates/01-ecommerce-template.yaml | oc apply -f -
oc apply -f openshift/templates/02-routes.yaml
```

## 📊 Monitoring

### Access Monitoring Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger Tracing**: http://localhost:16686
- **RabbitMQ Management**: http://localhost:15672 (admin/password)

## 🔧 Configuration

### Environment Variables

Update the following files with your actual credentials:

- `kubernetes/secrets/01-secrets.yaml` - Database passwords and API keys
- `kubernetes/configmaps/01-configmaps.yaml` - Service configurations
- `.env` files in each service directory

### Database Initialization

```bash
# Run database migrations
cd services/user-service
npm run migrate

cd ../product-service
npm run migrate

cd ../order-service
npm run migrate
```

## 🛠️ Troubleshooting

### Check Service Status

```bash
# Kubernetes
kubectl get pods -n ecommerce
kubectl logs -f deployment/user-service -n ecommerce

# Docker Compose
docker-compose ps
docker-compose logs user-service
```

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check database URLs in ConfigMaps
3. **Service discovery**: Verify Kubernetes Services are created
4. **Memory issues**: Adjust resource limits in deployments

## 📝 Notes

- All services are configured with health checks
- Automatic restarts are enabled
- Horizontal Pod Autoscaling can be enabled
- Istio provides traffic management and security
- Monitoring and logging are pre-configured

## 🔒 Security

- Secrets are stored in Kubernetes Secrets
- TLS termination is configured
- Network policies can be added for additional security
- RBAC is configured for service accounts
