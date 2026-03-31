const validator = require('validator');

// Known phishing/malware patterns
const SUSPICIOUS_PATTERNS = [
  /data:/i,
  /javascript:/i,
  /vbscript:/i,
  /file:/i,
  /about:/i,
  /chrome:/i,
  /\.exe$/i,
  /\.bat$/i,
  /\.cmd$/i,
  /\.scr$/i,
  /\.pif$/i,
];

// Common URL shortener re-shortening (prevent chains)
const SHORTENER_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
  'is.gd', 'buff.ly', 'adf.ly', 'bc.vc', 'j.mp',
];

/**
 * Validates a URL for safety and correctness
 * @param {string} url 
 * @returns {{ valid: boolean, error?: string }}
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmed = url.trim();

  if (trimmed.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length (2048 characters)' };
  }

  if (!validator.isURL(trimmed, {
    protocols: ['http', 'https'],
    require_protocol: true,
    require_valid_protocol: true,
  })) {
    return { valid: false, error: 'Invalid URL format. Must start with http:// or https://' };
  }

  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'URL contains suspicious content' };
    }
  }

  // Check if it's a re-shortening attempt
  try {
    const hostname = new URL(trimmed).hostname.toLowerCase();
    if (SHORTENER_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
      return { valid: false, error: 'Cannot shorten an already-shortened URL' };
    }
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  return { valid: true };
}

module.exports = { validateUrl };
