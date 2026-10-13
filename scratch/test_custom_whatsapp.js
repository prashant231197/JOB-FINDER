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

    // Find and click on Recruiter Scraper Tab
    console.log('Looking for Recruiter Radar tab...');
    const allButtons = await page.$$('button');
    let clickedTab = false;
    for (const btn of allButtons) {
      const text = await btn.innerText().catch(() => '');
      if (text.includes('Recruiter') || text.includes('Radar') || text.includes('Scraper')) {
        if (text.includes('Recruiter Radar') || text.includes('Recruiter Scraper') || text.includes('Email & Mobile')) {
          console.log(`Clicking tab: "${text.trim()}"`);
          await btn.click();
          clickedTab = true;
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    if (!clickedTab) {
      // Look in sidebar nav items
      const navLinks = await page.$$('aside button, nav button, div[role="button"]');
      for (const btn of navLinks) {
        const text = await btn.innerText().catch(() => '');
        if (text.includes('Recruiter')) {
          console.log(`Clicking sidebar tab: "${text.trim()}"`);
          await btn.click();
          clickedTab = true;
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    // Input job description text with phones
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

    // Open Custom Message Settings
    console.log('Looking for Custom Message Settings button...');
    const customSettingsBtn = await page.$('button:has-text("Custom Message Settings")');
    if (customSettingsBtn) {
      console.log('Clicking Custom Message Settings...');
      await customSettingsBtn.click();
      await page.waitForTimeout(1000);
    }

    // Capture screenshot with editor open
    await page.screenshot({ path: 'scratch/custom_whatsapp_editor.png', fullPage: false });
    console.log('Saved scratch/custom_whatsapp_editor.png');

    // Click "Short & Direct Outreach" preset
    const presetBtn = await page.$('button:has-text("Short & Direct Outreach")');
    if (presetBtn) {
      console.log('Clicking Short & Direct Outreach preset...');
      await presetBtn.click();
      await page.waitForTimeout(500);
    }

    // Click "Save Custom Message"
    const saveBtn = await page.$('button:has-text("Save Custom Message")');
    if (saveBtn) {
      console.log('Clicking Save Custom Message...');
      await saveBtn.click();
      await page.waitForTimeout(1000);
    }

    // Check localStorage
    const savedMsg = await page.evaluate(() => localStorage.getItem('recruiter_custom_whatsapp_message'));
    const savedMode = await page.evaluate(() => localStorage.getItem('recruiter_whatsapp_mode'));
    console.log('Saved in localStorage -> Mode:', savedMode);
    console.log('Saved in localStorage -> Message:', savedMsg);

    // Verify WhatsApp link on first phone card
    const firstWaLink = await page.$('a:has-text("Chat on WhatsApp")');
    if (firstWaLink) {
      const href = await firstWaLink.getAttribute('href');
      console.log('First WhatsApp Link href:', decodeURIComponent(href));
    }

    // Capture screenshot after saving
    await page.screenshot({ path: 'scratch/custom_whatsapp_saved.png', fullPage: false });
    console.log('Saved scratch/custom_whatsapp_saved.png');

    console.log('Total page errors:', errors.length);
    await browser.close();
  } catch (err) {
    console.error('Test error:', err);
  }
})();
