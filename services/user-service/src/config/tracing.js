const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

let sdk;

const initializeTracing = (serviceName) => {
  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
    instrumentations: [getNodeAutoInstrumentations()],
    // Configure exporter based on environment
    // For development, we'll use console exporter
    // In production, you'd configure Jaeger or OTLP exporter
  });

  sdk.start();
  console.log(`Tracing initialized for ${serviceName}`);
};

const shutdownTracing = async () => {
  if (sdk) {
    await sdk.shutdown();
    console.log('Tracing shutdown completed');
  }
};

// Graceful shutdown
process.on('SIGTERM', shutdownTracing);
process.on('SIGINT', shutdownTracing);

module.exports = {
  initializeTracing,
  shutdownTracing
};
