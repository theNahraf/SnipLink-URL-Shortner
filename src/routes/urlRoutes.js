const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { createRateLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validator');

/**
 * @swagger
 * /api/shorten:
 *   post:
 *     summary: Shorten a URL
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 description: The long URL to shorten
 *               customAlias:
 *                 type: string
 *                 description: Custom short code (Pro+ only)
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               oneTime:
 *                 type: boolean
 *               password:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: URL shortened successfully
 */
router.post(
  '/shorten',
  optionalAuth,
  createRateLimiter('shorten'),
  validate({
    url: { required: true, type: 'string' },
  }),
  urlController.shortenUrl
);

/**
 * @swagger
 * /api/links:
 *   get:
 *     summary: List user's links
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of links
 */
router.get('/links', authenticate, urlController.getUserLinks);

/**
 * @swagger
 * /api/links/{id}:
 *   get:
 *     summary: Get a single link
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/links/:id', authenticate, urlController.getLinkById);

/**
 * @swagger
 * /api/links/{id}:
 *   put:
 *     summary: Update a link
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 */
router.put('/links/:id', authenticate, urlController.updateLink);

/**
 * @swagger
 * /api/links/{id}:
 *   delete:
 *     summary: Delete a link
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/links/:id', authenticate, urlController.deleteLink);

/**
 * @swagger
 * /api/links/{id}/qr:
 *   get:
 *     summary: Get QR code for a link
 *     tags: [URLs]
 *     security:
 *       - bearerAuth: []
 */
router.get('/links/:id/qr', authenticate, urlController.getQRCode);

module.exports = router;
