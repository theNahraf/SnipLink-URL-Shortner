const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * JWT Authentication Middleware
 * Extracts token from Authorization header or cookies
 * Attaches decoded user to req.user
 */
function authenticate(req, res, next) {
  let token = null;

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fallback to cookie
  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please provide a valid token.',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      plan_type: decoded.plan_type,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please refresh your token.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Invalid token.',
    });
  }
}

/**
 * Optional auth — attaches user if token present, but doesn't block
 */
function optionalAuth(req, res, next) {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.cookies && req.cookies.access_token) {
    token = req.cookies.access_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        plan_type: decoded.plan_type,
      };
    } catch {
      // Silently ignore invalid tokens for optional auth
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
}

module.exports = { authenticate, optionalAuth };
