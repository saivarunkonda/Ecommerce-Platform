const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_default');
const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const { publishMessage } = require('../config/rabbitmq');
const { metrics } = require('../config/metrics');

const router = express.Router();

const createPaymentSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  paymentMethod: Joi.string().valid('card', 'paypal', 'stripe').required(),
  token: Joi.string().required()
});

const createPaymentIntentSchema = Joi.object({
  orderId: Joi.number().integer().required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).default('USD')
});

// Create payment intent
router.post('/intent', async (req, res) => {
  try {
    const { error, value } = createPaymentIntentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { orderId, amount, currency } = value;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        orderId: orderId.toString()
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      error: 'Payment Intent Failed',
      message: error.message
    });
  }
});

// Confirm payment
router.post('/confirm', async (req, res) => {
  try {
    const { error, value } = createPaymentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { orderId, paymentMethod, token } = value;

    // Get order details
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const orderResult = await pool.query(orderQuery, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Create payment record
    const paymentQuery = `
      INSERT INTO payments (order_id, amount, currency, payment_method, gateway, status)
      VALUES ($1, $2, $3, $4, $5, 'processing')
      RETURNING *
    `;

    const paymentResult = await pool.query(paymentQuery, [
      orderId,
      order.total_amount,
      order.currency,
      paymentMethod,
      'stripe'
    ]);

    const payment = paymentResult.rows[0];

    try {
      // Process payment with Stripe
      const charge = await stripe.charges.create({
        amount: Math.round(order.total_amount * 100),
        currency: order.currency.toLowerCase(),
        source: token,
        description: `Order #${order.order_number}`
      });

      // Update payment record
      const updatePaymentQuery = `
        UPDATE payments 
        SET payment_intent_id = $1, status = 'completed', gateway_response = $2, processed_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;

      await pool.query(updatePaymentQuery, [
        charge.id,
        JSON.stringify(charge),
        payment.id
      ]);

      // Update order payment status
      const updateOrderQuery = `
        UPDATE orders SET payment_status = 'paid', status = 'confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      await pool.query(updateOrderQuery, [orderId]);

      // Publish payment processed event
      await publishMessage('payment_processed', {
        orderId,
        paymentId: payment.id,
        amount: order.total_amount,
        status: 'completed',
        email: order.email,
        timestamp: new Date().toISOString()
      });

      metrics.paymentSuccess.inc();

      res.json({
        success: true,
        payment: {
          id: payment.id,
          status: 'completed',
          amount: order.total_amount,
          currency: order.currency
        }
      });
    } catch (stripeError) {
      // Update payment record with failure
      const updatePaymentQuery = `
        UPDATE payments 
        SET status = 'failed', failure_reason = $1, gateway_response = $2
        WHERE id = $3
      `;

      await pool.query(updatePaymentQuery, [
        stripeError.message,
        JSON.stringify(stripeError),
        payment.id
      ]);

      metrics.paymentFailure.inc();

      res.status(400).json({
        error: 'Payment Failed',
        message: stripeError.message
      });
    }
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({
      error: 'Payment Processing Failed',
      message: 'An error occurred while processing the payment'
    });
  }
});

// Webhook for Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed', failedPayment.id);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Get payment by order ID
router.get('/order/:orderId', async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId);

    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Order ID must be a valid integer'
      });
    }

    const query = 'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [orderId]);

    res.json({
      payments: result.rows
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({
      error: 'Payments Retrieval Failed',
      message: 'An error occurred while retrieving payments'
    });
  }
});

module.exports = router;
