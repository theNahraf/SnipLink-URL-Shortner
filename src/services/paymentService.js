const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../config/database');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.warn('⚠️ Razorpay not initialized:', err.message);
}

const PLAN_MAP = {
  pro: env.RAZORPAY_PRO_PLAN_ID,
  business: env.RAZORPAY_BUSINESS_PLAN_ID,
};

/**
 * Create a Razorpay subscription for a user
 */
async function createSubscription(userId, planType) {
  if (!razorpay) {
    throw new AppError('Payment service not available', 503);
  }

  if (!PLAN_MAP[planType]) {
    throw new AppError('Invalid plan type. Choose "pro" or "business"', 400);
  }

  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.plan_type === planType) {
    throw new AppError(`You are already on the ${planType} plan`, 400);
  }

  // Create subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: PLAN_MAP[planType],
    total_count: 12, // 12 months
    quantity: 1,
    notes: {
      user_id: userId,
      plan_type: planType,
    },
  });

  // Store subscription ID
  await db('users').where({ id: userId }).update({
    razorpay_subscription_id: subscription.id,
  });

  return {
    subscriptionId: subscription.id,
    shortUrl: subscription.short_url,
    planType,
    status: subscription.status,
    razorpayKeyId: env.RAZORPAY_KEY_ID,
  };
}

/**
 * Handle Razorpay webhook events
 */
async function handleWebhook(body, signature) {
  // Verify signature
  if (env.RAZORPAY_WEBHOOK_SECRET && env.RAZORPAY_WEBHOOK_SECRET !== 'PLACEHOLDER_WEBHOOK_SECRET') {
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid webhook signature', 401);
    }
  }

  const event = body.event;
  const payload = body.payload;

  switch (event) {
    case 'subscription.activated':
    case 'subscription.charged': {
      const subId = payload.subscription?.entity?.id;
      const notes = payload.subscription?.entity?.notes;

      if (subId && notes?.user_id) {
        await db('users').where({ id: notes.user_id }).update({
          plan_type: notes.plan_type || 'pro',
          razorpay_subscription_id: subId,
        });
        console.log(`✅ User ${notes.user_id} upgraded to ${notes.plan_type}`);
      }
      break;
    }

    case 'subscription.cancelled':
    case 'subscription.completed': {
      const subId = payload.subscription?.entity?.id;
      const user = await db('users')
        .where({ razorpay_subscription_id: subId })
        .first();

      if (user) {
        await db('users').where({ id: user.id }).update({
          plan_type: 'free',
          razorpay_subscription_id: null,
        });
        console.log(`⬇️ User ${user.id} downgraded to free`);
      }
      break;
    }

    case 'payment.failed': {
      const subId = payload.payment?.entity?.subscription_id;
      if (subId) {
        console.warn(`⚠️ Payment failed for subscription ${subId}`);
      }
      break;
    }

    default:
      console.log(`ℹ️ Unhandled webhook event: ${event}`);
  }

  return { received: true };
}

/**
 * Get current subscription status
 */
async function getSubscriptionStatus(userId) {
  const user = await db('users').where({ id: userId }).first();
  if (!user) {
    throw new AppError('User not found', 404);
  }

  let subscriptionDetails = null;

  if (user.razorpay_subscription_id && razorpay) {
    try {
      subscriptionDetails = await razorpay.subscriptions.fetch(
        user.razorpay_subscription_id
      );
    } catch {
      // Subscription might not exist in test mode
    }
  }

  return {
    planType: user.plan_type,
    subscriptionId: user.razorpay_subscription_id,
    subscriptionStatus: subscriptionDetails?.status || null,
    currentPeriodEnd: subscriptionDetails?.current_end
      ? new Date(subscriptionDetails.current_end * 1000)
      : null,
  };
}

module.exports = { createSubscription, handleWebhook, getSubscriptionStatus };
