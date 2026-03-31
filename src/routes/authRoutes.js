const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 8
 *               displayName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 */
router.post(
  '/signup',
  createRateLimiter('general'),
  validate({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string', minLength: 8 },
  }),
  authController.signup
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to your account
 *     tags: [Auth]
 */
router.post(
  '/login',
  createRateLimiter('general'),
  validate({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/refresh', authController.refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout
 *     tags: [Auth]
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;
