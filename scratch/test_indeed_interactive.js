const { chromium } = require('playwright');

async function testIndeedChrome() {
  let browser = null;
  try {
    browser = await chromium.launch({
      channel: 'chrome',
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox'
      ]
    });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    await page.goto('https://in.indeed.com/jobs?q=SDET&l=Bengaluru', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    const title = await page.title();
    console.log('Indeed non-headless title:', title);
    const cardsCount = await page.evaluate(() => document.querySelectorAll('[data-jk]').length);
    console.log('Indeed [data-jk] cards count:', cardsCount);
  } catch (e) {
    console.log('Indeed error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

testIndeedChrome();
