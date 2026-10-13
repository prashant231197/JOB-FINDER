const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const page = await context.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Click on Recruiter Contact Scraper tab
    const scraperTabBtn = await page.getByRole('button', { name: /Recruiter Contact Scraper/i });
    if (await scraperTabBtn.count() > 0) {
      await scraperTabBtn.click();
    } else {
      // Fallback selector
      await page.click('button:has-text("Recruiter Contact Scraper"), button:has-text("HR Contacts")');
    }
    await page.waitForTimeout(1500);

    // Take screenshot of Recruiter Scraper Tab with new "Upload Resume PDF" button
    await page.screenshot({ path: 'scratch/recruiter_tab_header.png' });
    console.log('Saved scratch/recruiter_tab_header.png');

    // Switch to Directory subtab to find a direct send email button
    const dirBtn = await page.getByRole('button', { name: /50\+ Recruiter Directory/i });
    if (await dirBtn.count() > 0) {
      await dirBtn.click();
      await page.waitForTimeout(1000);
    }

    // Click on direct send paperclip button (title="Direct Send with PDF Attachment via SMTP")
    const sendBtns = await page.$$('button[title*="Direct Send with PDF Attachment"]');
    console.log('Found Direct Send buttons:', sendBtns.length);
    if (sendBtns.length > 0) {
      await sendBtns[0].click();
      await page.waitForTimeout(1000);

      // Screenshot modal in default mode
      await page.screenshot({ path: 'scratch/direct_send_modal_default.png' });
      console.log('Saved scratch/direct_send_modal_default.png');

      // Click "Upload File" tab inside modal
      const uploadTabBtn = await page.getByRole('button', { name: /Upload File/i });
      if (await uploadTabBtn.count() > 0) {
        await uploadTabBtn.click();
        await page.waitForTimeout(500);
      }

      // Screenshot modal in upload file mode
      await page.screenshot({ path: 'scratch/direct_send_modal_upload.png' });
      console.log('Saved scratch/direct_send_modal_upload.png');
    }

    await browser.close();
    console.log('Verification finished successfully!');
  } catch (err) {
    console.error('Test run failed:', err);
  }
})();
