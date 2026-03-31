const paymentService = require('../services/paymentService');

/**
 * POST /api/payments/create-subscription
 */
async function createSubscription(req, res, next) {
  try {
    const { planType } = req.body;
    const result = await paymentService.createSubscription(req.user.id, planType);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/webhook
 */
async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/payments/status
 */
async function getSubscriptionStatus(req, res, next) {
  try {
    const result = await paymentService.getSubscriptionStatus(req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/payments/mock-upgrade
 * Test endpoint to simulate successful payment
 */
async function mockUpgrade(req, res, next) {
  try {
    const { planType } = req.body;
    const db = require('../config/database');
    await db('users').where({ id: req.user.id }).update({ plan_type: planType });
    res.json({ success: true, message: `Successfully upgraded to ${planType}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { createSubscription, handleWebhook, getSubscriptionStatus, mockUpgrade };
