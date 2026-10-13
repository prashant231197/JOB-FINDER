const { chromium } = require('playwright');

async function extractAllIndeed() {
  let browser = null;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://in.indeed.com/jobs?q=SDET&l=Bengaluru', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const els = document.querySelectorAll('[data-jk]');
      const items = [];
      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        const jk = el.getAttribute('data-jk');
        const text = el.innerText || el.textContent;
        items.push({ i, jk, text: (text || '').trim().replace(/\s+/g, ' ') });
      }
      return { count: els.length, items };
    });

    console.log('Found count:', data.count);
    console.log('Items:', data.items.slice(0, 10));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

extractAllIndeed();
