const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    
    const errors = [];
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    const rootLen = await page.evaluate(() => document.getElementById('root').innerHTML.length);
    console.log('Root HTML length:', rootLen);

    await page.screenshot({ path: 'scratch/radar_view.png', fullPage: false });
    console.log('Saved scratch/radar_view.png');

    // Click on 10-Day Call tab
    const tabs = await page.$$('button');
    for (const btn of tabs) {
      const text = await btn.innerText().catch(() => '');
      if (text.includes('10-Day Call')) {
        console.log('Clicking 10-Day Call tab button...');
        await btn.click();
        await page.waitForTimeout(1500);
        break;
      }
    }

    await page.screenshot({ path: 'scratch/research_view.png', fullPage: false });
    console.log('Saved scratch/research_view.png');
    console.log('Errors encountered:', errors.length);

    await browser.close();
  } catch (err) {
    console.error('Test run failed:', err);
  }
})();
