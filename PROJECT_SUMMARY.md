# E-commerce Microservices Platform

A comprehensive e-commerce platform demonstrating enterprise-grade microservices architecture with Kubernetes, OpenShift, and Istio service mesh.

## Project Overview

This project implements a real-world e-commerce system with 5 microservices, showcasing modern cloud-native patterns including service mesh, distributed tracing, circuit breakers, and canary deployments.

## Architecture

### Microservices

1. **API Gateway** (Port 8080) - Entry point with routing, authentication, and rate limiting
2. **User Service** (Port 8081) - Authentication, user management, JWT tokens
3. **Product Service** (Port 8082) - Product catalog, categories, inventory, caching
4. **Order Service** (Port 8083) - Order processing, payments with Stripe, notifications
5. **Notification Service** (Port 8084) - Email (SMTP) and SMS (Twilio) notifications

### Infrastructure

- **PostgreSQL** - Persistent storage for each service
- **Redis** - Distributed caching and session management
- **RabbitMQ** - Asynchronous messaging between services
- **Prometheus** - Metrics collection
- **Grafana** - Visualization and dashboards
- **Jaeger** - Distributed tracing

### Kubernetes & OpenShift Features

- Namespace isolation with resource quotas
- ConfigMaps and Secrets management
- Health checks (liveness/readiness probes)
- Horizontal Pod Autoscaling
- Service mesh with Istio (mTLS, traffic management)
- Network policies and security contexts
- OpenShift Routes with edge termination

## Quick Start

### Local Development

```bash
# Install dependencies for all services
npm install

# Start infrastructure (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Run all services
npm run dev
```

### Kubernetes Deployment

```bash
# Build and deploy to Kubernetes
chmod +x scripts/deploy-k8s.sh
./scripts/deploy-k8s.sh

# Or manually:
kubectl apply -f kubernetes/namespaces/
kubectl apply -f kubernetes/secrets/
kubectl apply -f kubernetes/configmaps/
kubectl apply -f kubernetes/deployments/
kubectl apply -f istio/gateways/
kubectl apply -f istio/virtual-services/
kubectl apply -f istio/destination-rules/
```

### OpenShift Deployment

```bash
# Deploy to OpenShift
chmod +x scripts/deploy-openshift.sh
./scripts/deploy-openshift.sh

# Or manually:
oc new-project ecommerce
oc process -f openshift/templates/02-database-template.yaml | oc apply -f -
oc process -f openshift/templates/01-ecommerce-template.yaml | oc apply -f -
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/change-password` - Change password

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `GET /api/categories` - List categories

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - List user orders
- `PATCH /api/orders/:id/status` - Update order status

### Payments
- `POST /api/payments/intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment

## Monitoring

Access monitoring tools at:
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **RabbitMQ Management**: http://localhost:15672 (admin/password)

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- mTLS between services (Istio)
- Network policies
- Security contexts (non-root containers)
- Secrets management
- Rate limiting

## Development

Each service can be developed independently:

```bash
cd services/user-service
npm run dev
```

Environment variables are defined in `.env.example` files for each service.

## Production Considerations

1. Update all secrets in `kubernetes/secrets/`
2. Configure proper TLS certificates
3. Set up persistent storage for databases
4. Configure backup strategies
5. Set up proper logging aggregation
6. Configure alerting rules
7. Implement proper CI/CD pipelines

## Architecture Diagram

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │    (Istio)      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  User Service  │  │ Product Service│  │  Order Service │
│   (Port 8081)  │  │   (Port 8082)  │  │   (Port 8083)  │
└────────┬───────┘  └────────┬───────┘  └────────┬───────┘
         │                   │                   │
         │          ┌────────┴────────┐         │
         │          │                 │         │
         ▼          ▼                 ▼         ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│  PostgreSQL    │  │     Redis      │  │    RabbitMQ    │
│  (User DB)     │  │    (Cache)     │  │  (Messaging)   │
└────────────────┘  └────────────────┘  └────────────────┘
                                             │
                                             ▼
                                    ┌────────────────┐
                                    │ Notification   │
                                    │   Service      │
                                    │ (Port 8084)    │
                                    └────────────────┘
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
