const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'product-service'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Create custom metrics
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

const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const productsTotal = new client.Gauge({
  name: 'products_total',
  help: 'Total number of products'
});

const categoriesTotal = new client.Gauge({
  name: 'categories_total',
  help: 'Total number of categories'
});

const productViews = new client.Counter({
  name: 'product_views_total',
  help: 'Total number of product views',
  labelNames: ['product_id']
});

const searchesTotal = new client.Counter({
  name: 'searches_total',
  help: 'Total number of product searches',
  labelNames: ['query_type']
});

const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits'
});

const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses'
});

// Register the custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnections);
register.registerMetric(productsTotal);
register.registerMetric(categoriesTotal);
register.registerMetric(productViews);
register.registerMetric(searchesTotal);
register.registerMetric(cacheHits);
register.registerMetric(cacheMisses);

const initializeMetrics = () => {
  console.log('Metrics initialized');
};

// Middleware to track HTTP requests
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
    activeConnections,
    databaseConnections,
    productsTotal,
    categoriesTotal,
    productViews,
    searchesTotal,
    cacheHits,
    cacheMisses
  }
};
