const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/auth');
const { metrics } = require('../config/metrics');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(50).optional(),
  lastName: Joi.string().min(1).max(50).optional(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  address: Joi.string().max(500).optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
});

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile Retrieval Failed',
      message: 'An error occurred while retrieving profile'
    });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *               address:
 *                 type: string
 *                 example: 123 Main St, City, Country
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const updatedUser = await User.update(req.user.userId, value);
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User profile not found'
      });
    }

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      firstName: updatedUser.first_name,
      lastName: updatedUser.last_name,
      phone: updatedUser.phone,
      address: updatedUser.address,
      role: updatedUser.role,
      isActive: updatedUser.is_active,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Profile Update Failed',
      message: 'An error occurred while updating profile'
    });
  }
});

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: newPassword123!
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.details[0].message
      });
    }

    const { currentPassword, newPassword } = value;

    // Get user with password hash
    const user = await User.findByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await User.validatePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Invalid Password',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    await User.updatePassword(req.user.userId, newPassword);

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password Change Failed',
      message: 'An error occurred while changing password'
    });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of users to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of users to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, email, or name
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search;

    let users;
    let total;

    if (search) {
      users = await User.search(search, limit, offset);
      // For simplicity, we'll use the total count without search filter
      total = await User.count();
    } else {
      users = await User.findAll(limit, offset);
      total = await User.count();
    }

    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    }));

    res.json({
      users: formattedUsers,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Users Retrieval Failed',
      message: 'An error occurred while retrieving users'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/:id', adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'User ID must be a valid integer'
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'User Retrieval Failed',
      message: 'An error occurred while retrieving user'
    });
  }
});

/**
 * @swagger
 * /api/users/{id}/deactivate:
 *   put:
 *     summary: Deactivate user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Forbidden - Admin access required
 */
router.put('/:id/deactivate', adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        message: 'User ID must be a valid integer'
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User Not Found',
        message: 'User not found'
      });
    }

    // Deactivate user
    await User.deactivate(userId);

    res.json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      error: 'User Deactivation Failed',
      message: 'An error occurred while deactivating user'
    });
  }
});

module.exports = router;
