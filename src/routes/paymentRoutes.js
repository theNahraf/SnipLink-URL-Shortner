const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

/**
 * @swagger
 * /api/payments/create-subscription:
 *   post:
 *     summary: Create a subscription
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planType]
 *             properties:
 *               planType:
 *                 type: string
 *                 enum: [pro, business]
 *     responses:
 *       200:
 *         description: Subscription created
 */
router.post(
  '/create-subscription',
  authenticate,
  validate({
    planType: { required: true, type: 'string', enum: ['pro', 'business'] },
  }),
  paymentController.createSubscription
);

// Mock upgrade for testing UI
router.post(
  '/mock-upgrade',
  authenticate,
  validate({
    planType: { required: true, type: 'string', enum: ['pro', 'business'] },
  }),
  paymentController.mockUpgrade
);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Razorpay webhook handler
 *     tags: [Payments]
 */
router.post('/webhook', paymentController.handleWebhook);

/**
 * @swagger
 * /api/payments/status:
 *   get:
 *     summary: Get subscription status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/status', authenticate, paymentController.getSubscriptionStatus);

module.exports = router;
