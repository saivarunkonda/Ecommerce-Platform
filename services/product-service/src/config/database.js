const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'productdb',
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
  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      description TEXT,
      parent_id INTEGER REFERENCES categories(id),
      image_url VARCHAR(500),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProductsTable = `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      compare_price DECIMAL(10,2),
      sku VARCHAR(100) UNIQUE NOT NULL,
      barcode VARCHAR(50),
      track_inventory BOOLEAN DEFAULT true,
      inventory_quantity INTEGER DEFAULT 0,
      weight DECIMAL(8,2),
      dimensions JSONB,
      category_id INTEGER REFERENCES categories(id),
      vendor_id INTEGER,
      status VARCHAR(20) DEFAULT 'active',
      tags TEXT[],
      images JSONB,
      seo_title VARCHAR(200),
      seo_description TEXT,
      is_featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProductVariantsTable = `
    CREATE TABLE IF NOT EXISTS product_variants (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      sku VARCHAR(100) UNIQUE,
      price DECIMAL(10,2) NOT NULL,
      compare_price DECIMAL(10,2),
      inventory_quantity INTEGER DEFAULT 0,
      weight DECIMAL(8,2),
      option1 VARCHAR(100),
      option2 VARCHAR(100),
      option3 VARCHAR(100),
      image_url VARCHAR(500),
      position INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createProductReviewsTable = `
    CREATE TABLE IF NOT EXISTS product_reviews (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      title VARCHAR(200),
      content TEXT,
      is_verified_purchase BOOLEAN DEFAULT false,
      is_approved BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createCategoriesTable);
    await pool.query(createProductsTable);
    await pool.query(createProductVariantsTable);
    await pool.query(createProductReviewsTable);
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
