const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Dashboard overview stats
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/dashboard',
  authenticate,
  createRateLimiter('analytics'),
  analyticsController.getDashboardStats
);

/**
 * @swagger
 * /api/analytics/{id}:
 *   get:
 *     summary: Analytics for a specific link
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id',
  authenticate,
  createRateLimiter('analytics'),
  analyticsController.getLinkAnalytics
);

/**
 * @swagger
 * /api/analytics/{id}/timeseries:
 *   get:
 *     summary: Time-series click data
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:id/timeseries',
  authenticate,
  createRateLimiter('analytics'),
  analyticsController.getTimeSeries
);

module.exports = router;
