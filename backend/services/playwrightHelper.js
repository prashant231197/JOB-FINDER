/**
 * Safe Playwright Loader for Desktop & Termux (Android)
 * Resolves "Error: Unsupported platform: android" on mobile devices
 */

if (process.platform === 'android') {
  try {
    Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
  } catch (e) {
    process.platform = 'linux';
  }
}

let playwright = null;
let loadError = null;

try {
  playwright = require('playwright');
} catch (err) {
  loadError = err;
  console.warn('[Playwright] Notice: Playwright browser engine unavailable in current environment:', err.message);
}

module.exports = {
  chromium: playwright ? playwright.chromium : null,
  playwright,
  isAvailable: !!playwright && !!playwright.chromium,
  loadError
};
