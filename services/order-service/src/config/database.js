const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orderdb',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database');
    
    // Create tables if they don't exist
    await createTables();
    
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

const createTables = async () => {
  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      currency VARCHAR(3) DEFAULT 'USD',
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) DEFAULT 0,
      shipping_amount DECIMAL(10,2) DEFAULT 0,
      discount_amount DECIMAL(10,2) DEFAULT 0,
      total_amount DECIMAL(10,2) NOT NULL,
      email VARCHAR(100),
      phone VARCHAR(20),
      shipping_address JSONB NOT NULL,
      billing_address JSONB,
      notes TEXT,
      payment_status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      tracking_number VARCHAR(100),
      shipped_at TIMESTAMP,
      delivered_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createOrderItemsTable = `
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL,
      variant_id INTEGER,
      product_name VARCHAR(200) NOT NULL,
      variant_title VARCHAR(200),
      sku VARCHAR(100),
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      product_image VARCHAR(500),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createPaymentsTable = `
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      payment_intent_id VARCHAR(100) UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(3) DEFAULT 'USD',
      status VARCHAR(20) DEFAULT 'pending',
      payment_method VARCHAR(50),
      gateway VARCHAR(50),
      gateway_response JSONB,
      failure_reason TEXT,
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createRefundsTable = `
    CREATE TABLE IF NOT EXISTS refunds (
      id SERIAL PRIMARY KEY,
      payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
      amount DECIMAL(10,2) NOT NULL,
      reason TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      refund_id VARCHAR(100),
      gateway_response JSONB,
      processed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createOrdersTable);
    await pool.query(createOrderItemsTable);
    await pool.query(createPaymentsTable);
    await pool.query(createRefundsTable);
    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

module.exports = {
  pool,
  connectDB
};
