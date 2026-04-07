const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, firstName, lastName, phone, address, role = 'customer' } = userData;
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, username, email, first_name, last_name, phone, address, role, is_active, created_at, updated_at
    `;
    
    try {
      const result = await pool.query(query, [username, email, passwordHash, firstName, lastName, phone, address, role]);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        if (error.constraint === 'users_username_key') {
          throw new Error('Username already exists');
        } else if (error.constraint === 'users_email_key') {
          throw new Error('Email already exists');
        }
      }
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT id, username, email, first_name, last_name, phone, address, role, is_active, created_at, updated_at
      FROM users
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name, phone, address, role, is_active, created_at, updated_at
      FROM users
      WHERE email = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT id, username, email, password_hash, first_name, last_name, phone, address, role, is_active, created_at, updated_at
      FROM users
      WHERE username = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { firstName, lastName, phone, address } = userData;
    
    const query = `
      UPDATE users
      SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND is_active = true
      RETURNING id, username, email, first_name, last_name, phone, address, role, is_active, created_at, updated_at
    `;
    
    const result = await pool.query(query, [firstName, lastName, phone, address, id]);
    return result.rows[0];
  }

  static async updatePassword(id, newPassword) {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    const query = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND is_active = true
    `;
    
    await pool.query(query, [passwordHash, id]);
  }

  static async deactivate(id) {
    const query = `
      UPDATE users
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll(limit = 50, offset = 0) {
    const query = `
      SELECT id, username, email, first_name, last_name, phone, address, role, is_active, created_at, updated_at
      FROM users
      WHERE is_active = true
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async count() {
    const query = 'SELECT COUNT(*) FROM users WHERE is_active = true';
    const result = await pool.query(query);
    return parseInt(result.rows[0].count);
  }

  static async search(query, limit = 50, offset = 0) {
    const searchQuery = `
      SELECT id, username, email, first_name, last_name, phone, address, role, is_active, created_at, updated_at
      FROM users
      WHERE is_active = true AND (
        username ILIKE $1 OR 
        email ILIKE $1 OR 
        first_name ILIKE $1 OR 
        last_name ILIKE $1
      )
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(searchQuery, [`%${query}%`, limit, offset]);
    return result.rows;
  }
}

module.exports = User;
