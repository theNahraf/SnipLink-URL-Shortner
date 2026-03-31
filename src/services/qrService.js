const QRCode = require('qrcode');
const env = require('../config/env');

/**
 * Generate a QR code for a short URL
 * @param {string} shortCode 
 * @param {Object} options
 * @returns {Promise<string>} Base64-encoded PNG data URL
 */
async function generateQR(shortCode, options = {}) {
  const url = `${env.BASE_URL}/${shortCode}`;

  const qrOptions = {
    type: 'image/png',
    width: options.width || 300,
    margin: options.margin || 2,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  };

  const dataUrl = await QRCode.toDataURL(url, qrOptions);
  return dataUrl;
}

/**
 * Generate QR code as SVG string
 */
async function generateQRSvg(shortCode) {
  const url = `${env.BASE_URL}/${shortCode}`;
  const svg = await QRCode.toString(url, { type: 'svg', margin: 2 });
  return svg;
}

module.exports = { generateQR, generateQRSvg };
