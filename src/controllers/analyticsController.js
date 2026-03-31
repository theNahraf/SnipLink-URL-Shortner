const analyticsService = require('../services/analyticsService');

/**
 * GET /api/analytics/:id — Link analytics
 */
async function getLinkAnalytics(req, res, next) {
  try {
    const data = await analyticsService.getLinkAnalytics(req.params.id, req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/:id/timeseries — Time-series data
 */
async function getTimeSeries(req, res, next) {
  try {
    const interval = req.query.interval || 'day';
    const days = parseInt(req.query.days, 10) || 30;

    const data = await analyticsService.getTimeSeries(
      req.params.id,
      req.user.id,
      interval,
      days
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/analytics/dashboard — Dashboard overview
 */
async function getDashboardStats(req, res, next) {
  try {
    const data = await analyticsService.getDashboardStats(req.user.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLinkAnalytics, getTimeSeries, getDashboardStats };
