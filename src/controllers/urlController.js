const urlService = require('../services/urlService');
const qrService = require('../services/qrService');

/**
 * POST /api/shorten — Shorten a URL
 */
async function shortenUrl(req, res, next) {
  try {
    const { url, customAlias, expiresAt, oneTime, password, title } = req.body;

    const result = await urlService.shortenUrl(url, {
      customAlias,
      expiresAt,
      oneTime,
      password,
      title,
    }, req.user);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /:shortCode — Redirect to long URL
 */
async function redirectUrl(req, res, next) {
  try {
    const { shortCode } = req.params;
    const password = req.query.password || req.body?.password;

    const { longUrl, statusCode } = await urlService.resolveUrl(shortCode, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      referer: req.headers.referer || req.headers.referrer,
      password,
    });

    res.redirect(statusCode, longUrl);
  } catch (err) {
    // If password required, show password form
    if (err.code === 'PASSWORD_REQUIRED' || err.code === 'INVALID_PASSWORD') {
      if (req.accepts('html')) {
        return res.sendFile(require('path').join(__dirname, '..', '..', 'public', 'password.html'));
      }
      return res.status(401).json({
        success: false,
        error: err.message,
        code: err.code,
        requiresPassword: true,
      });
    }
    next(err);
  }
}

/**
 * GET /api/links — List user's links
 */
async function getUserLinks(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const search = req.query.search || '';
    const status = req.query.status || '';

    const result = await urlService.getUserLinks(req.user.id, page, limit, search, status);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/links/:id — Get single link
 */
async function getLinkById(req, res, next) {
  try {
    const link = await urlService.getLinkById(req.params.id, req.user.id);
    res.json({ success: true, data: link });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/links/:id — Update a link
 */
async function updateLink(req, res, next) {
  try {
    const result = await urlService.updateLink(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/links/:id — Delete a link
 */
async function deleteLink(req, res, next) {
  try {
    const result = await urlService.deleteLink(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/links/:id/qr — Get QR code for a link
 */
async function getQRCode(req, res, next) {
  try {
    const link = await urlService.getLinkById(req.params.id, req.user.id);
    const qrDataUrl = await qrService.generateQR(link.shortCode);
    res.json({ success: true, data: { qr: qrDataUrl, shortUrl: link.shortUrl } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  shortenUrl,
  redirectUrl,
  getUserLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getQRCode,
};
