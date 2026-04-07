const express = require('express');
const Joi = require('joi');
const { pool } = require('../config/database');
const Order = require('../models/Order');
const { publishMessage } = require('../config/rabbitmq');
const { metrics } = require('../config/metrics');
const { generateOrderNumber } = require('../utils/orderUtils');

const router = express.Router();
const orderModel = new Order(pool);

// Validation schemas
const createOrderSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  shippingAddress: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address1: Joi.string().required(),
    address2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).required(),
  billingAddress: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    address1: Joi.string().required(),
    address2: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    postalCode: Joi.string().required(),
    country: Joi.string().required()
  }).optional(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.number().integer().required(),
      variantId: Joi.number().integer().optional(),
      productName: Joi.string().required(),
      variantTitle: Joi.string().optional(),
      sku: Joi.string().optional(),
      quantity: Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().positive().required(),
      totalPrice: Joi.number().positive().required(),
      productImage: Joi.string().optional()
    })
  ).min(1).required(),
  subtotal: Joi.number().positive().required(),
  taxAmount: Joi.number().min(0).default(0),
  shippingAmount: Joi.number().min(0).default(0),
  discountAmount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().positive().required(),
  notes: Joi.string().max(1000).optional()
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled').required(),
  trackingNumber: Joi.string().optional()
});

// Create order
router.post('/', async (req, res) => {
  try {
    const { error, value } = createOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    const orderNumber = generateOrderNumber();

    const orderData = {
      ...value,
      orderNumber,
      userId
    };

    const { order, items } = await orderModel.create(orderData);

    // Publish order created event
    await publishMessage('order_created', {
      orderId: order.id,
      orderNumber: order.order_number,
      userId,
      email: order.email,
      totalAmount: order.total_amount,
      items: items.length,
      timestamp: new Date().toISOString()
    });

    metrics.ordersCreated.inc();

    res.status(201).json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
        currency: order.currency,
        createdAt: order.created_at,
        items: items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        }))
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Order Creation Failed',
      message: 'An error occurred while creating the order'
    });
  }
});

// Get order by ID
router.get('/:id', async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Order ID must be a valid integer'
      });
    }

    const result = await orderModel.findById(orderId);

    if (!result) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order not found'
      });
    }

    res.json({
      order: {
        id: result.order.id,
        orderNumber: result.order.order_number,
        status: result.order.status,
        paymentStatus: result.order.payment_status,
        email: result.order.email,
        phone: result.order.phone,
        shippingAddress: result.order.shipping_address,
        billingAddress: result.order.billing_address,
        subtotal: result.order.subtotal,
        taxAmount: result.order.tax_amount,
        shippingAmount: result.order.shipping_amount,
        discountAmount: result.order.discount_amount,
        totalAmount: result.order.total_amount,
        trackingNumber: result.order.tracking_number,
        notes: result.order.notes,
        createdAt: result.order.created_at,
        updatedAt: result.order.updated_at,
        shippedAt: result.order.shipped_at,
        deliveredAt: result.order.delivered_at,
        items: result.items.map(item => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          variantTitle: item.variant_title,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          productImage: item.product_image
        }))
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      error: 'Order Retrieval Failed',
      message: 'An error occurred while retrieving the order'
    });
  }
});

// Get orders by user ID
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User ID is required'
      });
    }

    const result = await orderModel.findByUserId(userId, limit, offset);

    res.json({
      orders: result.rows.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        totalAmount: order.total_amount,
        currency: order.currency,
        createdAt: order.created_at,
        itemCount: 0 // Would need additional query
      })),
      limit,
      offset,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Orders Retrieval Failed',
      message: 'An error occurred while retrieving orders'
    });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { error, value } = updateStatusSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'Order ID must be a valid integer'
      });
    }

    const existingOrder = await orderModel.findById(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        error: 'Order Not Found',
        message: 'Order not found'
      });
    }

    const updateData = { status: value.status };
    
    if (value.status === 'shipped' && value.trackingNumber) {
      updateData.trackingNumber = value.trackingNumber;
      updateData.shippedAt = new Date();
      
      // Publish order shipped event
      await publishMessage('order_shipped', {
        orderId,
        orderNumber: existingOrder.order.order_number,
        trackingNumber: value.trackingNumber,
        email: existingOrder.order.email,
        timestamp: new Date().toISOString()
      });
    }

    if (value.status === 'delivered') {
      updateData.deliveredAt = new Date();
      metrics.ordersCompleted.inc();
    }

    const updatedOrder = await orderModel.updateStatus(orderId, value.status, updateData);

    res.json({
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.order_number,
        status: updatedOrder.status,
        trackingNumber: updatedOrder.tracking_number,
        shippedAt: updatedOrder.shipped_at,
        deliveredAt: updatedOrder.delivered_at,
        updatedAt: updatedOrder.updated_at
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      error: 'Status Update Failed',
      message: 'An error occurred while updating order status'
    });
  }
});

// Get order statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] ? parseInt(req.headers['x-user-id']) : null;
    const stats = await orderModel.getOrderStatistics(userId);

    res.json({
      statistics: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Statistics Retrieval Failed',
      message: 'An error occurred while retrieving statistics'
    });
  }
});

module.exports = router;
