const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const env = require('../config/env');
const { AppError } = require('../middleware/errorHandler');

const SALT_ROUNDS = 12;

/**
 * Register a new user
 */
async function signup(email, password, displayName) {
  // Check if user exists
  const existing = await db('users').where({ email: email.toLowerCase() }).first();
  if (existing) {
    throw new AppError('Email already registered', 409, 'DUPLICATE_EMAIL');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [user] = await db('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
      display_name: displayName || email.split('@')[0],
      plan_type: 'free',
    })
    .returning(['id', 'email', 'display_name', 'plan_type', 'created_at']);

  const tokens = generateTokens(user);

  return { user, ...tokens };
}

/**
 * Login an existing user
 */
async function login(email, password) {
  const user = await db('users').where({ email: email.toLowerCase() }).first();
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      plan_type: user.plan_type,
      created_at: user.created_at,
    },
    ...tokens,
  };
}

/**
 * Refresh access token using refresh token
 */
function refreshAccessToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, plan_type: decoded.plan_type },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
    return { accessToken };
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

/**
 * Get user profile
 */
async function getProfile(userId) {
  const user = await db('users')
    .where({ id: userId })
    .select('id', 'email', 'display_name', 'plan_type', 'links_created_this_month', 'created_at')
    .first();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get total links count
  const [{ count }] = await db('urls').where({ user_id: userId }).count();
  user.total_links = parseInt(count, 10);

  return user;
}

/**
 * Generate JWT tokens pair
 */
function generateTokens(user) {
  const payload = {
    id: user.id,
    email: user.email,
    plan_type: user.plan_type,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
}

module.exports = { signup, login, refreshAccessToken, getProfile };
