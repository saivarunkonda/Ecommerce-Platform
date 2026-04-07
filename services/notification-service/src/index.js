const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { initializeMetrics } = require('./config/metrics');
const { initializeTracing } = require('./config/tracing');
const { connectRabbitMQ, consumeMessage } = require('./config/rabbitmq');
const { sendEmail } = require('./services/emailService');
const { sendSMS } = require('./services/smsService');

const app = express();
const PORT = process.env.PORT || 8084;

initializeTracing('notification-service');
initializeMetrics();

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Consume messages from RabbitMQ
const setupMessageConsumers = async () => {
  try {
    await connectRabbitMQ();

    // Order created notifications
    await consumeMessage('order_created', async (message) => {
      console.log('Processing order created notification:', message);
      
      // Send order confirmation email
      await sendEmail({
        to: message.email,
        subject: `Order Confirmation - ${message.orderNumber}`,
        template: 'order-confirmation',
        data: {
          orderNumber: message.orderNumber,
          totalAmount: message.totalAmount,
          items: message.items
        }
      });
    });

    // Payment processed notifications
    await consumeMessage('payment_processed', async (message) => {
      console.log('Processing payment notification:', message);
      
      await sendEmail({
        to: message.email,
        subject: `Payment ${message.status === 'completed' ? 'Successful' : 'Failed'}`,
        template: 'payment-confirmation',
        data: {
          orderId: message.orderId,
          amount: message.amount,
          status: message.status
        }
      });
    });

    // Order shipped notifications
    await consumeMessage('order_shipped', async (message) => {
      console.log('Processing shipping notification:', message);
      
      await sendEmail({
        to: message.email,
        subject: `Your Order ${message.orderNumber} Has Shipped`,
        template: 'shipping-confirmation',
        data: {
          orderNumber: message.orderNumber,
          trackingNumber: message.trackingNumber
        }
      });

      // Optionally send SMS for shipping updates
      if (message.phone) {
        await sendSMS({
          to: message.phone,
          message: `Your order ${message.orderNumber} has shipped! Track it here: ${message.trackingNumber}`
        });
      }
    });

  } catch (error) {
    console.error('Error setting up message consumers:', error);
  }
};

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Notification Service running on port ${PORT}`);
  await setupMessageConsumers();
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
