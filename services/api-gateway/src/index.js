const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const { authMiddleware } = require('./middleware/auth');
const { initializeMetrics, trackHttpRequests } = require('./config/metrics');
const { initializeTracing } = require('./config/tracing');

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize tracing and metrics
initializeTracing('api-gateway');
initializeMetrics();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Track HTTP requests for metrics
app.use(trackHttpRequests);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  const { register } = require('./config/metrics');
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Service URLs from environment variables
const SERVICE_URLS = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:8081',
  product: process.env.PRODUCT_SERVICE_URL || 'http://product-service:8082',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:8083',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:8084'
};

// Proxy middleware options
const proxyOptions = {
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'The requested service is currently unavailable'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forward user info from JWT token if available
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.userId);
      proxyReq.setHeader('x-user-email', req.user.email);
      proxyReq.setHeader('x-user-role', req.user.role);
    }
  }
};

// Auth routes (public)
app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.user,
  pathRewrite: { '^/api/auth': '/api/auth' }
}));

// User service routes (protected)
app.use('/api/users', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.user,
  pathRewrite: { '^/api/users': '/api/users' }
}));

// Product service routes
app.use('/api/products', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.product,
  pathRewrite: { '^/api/products': '/api/products' }
}));

app.use('/api/categories', createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.product,
  pathRewrite: { '^/api/categories': '/api/categories' }
}));

// Order service routes (protected)
app.use('/api/orders', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.order,
  pathRewrite: { '^/api/orders': '/api/orders' }
}));

app.use('/api/payments', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.order,
  pathRewrite: { '^/api/payments': '/api/payments' }
}));

// Notification service routes (protected)
app.use('/api/notifications', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: SERVICE_URLS.notification,
  pathRewrite: { '^/api/notifications': '/api/notifications' }
}));

// API documentation
app.get('/api/docs', (req, res) => {
  res.json({
    message: 'API Documentation',
    services: {
      user: '/api/users',
      product: '/api/products',
      order: '/api/orders',
      notification: '/api/notifications'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint was not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API Documentation: http://localhost:${PORT}/api/docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
