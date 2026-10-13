const { chromium } = require('playwright');

async function debugIndeedSelectors() {
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

    const firstCard = await page.evaluate(() => {
      const el = document.querySelector('[data-jk]');
      return {
        jk: el?.getAttribute('data-jk'),
        innerText: el?.innerText,
        html: el?.innerHTML.slice(0, 400)
      };
    });
    console.log('First card:', firstCard);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    if (browser) await browser.close();
  }
}

debugIndeedSelectors();
