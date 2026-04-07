const client = require('prom-client');

const register = new client.Registry();
register.setDefaultLabels({ app: 'api-gateway' });
client.collectDefaultMetrics({ register });

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
});

const upstreamErrors = new client.Counter({
  name: 'upstream_errors_total',
  help: 'Total number of upstream service errors',
  labelNames: ['service', 'error_type']
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(upstreamErrors);

const initializeMetrics = () => {
  console.log('Metrics initialized');
};

const trackHttpRequests = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    const service = req.baseUrl?.split('/')[2] || 'unknown';
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode, service)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode, service)
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
    upstreamErrors
  }
};
