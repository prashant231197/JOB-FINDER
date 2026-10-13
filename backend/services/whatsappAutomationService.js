const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class WhatsAppAutomationService {
  constructor() {
    this.isRunning = false;
    this.sessionDir = path.join(__dirname, '../data/whatsapp_user_data');
    this.statusLogs = [];
  }

  getCleanTargetNum(phone) {
    const raw = (phone || '').replace(/\D/g, '');
    if (raw.length === 10 && /^[6789]/.test(raw)) {
      return `91${raw}`;
    }
    if (raw.length === 11 && raw.startsWith('0')) {
      return `91${raw.slice(1)}`;
    }
    if (raw.length >= 12 && raw.startsWith('91')) {
      return raw;
    }
    if (raw.length > 10) {
      const last10 = raw.slice(-10);
      if (/^[6789]/.test(last10)) {
        return `91${last10}`;
      }
    }
    return raw;
  }

  async sendBulkMessages(phones, message, onProgress = null) {
    if (this.isRunning) {
      throw new Error('A WhatsApp bulk dispatch operation is already in progress.');
    }

    this.isRunning = true;
    this.statusLogs = [];
    const results = [];

    let context = null;
    try {
      if (!fs.existsSync(this.sessionDir)) {
        fs.mkdirSync(this.sessionDir, { recursive: true });
      }

      // Launch persistent context so login/cookies are remembered
      context = await chromium.launchPersistentContext(this.sessionDir, {
        headless: false, // Headful so user can see progress or scan QR if first time
        viewport: { width: 1280, height: 800 },
        args: [
          '--disable-blink-features=AutomationControlled',
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ]
      });

      const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

      for (let i = 0; i < phones.length; i++) {
        const phone = phones[i];
        const targetNum = this.getCleanTargetNum(phone);
        const encodedMsg = encodeURIComponent(message);
        const url = `https://web.whatsapp.com/send?phone=${targetNum}&text=${encodedMsg}`;

        const progressMsg = `[${i + 1}/${phones.length}] Navigating to WhatsApp chat for ${phone}...`;
        this.statusLogs.push(progressMsg);
        if (onProgress) onProgress({ current: i + 1, total: phones.length, phone, status: 'navigating' });

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

          // Wait for either the send button, message box, or invalid number alert
          const sendBtnSelector = 'span[data-icon="send"], button[aria-label="Send"], button span[data-icon="send"], div[role="button"][aria-label="Send"]';
          const invalidNumberSelector = 'div[data-animate-modal-popup="true"], div:has-text("Phone number shared via url is invalid")';

          const matched = await Promise.race([
            page.waitForSelector(sendBtnSelector, { timeout: 30000 }).then(() => 'send'),
            page.waitForSelector(invalidNumberSelector, { timeout: 15000 }).then(() => 'invalid').catch(() => null)
          ]);

          if (matched === 'invalid') {
            results.push({ phone, status: 'invalid_number', error: 'WhatsApp reported this number is invalid or not registered.' });
            continue;
          }

          // Small delay to ensure message populated
          await page.waitForTimeout(1200);

          // Click send or press Enter
          const sendBtn = await page.$(sendBtnSelector);
          if (sendBtn) {
            await sendBtn.click();
          } else {
            await page.keyboard.press('Enter');
          }

          // Wait for message dispatch animation
          await page.waitForTimeout(2500);

          results.push({ phone, status: 'sent', error: null });
          if (onProgress) onProgress({ current: i + 1, total: phones.length, phone, status: 'sent' });

        } catch (err) {
          results.push({ phone, status: 'failed', error: err.message });
          if (onProgress) onProgress({ current: i + 1, total: phones.length, phone, status: 'failed', error: err.message });
        }

        // Brief delay between contacts
        if (i < phones.length - 1) {
          await page.waitForTimeout(1500);
        }
      }
    } finally {
      if (context) {
        await context.close().catch(() => {});
      }
      this.isRunning = false;
    }

    return results;
  }
}

module.exports = new WhatsAppAutomationService();
