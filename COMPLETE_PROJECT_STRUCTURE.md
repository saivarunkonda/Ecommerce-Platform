# E-commerce Microservices Platform - Complete Project

## Project Structure Overview

```
Project2/
├── README.md                          # Main project documentation
├── PROJECT_SUMMARY.md               # Detailed project summary
├── package.json                     # Root package.json with orchestration scripts
├── docker-compose.yml                 # Local development infrastructure
│
├── services/                        # Backend Microservices
│   ├── user-service/               # Port 8081 - Authentication & User Management
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/
│   │       │   ├── database.js
│   │       │   ├── metrics.js
│   │       │   ├── tracing.js
│   │       │   └── swagger.js
│   │       ├── models/
│   │       │   └── User.js
│   │       ├── routes/
│   │       │   ├── auth.js
│   │       │   └── users.js
│   │       └── middleware/
│   │           └── auth.js
│   │
│   ├── product-service/            # Port 8082 - Product Catalog & Inventory
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/
│   │       ├── models/
│   │       ├── routes/
│   │       └── middleware/
│   │
│   ├── order-service/              # Port 8083 - Order Processing & Payments
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/
│   │       ├── models/
│   │       ├── routes/
│   │       └── utils/
│   │
│   ├── api-gateway/                # Port 8080 - API Gateway & Routing
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.js
│   │       ├── config/
│   │       └── middleware/
│   │
│   └── notification-service/       # Port 8084 - Email & SMS Notifications
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│           ├── index.js
│           ├── config/
│           └── services/
│
├── frontend/                       # React Frontend Application
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       │   └── axios.js
│       ├── store/
│       │   ├── authStore.js
│       │   └── cartStore.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── ProtectedRoute.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Products.jsx
│           ├── ProductDetail.jsx
│           ├── Cart.jsx
│           ├── Checkout.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── Profile.jsx
│           ├── Orders.jsx
│           └── OrderDetail.jsx
│
├── kubernetes/                     # Kubernetes Manifests
│   ├── namespaces/
│   │   └── 01-ecommerce.yaml
│   ├── secrets/
│   │   └── 01-secrets.yaml
│   ├── configmaps/
│   │   └── 01-configmaps.yaml
│   └── deployments/
│       ├── 01-user-service.yaml
│       ├── 02-product-service.yaml
│       ├── 03-order-service.yaml
│       ├── 04-api-gateway.yaml
│       ├── 05-notification-service.yaml
│       └── 06-frontend.yaml
│
├── istio/                          # Istio Service Mesh Configuration
│   ├── gateways/
│   │   └── 01-ecommerce-gateway.yaml
│   ├── virtual-services/
│   │   ├── 01-api-gateway.yaml
│   │   ├── 02-user-service.yaml
│   │   ├── 03-product-service.yaml
│   │   └── 04-order-service.yaml
│   ├── destination-rules/
│   │   ├── 01-user-service.yaml
│   │   ├── 02-product-service.yaml
│   │   └── 03-order-service.yaml
│   ├── peer-authentication.yaml
│   └── authorization-policy.yaml
│
├── openshift/                      # OpenShift Templates
│   ├── templates/
│   │   ├── 01-ecommerce-template.yaml
│   │   └── 02-database-template.yaml
│   └── routes/
│
├── monitoring/                     # Monitoring Configuration
│   ├── prometheus.yml
│   ├── grafana-datasources.yaml
│   └── alerts.yml
│
└── scripts/                        # Deployment Scripts
    ├── deploy-k8s.sh
    ├── deploy-openshift.sh
    └── setup-local.bat
```

## Complete Feature Set

### Backend Services (Microservices Architecture)

#### 1. User Service (Port 8081)
- **Features**:
  - JWT-based authentication
  - User registration and login
  - Profile management
  - Password change functionality
  - Role-based access control (RBAC)
  - Rate limiting on auth endpoints
  - Prometheus metrics
  - OpenTelemetry tracing
- **Database**: PostgreSQL (userdb)
- **Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/verify`
  - `GET /api/users/profile`
  - `PUT /api/users/profile`
  - `PUT /api/users/change-password`

#### 2. Product Service (Port 8082)
- **Features**:
  - Product catalog management
  - Category management
  - Product variants
  - Inventory tracking
  - Redis caching
  - Product reviews and ratings
  - Search functionality
  - Image management
- **Database**: PostgreSQL (productdb)
- **Cache**: Redis
- **Endpoints**:
  - `GET /api/products`
  - `GET /api/products/:id`
  - `GET /api/categories`

#### 3. Order Service (Port 8083)
- **Features**:
  - Order creation and management
  - Order status tracking
  - Stripe payment integration
  - Payment intent creation
  - Webhook handling
  - RabbitMQ message publishing
  - Order statistics and reporting
- **Database**: PostgreSQL (orderdb)
- **Integrations**: Stripe, RabbitMQ
- **Endpoints**:
  - `POST /api/orders`
  - `GET /api/orders/:id`
  - `POST /api/payments/intent`
  - `POST /api/payments/confirm`

#### 4. API Gateway (Port 8080)
- **Features**:
  - Request routing to microservices
  - JWT token validation
  - Rate limiting
  - Load balancing
  - Prometheus metrics
  - Health checks
- **Integrations**: All backend services

#### 5. Notification Service (Port 8084)
- **Features**:
  - Email notifications (SMTP/Nodemailer)
  - SMS notifications (Twilio)
  - RabbitMQ message consumption
  - Order confirmation emails
  - Payment confirmation emails
  - Shipping notification emails
- **Integrations**: RabbitMQ, SMTP, Twilio

### Frontend Application (React + Vite)

#### Technology Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Yup validation
- **Payment**: Stripe React Integration
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

#### Pages
1. **Home** - Featured products, hero section
2. **Products** - Product listing with search and filters
3. **ProductDetail** - Product details with add to cart
4. **Cart** - Shopping cart management
5. **Checkout** - Payment form with Stripe integration
6. **Login** - User authentication
7. **Register** - User registration
8. **Profile** - User profile management
9. **Orders** - Order history
10. **OrderDetail** - Order details and tracking

#### Features
- Responsive design
- JWT authentication flow
- Shopping cart with localStorage persistence
- Stripe payment integration
- Form validation
- Toast notifications
- Protected routes
- API integration with Axios interceptors

### Infrastructure & DevOps

#### Container Orchestration (Kubernetes)
- Namespace isolation
- ConfigMaps for configuration
- Secrets for sensitive data
- Deployments with health checks
- Services (ClusterIP, LoadBalancer)
- Resource limits and requests
- Security contexts (non-root containers)
- HPA (Horizontal Pod Autoscaler) ready

#### Service Mesh (Istio)
- Ingress Gateway
- Virtual Services for routing
- Destination Rules with circuit breakers
- mTLS (mutual TLS) for service-to-service communication
- Authorization policies
- Traffic management (retries, timeouts)

#### OpenShift Support
- DeploymentConfigs
- Routes with edge termination
- Templates with parameters
- BuildConfigs for CI/CD
- Persistent Volume Claims

#### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Jaeger**: Distributed tracing
- **Alerting**: Prometheus alert rules

#### Infrastructure Services
- **PostgreSQL**: 3 databases (userdb, productdb, orderdb)
- **Redis**: Caching and session management
- **RabbitMQ**: Message queuing

### Deployment Options

1. **Local Development**
   ```bash
   docker-compose up -d
   npm run dev
   ```

2. **Kubernetes**
   ```bash
   ./scripts/deploy-k8s.sh
   ```

3. **OpenShift**
   ```bash
   ./scripts/deploy-openshift.sh
   ```

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- mTLS between services (Istio)
- Network policies
- Security contexts (non-root containers, read-only filesystem)
- Secrets management
- Rate limiting
- Input validation (Joi/Yup)
- Helmet.js for HTTP security headers
- CORS configuration

## API Documentation

Each service includes OpenAPI/Swagger documentation at `/api-docs.json`

## Getting Started

### Prerequisites
- Node.js 18+
- Docker
- Kubernetes cluster (for k8s deployment)
- OpenShift cluster (for OpenShift deployment)
- kubectl and istioctl (for Istio features)

### Quick Start

```bash
# Clone and setup
cd Project2

# Install dependencies
npm install

# Start infrastructure
docker-compose up -d

# Run all services
npm run dev
```

### Access Points
- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:8080
- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **RabbitMQ**: http://localhost:15672

## Production Considerations

1. Update all secrets with production values
2. Configure proper TLS certificates
3. Set up persistent storage for databases
4. Configure backup strategies
5. Set up proper logging aggregation (ELK stack)
6. Configure monitoring alerts
7. Implement proper CI/CD pipelines
8. Configure autoscaling (HPA/VPA)
9. Set up DDoS protection
10. Configure CDN for static assets

## License

MIT License

---

**Built with**: Node.js, React, PostgreSQL, Redis, RabbitMQ, Kubernetes, Istio, OpenShift, Docker, Prometheus, Grafana, Jaeger
