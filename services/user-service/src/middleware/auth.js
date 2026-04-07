const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'No Token',
        message: 'No authorization token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user details to ensure user is still active
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid User',
        message: 'User not found or inactive'
      });
    }

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid Token',
        message: 'Invalid authorization token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Expired Token',
        message: 'Authorization token has expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication Failed',
      message: 'An error occurred during authentication'
    });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Admin access required'
    });
  }
  next();
};

const vendorMiddleware = (req, res, next) => {
  if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Vendor or admin access required'
    });
  }
  next();
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);
      
      if (user) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role
        };
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid or expired, just continue without user info
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  vendorMiddleware,
  optionalAuthMiddleware
};
