const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ app: 'order-service' });
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const ordersCreated = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created'
});

const ordersCompleted = new client.Counter({
  name: 'orders_completed_total',
  help: 'Total number of orders completed'
});

const paymentSuccess = new client.Counter({
  name: 'payment_success_total',
  help: 'Total number of successful payments'
});

const paymentFailure = new client.Counter({
  name: 'payment_failure_total',
  help: 'Total number of failed payments'
});

const ordersByStatus = new client.Gauge({
  name: 'orders_by_status',
  help: 'Number of orders by status',
  labelNames: ['status']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(ordersCreated);
register.registerMetric(ordersCompleted);
register.registerMetric(paymentSuccess);
register.registerMetric(paymentFailure);
register.registerMetric(ordersByStatus);

const initializeMetrics = () => {
  console.log('Metrics initialized');
};

const trackHttpRequests = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
};

module.exports = {
  register,
  initializeMetrics,
  trackHttpRequests,
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    ordersCreated,
    ordersCompleted,
    paymentSuccess,
    paymentFailure,
    ordersByStatus
  }
};
