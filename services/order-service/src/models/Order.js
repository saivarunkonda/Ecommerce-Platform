class Order {
  constructor(pool) {
    this.pool = pool;
  }

  async create(orderData) {
    const {
      orderNumber,
      userId,
      email,
      phone,
      shippingAddress,
      billingAddress,
      subtotal,
      taxAmount = 0,
      shippingAmount = 0,
      discountAmount = 0,
      totalAmount,
      notes,
      items
    } = orderData;

    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const orderQuery = `
        INSERT INTO orders (order_number, user_id, email, phone, shipping_address, billing_address, 
                           subtotal, tax_amount, shipping_amount, discount_amount, total_amount, notes, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending')
        RETURNING *
      `;

      const orderResult = await client.query(orderQuery, [
        orderNumber,
        userId,
        email,
        phone,
        JSON.stringify(shippingAddress),
        billingAddress ? JSON.stringify(billingAddress) : null,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        notes
      ]);

      const order = orderResult.rows[0];

      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_title, sku, 
                                quantity, unit_price, total_price, product_image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      const orderItems = [];
      for (const item of items) {
        const itemResult = await client.query(itemQuery, [
          order.id,
          item.productId,
          item.variantId || null,
          item.productName,
          item.variantTitle || null,
          item.sku || null,
          item.quantity,
          item.unitPrice,
          item.totalPrice,
          item.productImage || null
        ]);
        orderItems.push(itemResult.rows[0]);
      }

      await client.query('COMMIT');

      return { order, items: orderItems };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const orderQuery = 'SELECT * FROM orders WHERE id = $1';
    const itemsQuery = 'SELECT * FROM order_items WHERE order_id = $1';

    const [orderResult, itemsResult] = await Promise.all([
      this.pool.query(orderQuery, [id]),
      this.pool.query(itemsQuery, [id])
    ]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    return {
      order: orderResult.rows[0],
      items: itemsResult.rows
    };
  }

  async findByOrderNumber(orderNumber) {
    const orderQuery = 'SELECT * FROM orders WHERE order_number = $1';
    const itemsQuery = `
      SELECT * FROM order_items WHERE order_id = (
        SELECT id FROM orders WHERE order_number = $1
      )
    `;

    const [orderResult, itemsResult] = await Promise.all([
      this.pool.query(orderQuery, [orderNumber]),
      this.pool.query(itemsQuery, [orderNumber])
    ]);

    if (orderResult.rows.length === 0) {
      return null;
    }

    return {
      order: orderResult.rows[0],
      items: itemsResult.rows
    };
  }

  async findByUserId(userId, limit = 50, offset = 0) {
    const orderQuery = `
      SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3
    `;

    return await this.pool.query(orderQuery, [userId, limit, offset]);
  }

  async updateStatus(id, status, additionalData = {}) {
    const { trackingNumber, shippedAt, deliveredAt } = additionalData;

    const query = `
      UPDATE orders 
      SET status = $1, 
          tracking_number = COALESCE($2, tracking_number),
          shipped_at = COALESCE($3, shipped_at),
          delivered_at = COALESCE($4, delivered_at),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;

    const result = await this.pool.query(query, [status, trackingNumber, shippedAt, deliveredAt, id]);
    return result.rows[0];
  }

  async updatePaymentStatus(id, paymentStatus) {
    const query = `
      UPDATE orders 
      SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.pool.query(query, [paymentStatus, id]);
    return result.rows[0];
  }

  async getOrderStatistics(userId = null) {
    const query = userId 
      ? `SELECT status, COUNT(*) FROM orders WHERE user_id = $1 GROUP BY status`
      : `SELECT status, COUNT(*) FROM orders GROUP BY status`;

    const params = userId ? [userId] : [];
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getSalesReport(startDate, endDate) {
    const query = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(total_amount) as revenue,
        AVG(total_amount) as average_order_value
      FROM orders 
      WHERE created_at BETWEEN $1 AND $2 AND status = 'completed'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return await this.pool.query(query, [startDate, endDate]);
  }
}

module.exports = Order;
