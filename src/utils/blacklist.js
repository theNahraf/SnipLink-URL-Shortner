const { redis } = require('../config/redis');

const BLACKLIST_KEY = 'url:blacklist:domains';

// Default blacklisted domains (known malware/phishing)
const DEFAULT_BLACKLIST = [
  'malware.com',
  'phishing-site.com',
  'scam-domain.net',
];

/**
 * Initialize the blacklist with default domains
 */
async function initBlacklist() {
  const exists = await redis.exists(BLACKLIST_KEY);
  if (!exists) {
    if (DEFAULT_BLACKLIST.length > 0) {
      await redis.sadd(BLACKLIST_KEY, ...DEFAULT_BLACKLIST);
    }
    console.log(`✅ Blacklist initialized with ${DEFAULT_BLACKLIST.length} domains`);
  }
}

/**
 * Check if a domain is blacklisted
 * @param {string} url 
 * @returns {Promise<boolean>}
 */
async function isBlacklisted(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return await redis.sismember(BLACKLIST_KEY, hostname);
  } catch {
    return false;
  }
}

/**
 * Add a domain to the blacklist
 * @param {string} domain 
 */
async function addToBlacklist(domain) {
  await redis.sadd(BLACKLIST_KEY, domain.toLowerCase());
}

/**
 * Remove a domain from the blacklist
 * @param {string} domain 
 */
async function removeFromBlacklist(domain) {
  await redis.srem(BLACKLIST_KEY, domain.toLowerCase());
}

module.exports = { initBlacklist, isBlacklisted, addToBlacklist, removeFromBlacklist };
