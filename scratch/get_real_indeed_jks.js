const { chromium } = require('playwright');

async function getIndeedJks() {
  let browser;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    });
    const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' });
    const page = await ctx.newPage();
    await page.goto('https://in.indeed.com/jobs?q=QA+Automation&l=India', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    const jks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-jk]')).map(el => {
        const jk = el.getAttribute('data-jk');
        const text = el.innerText?.trim();
        return { jk, text };
      }).filter(x => x.jk);
    });
    console.log('Found JKs count:', jks.length);
    console.log('Sample JKs:', jks.slice(0, 10));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

getIndeedJks();
