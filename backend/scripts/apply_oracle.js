const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PROFILE_PATH = path.join(__dirname, '..', 'data', 'profile.json');
const RESUME_PATH = path.join(__dirname, '..', '..', 'SDET-PRASHANT.pdf');
const SESSION_DATA_DIR = path.join(__dirname, '..', 'data', 'oracle_browser_session');

// Ensure directory exists
if (!fs.existsSync(SESSION_DATA_DIR)) {
  fs.mkdirSync(SESSION_DATA_DIR, { recursive: true });
}

// Verification code provided by user
const VERIFICATION_CODE = process.env.OTP || '440196';

async function main() {
  console.log('=== Oracle HCM Job Application Automation ===');
  const profile = JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
  console.log('Applicant:', profile.fullName);
  console.log('Email:', profile.email);
  console.log('Phone:', profile.phone);
  console.log('Resume Path:', RESUME_PATH, 'Exists:', fs.existsSync(RESUME_PATH));
  console.log('Using Verification Code:', VERIFICATION_CODE);

  // Launch persistent context so cookies and session stay saved
  const context = await chromium.launchPersistentContext(SESSION_DATA_DIR, {
    channel: 'chrome',
    headless: false,
    slowMo: 100,
    viewport: null,
    args: [
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  const jobUrl = 'https://hctz.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1001/job/2506570';
  console.log('\nNavigating to:', jobUrl);
  await page.goto(jobUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // 1. Check if Apply button is present
  const applyBtn = await page.$('button:has-text("Apply Now"), button:has-text("Apply")');
  if (applyBtn && await applyBtn.isVisible()) {
    console.log('Clicking "Apply Now"...');
    await applyBtn.click();
    await page.waitForTimeout(3000);
  }

  // 2. Check if on Email Step
  const emailInput = await page.$('input#primary-email-0, input[name="primary-email"]');
  if (emailInput && await emailInput.isVisible()) {
    console.log('Entering email:', profile.email);
    await emailInput.fill(profile.email);
    await page.waitForTimeout(500);

    // Click Knockout checkbox
    const cbBtn = await page.$('.apply-flow-input-checkbox__button');
    if (cbBtn) {
      console.log('Checking terms and conditions...');
      await cbBtn.click();
      await page.waitForTimeout(500);
    }

    const nextBtn = await page.$('button:has-text("Next")');
    if (nextBtn && await nextBtn.isVisible()) {
      console.log('Clicking Next on Email step...');
      await nextBtn.click();
      await page.waitForTimeout(4000);
    }
  }

  // 3. Check if on Verification Code Step
  const pin1 = await page.$('#pin-code-1');
  if (pin1 && await pin1.isVisible()) {
    console.log('\n--- Identity Verification Step Detected ---');
    console.log('Entering 6-digit verification code:', VERIFICATION_CODE);

    for (let i = 0; i < 6; i++) {
      const pinSelector = `#pin-code-${i + 1}`;
      const pinEl = await page.$(pinSelector);
      if (pinEl) {
        await pinEl.fill(VERIFICATION_CODE[i] || '');
        await page.waitForTimeout(150);
      }
    }

    await page.waitForTimeout(500);
    console.log('Clicking "Verify" button...');
    const verifyBtn = await page.$('button:has-text("Verify")');
    if (verifyBtn && await verifyBtn.isVisible()) {
      await verifyBtn.click();
      await page.waitForTimeout(5000);
    }

    // Check if error message appeared
    const errorMsg = await page.evaluate(() => {
      const err = document.querySelector('.error-message, [role="alert"], .input-row--invalid');
      return err ? err.innerText.trim() : null;
    });
    if (errorMsg) {
      console.log('Verification warning/notice:', errorMsg);
    }
  }

  console.log('\nCurrent URL after verification:', page.url());
  console.log('Page Title:', await page.title());

  // 4. Multi-step Form Filler Loop
  console.log('\n--- Starting Application Form Handling ---');
  let stepCount = 0;
  const maxSteps = 10;

  while (stepCount < maxSteps) {
    stepCount++;
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`\n[Step ${stepCount}] Processing screen at: ${currentUrl}`);

    // Check if review or submit screen
    const submitBtn = await page.$('button:has-text("Submit Application"), button:has-text("Submit")');
    const isReview = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes('review your application') || text.includes('review and submit') || text.includes('final review');
    });

    if (isReview) {
      console.log('\n=============================================');
      console.log('>>> APPLICATION READY ON REVIEW SCREEN! <<<');
      console.log('Paused here as requested so you can review all details before final submission.');
      console.log('=============================================\n');
      break;
    }

    // 4a. Resume Upload Detection
    const fileInputs = await page.$$('input[type="file"]');
    for (const fileInput of fileInputs) {
      try {
        console.log('Found file upload input, attaching resume:', path.basename(RESUME_PATH));
        await fileInput.setInputFiles(RESUME_PATH);
        console.log('Uploaded resume file successfully!');
        await page.waitForTimeout(4000); // Wait for parse/upload
      } catch (e) {
        console.log('File input error:', e.message);
      }
    }

    // 4b. Fill Text / Select Fields
    const formFields = await page.$$('input, textarea, select');
    for (const el of formFields) {
      try {
        if (!await el.isVisible()) continue;
        const type = await el.getAttribute('type') || 'text';
        if (['hidden', 'submit', 'button', 'file'].includes(type)) continue;

        const id = (await el.getAttribute('id') || '').toLowerCase();
        const name = (await el.getAttribute('name') || '').toLowerCase();
        const placeholder = (await el.getAttribute('placeholder') || '').toLowerCase();
        const ariaLabel = (await el.getAttribute('aria-label') || '').toLowerCase();

        // Get label text
        let labelText = '';
        if (id) {
          const lbl = await page.$(`label[for="${id}"]`);
          if (lbl) labelText = (await lbl.innerText() || '').toLowerCase();
        }
        if (!labelText) {
          labelText = await el.evaluate(n => {
            const p = n.closest('label') || n.closest('.input-row, .field, .form-group, div');
            return p ? p.innerText.slice(0, 80).toLowerCase() : '';
          });
        }

        const descriptor = `${id} ${name} ${placeholder} ${ariaLabel} ${labelText}`;

        // Don't overwrite if field already filled
        const currentValue = await el.inputValue().catch(() => '');
        if (currentValue && currentValue.trim().length > 1) {
          continue;
        }

        // First Name
        if ((descriptor.includes('first') && descriptor.includes('name')) || descriptor.includes('given')) {
          console.log('Filling First Name: Prashant');
          await el.fill('Prashant');
        }
        // Last Name
        else if ((descriptor.includes('last') && descriptor.includes('name')) || descriptor.includes('family') || descriptor.includes('surname')) {
          console.log('Filling Last Name: Ary');
          await el.fill('Ary');
        }
        // Full Name
        else if (descriptor.includes('full name') || (descriptor.includes('name') && !descriptor.includes('user') && !descriptor.includes('company'))) {
          console.log('Filling Full Name:', profile.fullName);
          await el.fill(profile.fullName);
        }
        // Phone
        else if (descriptor.includes('phone') || descriptor.includes('mobile') || descriptor.includes('contact')) {
          console.log('Filling Phone:', profile.phone);
          await el.fill('6204507166');
        }
        // City / Location
        else if (descriptor.includes('city') || descriptor.includes('current location')) {
          console.log('Filling City: Bengaluru');
          await el.fill('Bengaluru');
        }
        // Postal code
        else if (descriptor.includes('postal') || descriptor.includes('zip')) {
          await el.fill('560100');
        }
        // State / Region
        else if (descriptor.includes('state') || descriptor.includes('province')) {
          await el.fill('Karnataka');
        }
        // Country
        else if (descriptor.includes('country')) {
          if (el.tagName === 'SELECT') {
            await el.selectOption({ label: 'India' }).catch(() => {});
          } else {
            await el.fill('India');
          }
        }
        // LinkedIn
        else if (descriptor.includes('linkedin')) {
          await el.fill('http://www.linkedin.com/in/prashant-kumar-ary-336463205');
        }
        // Notice period
        else if (descriptor.includes('notice') || descriptor.includes('availability')) {
          await el.fill('60 days');
        }
        // Salary / CTC
        else if (descriptor.includes('salary') || descriptor.includes('ctc') || descriptor.includes('compensation')) {
          await el.fill('1200000');
        }
        // Work Authorization Radio/Checkboxes
        else if (type === 'radio' || type === 'checkbox') {
          if (descriptor.includes('authorized') || descriptor.includes('eligible')) {
            await el.check().catch(() => {});
          } else if (descriptor.includes('sponsorship') && descriptor.includes('no')) {
            await el.check().catch(() => {});
          }
        }
      } catch (err) {
        // quiet continue
      }
    }

    // 4c. Look for Next / Continue / Save & Continue button
    const nextButtons = [
      'button:has-text("Save and Continue")',
      'button:has-text("Next")',
      'button:has-text("Continue")',
      'oj-button:has-text("Next")',
      '#save-continue-btn'
    ];

    let advanced = false;
    for (const sel of nextButtons) {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        const text = await btn.innerText();
        if (text.toLowerCase().includes('submit')) {
          console.log('\nReached final Submit button! Pausing for user review.');
          break;
        }
        console.log(`Clicking "${text.trim()}" to advance...`);
        await btn.click();
        await page.waitForTimeout(3000);
        advanced = true;
        break;
      }
    }

    if (!advanced) {
      console.log('No next button found or reached review stage. Waiting 5s...');
      await page.waitForTimeout(5000);
    }
  }

  console.log('\n--- Automation Complete ---');
  console.log('The Chrome browser will remain open for your final inspection and submission.');
}

main().catch(err => {
  console.error('Error in automation execution:', err);
});
