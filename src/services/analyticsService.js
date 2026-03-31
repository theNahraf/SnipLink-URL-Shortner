const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Get analytics for a specific link
 */
async function getLinkAnalytics(linkId, userId) {
  // Verify ownership
  const link = await db('urls').where({ id: linkId, user_id: userId }).first();
  if (!link) {
    throw new AppError('Link not found', 404);
  }

  // Aggregate stats
  const [totalClicks] = await db('analytics').where({ url_id: linkId }).count();
  const [uniqueVisitors] = await db('analytics')
    .where({ url_id: linkId })
    .countDistinct('ip_address as count');

  // Top countries
  const countries = await db('analytics')
    .where({ url_id: linkId })
    .select('country')
    .count('* as clicks')
    .groupBy('country')
    .orderBy('clicks', 'desc')
    .limit(10);

  // Top devices
  const devices = await db('analytics')
    .where({ url_id: linkId })
    .select('device')
    .count('* as clicks')
    .groupBy('device')
    .orderBy('clicks', 'desc')
    .limit(5);

  // Top browsers
  const browsers = await db('analytics')
    .where({ url_id: linkId })
    .select('browser')
    .count('* as clicks')
    .groupBy('browser')
    .orderBy('clicks', 'desc')
    .limit(5);

  // Top referrers
  const referrers = await db('analytics')
    .where({ url_id: linkId })
    .whereNotNull('referer')
    .where('referer', '!=', '')
    .select('referer')
    .count('* as clicks')
    .groupBy('referer')
    .orderBy('clicks', 'desc')
    .limit(10);

  return {
    linkId: link.id,
    shortCode: link.short_code,
    longUrl: link.long_url,
    totalClicks: parseInt(totalClicks.count, 10),
    uniqueVisitors: parseInt(uniqueVisitors.count, 10),
    countries: countries.map(c => ({ country: c.country || 'Unknown', clicks: parseInt(c.clicks, 10) })),
    devices: devices.map(d => ({ device: d.device || 'Unknown', clicks: parseInt(d.clicks, 10) })),
    browsers: browsers.map(b => ({ browser: b.browser || 'Unknown', clicks: parseInt(b.clicks, 10) })),
    referrers: referrers.map(r => ({ referer: r.referer, clicks: parseInt(r.clicks, 10) })),
  };
}

/**
 * Get time-series analytics (clicks over time)
 */
async function getTimeSeries(linkId, userId, interval = 'day', days = 30) {
  // Verify ownership
  const link = await db('urls').where({ id: linkId, user_id: userId }).first();
  if (!link) {
    throw new AppError('Link not found', 404);
  }

  const validIntervals = { hour: '1 hour', day: '1 day', week: '1 week' };
  const truncInterval = interval === 'hour' ? 'hour' : interval === 'week' ? 'week' : 'day';

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const timeSeries = await db('analytics')
    .where({ url_id: linkId })
    .where('created_at', '>=', startDate)
    .select(
      db.raw(`date_trunc('${truncInterval}', created_at) as time_bucket`),
      db.raw('COUNT(*) as clicks'),
      db.raw('COUNT(DISTINCT ip_address) as unique_clicks')
    )
    .groupBy('time_bucket')
    .orderBy('time_bucket', 'asc');

  return {
    linkId: link.id,
    interval,
    days,
    data: timeSeries.map(row => ({
      timestamp: row.time_bucket,
      clicks: parseInt(row.clicks, 10),
      uniqueClicks: parseInt(row.unique_clicks, 10),
    })),
  };
}

/**
 * Get dashboard overview stats for a user
 */
async function getDashboardStats(userId) {
  // Total links
  const [linksCount] = await db('urls').where({ user_id: userId }).count();

  // Total clicks across all links
  const [clicksSum] = await db('urls')
    .where({ user_id: userId })
    .sum('click_count as total');

  // Active links
  const [activeCount] = await db('urls')
    .where({ user_id: userId, is_active: true })
    .count();

  // Clicks today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [clicksToday] = await db('analytics')
    .join('urls', 'analytics.url_id', 'urls.id')
    .where('urls.user_id', userId)
    .where('analytics.created_at', '>=', today)
    .count();

  // Top performing link
  const topLink = await db('urls')
    .where({ user_id: userId })
    .orderBy('click_count', 'desc')
    .first();

  // Recent clicks time-series (last 7 days, daily)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyTrend = await db('analytics')
    .join('urls', 'analytics.url_id', 'urls.id')
    .where('urls.user_id', userId)
    .where('analytics.created_at', '>=', weekAgo)
    .select(
      db.raw("date_trunc('day', analytics.created_at) as day"),
      db.raw('COUNT(*) as clicks')
    )
    .groupBy('day')
    .orderBy('day', 'asc');

  return {
    totalLinks: parseInt(linksCount.count, 10),
    totalClicks: parseInt(clicksSum.total || 0, 10),
    activeLinks: parseInt(activeCount.count, 10),
    clicksToday: parseInt(clicksToday.count, 10),
    topLink: topLink ? {
      shortCode: topLink.short_code,
      longUrl: topLink.long_url,
      clicks: topLink.click_count,
    } : null,
    weeklyTrend: weeklyTrend.map(row => ({
      date: row.day,
      clicks: parseInt(row.clicks, 10),
    })),
  };
}

module.exports = { getLinkAnalytics, getTimeSeries, getDashboardStats };
