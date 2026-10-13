const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
    const page = await context.newPage();

    const errors = [];
    page.on('pageerror', err => {
      console.log('PAGE ERROR:', err.message);
      errors.push(err.message);
    });

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Click Recruiter Scraper Sidebar Tab
    const navLinks = await page.$$('aside button, nav button, div[role="button"]');
    for (const btn of navLinks) {
      const text = await btn.innerText().catch(() => '');
      if (text.includes('Recruiter')) {
        console.log(`Clicking sidebar tab: "${text.trim()}"`);
        await btn.click();
        await page.waitForTimeout(1000);
        break;
      }
    }

    // Enter sample text with numbers
    const textarea = await page.$('textarea');
    if (textarea) {
      console.log('Entering text into scraper textarea...');
      await textarea.fill("We are hiring Senior SDET at Razorpay! Contact recruiter priya@razorpay.com or WhatsApp +91 77675 66556 or 6767767566556. Bangalore location.");
      await page.waitForTimeout(500);

      // Click "Extract Emails & Numbers"
      const extractBtn = await page.$('button:has-text("Extract Emails & Numbers")');
      if (extractBtn) {
        console.log('Clicking Extract Emails & Numbers...');
        await extractBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Look for "Send to All" button
    console.log('Looking for Send to All button...');
    const sendToAllBtn = await page.$('button:has-text("Send to All")');
    if (sendToAllBtn) {
      console.log('Clicking Send to All button...');
      await sendToAllBtn.click();
      await page.waitForTimeout(1200);
    } else {
      console.log('WARNING: Send to All button not found!');
    }

    // Take screenshot of Bulk WhatsApp Modal
    await page.screenshot({ path: 'scratch/bulk_whatsapp_modal.png', fullPage: false });
    console.log('Saved scratch/bulk_whatsapp_modal.png');

    console.log('Total page errors:', errors.length);
    await browser.close();
  } catch (err) {
    console.error('Test error:', err);
  }
})();
