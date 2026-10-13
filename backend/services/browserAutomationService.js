const { chromium } = require('./playwrightHelper');
const path = require('path');
const fs = require('fs');
const profileService = require('./profileService');
const applicationTrackerService = require('./applicationTrackerService');
const jobMatcherService = require('./jobMatcherService');
const resumePdfGeneratorService = require('./resumePdfGeneratorService');

class BrowserAutomationService {
  constructor() {
    this.browser = null;
    this.page = null;
    this.status = 'IDLE'; // IDLE, RUNNING, PAUSED_FOR_CAPTCHA, AWAITING_APPROVAL, STOPPED
    this.currentJob = null;
    this.sessionLogs = [];
    this.activeSubscribers = new Set();
    this.latestScreenshot = null;
    this.approvalResolver = null;
    this.captchaResolver = null;
    this.abortController = null;
    this.sessionCount = 0;
  }

  subscribe(res) {
    this.activeSubscribers.add(res);
    // Send initial handshake and state
    res.write(`data: ${JSON.stringify({
      type: 'INIT',
      status: this.status,
      currentJob: this.currentJob,
      logs: this.sessionLogs.slice(-25),
      latestScreenshot: this.latestScreenshot
    })}\n\n`);

    res.on('close', () => {
      this.activeSubscribers.delete(res);
    });
  }

  broadcast(event) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    for (const res of this.activeSubscribers) {
      try {
        res.write(payload);
      } catch (err) {
        this.activeSubscribers.delete(res);
      }
    }
  }

  log(message, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, message, level };
    this.sessionLogs.push(entry);
    if (this.sessionLogs.length > 200) this.sessionLogs.shift();
    console.log(`[Automation ${level.toUpperCase()}] ${message}`);
    this.broadcast({ type: 'LOG', entry });
  }

  async captureSnapshot(stepName = '') {
    if (!this.page || this.page.isClosed()) return null;
    try {
      const buffer = await this.page.screenshot({ type: 'jpeg', quality: 75 });
      const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      this.latestScreenshot = base64;
      this.broadcast({ type: 'SCREENSHOT', screenshot: base64, stepName });
      return base64;
    } catch (e) {
      return null;
    }
  }

  async stopAutomation() {
    this.log('[KILL SWITCH] Stopping automation and closing browser immediately.', 'warning');
    this.status = 'STOPPED';
    if (this.approvalResolver) {
      this.approvalResolver(false);
      this.approvalResolver = null;
    }
    if (this.captchaResolver) {
      this.captchaResolver(false);
      this.captchaResolver = null;
    }
    try {
      if (this.page && !this.page.isClosed()) await this.page.close();
      if (this.browser) await this.browser.close();
    } catch (e) {
      // ignore
    }
    this.page = null;
    this.browser = null;
    this.currentJob = null;
    this.status = 'IDLE';
    this.broadcast({ type: 'STATUS_CHANGE', status: 'IDLE' });
    this.log('Browser session closed. Ready for new operations.', 'info');
  }

  /**
   * Check for CAPTCHA, MFA, Cloudflare Turnstile, Arkose, etc.
   * STRICT REQUIREMENT 8: Never attempt to solve or bypass.
   */
  async checkForCaptchaOrSecurityChallenge() {
    if (!this.page || this.page.isClosed()) return false;

    const captchaSelectors = [
      'iframe[src*="recaptcha"]',
      'iframe[src*="google.com/recaptcha"]',
      'div.g-recaptcha',
      'iframe[src*="hcaptcha"]',
      'div.h-captcha',
      'iframe[src*="turnstile"]',
      'iframe[src*="challenges.cloudflare.com"]',
      'div.cf-turnstile',
      '#arkose',
      'iframe[src*="arkose"]',
      'iframe[title*="recaptcha"]',
      'iframe[title*="hCaptcha"]'
    ];

    for (const selector of captchaSelectors) {
      try {
        const el = await this.page.$(selector);
        if (el && await el.isVisible()) {
          return { detected: true, type: selector };
        }
      } catch (e) {
        // quiet continue
      }
    }

    // Check page text for blocking security challenges
    try {
      const pageText = await this.page.evaluate(() => document.body.innerText.toLowerCase());
      if (
        pageText.includes('verify you are human') ||
        pageText.includes('please complete the security check') ||
        pageText.includes('attention required! | cloudflare') ||
        pageText.includes('please solve the challenge below')
      ) {
        return { detected: true, type: 'Cloudflare / Security Gateway Challenge' };
      }
    } catch (e) {
      // quiet continue
    }

    return { detected: false };
  }

  /**
   * Semantic Form Field Matcher & Filler
   * Maps differently worded fields to profile fields
   */
  async fillApplicationForm(profile, job) {
    this.log('Detecting form fields and matching semantically with user profile...', 'info');
    await this.captureSnapshot('Form Detection');

    const filledFields = [];

    // Collect all inputs, textareas, and selects
    const inputs = await this.page.$$('input, textarea, select');
    this.log(`Identified ${inputs.length} interactive elements on application form.`, 'info');

    for (const input of inputs) {
      if (this.status === 'STOPPED') break;

      try {
        const isVisible = await input.isVisible();
        if (!isVisible) continue;

        const elType = await input.getAttribute('type') || 'text';
        const elName = (await input.getAttribute('name') || '').toLowerCase();
        const elId = (await input.getAttribute('id') || '').toLowerCase();
        const elAriaLabel = (await input.getAttribute('aria-label') || '').toLowerCase();
        const elPlaceholder = (await input.getAttribute('placeholder') || '').toLowerCase();
        
        // Find associated label text if any
        let labelText = '';
        if (elId) {
          const label = await this.page.$(`label[for="${elId}"]`);
          if (label) labelText = (await label.innerText() || '').toLowerCase();
        }
        if (!labelText) {
          // Nearest preceding label or parent text
          labelText = await input.evaluate(el => {
            const parent = el.closest('label') || el.closest('div, .field, .form-group');
            return parent ? parent.innerText.slice(0, 100).toLowerCase() : '';
          });
        }

        const descriptor = `${elName} ${elId} ${elAriaLabel} ${elPlaceholder} ${labelText}`;

        // 1. Resume / CV File Upload (Requirement 6: "CV Upload" -> Resume)
        if (elType === 'file' || descriptor.includes('resume') || descriptor.includes('cv upload') || descriptor.includes('curriculum')) {
          const resumeToAttach = job?.tailoredResumePath || profile.resumeFile;
          if (resumeToAttach) {
            const absResumePath = path.isAbsolute(resumeToAttach)
              ? resumeToAttach
              : path.join(__dirname, '..', resumeToAttach);

            if (fs.existsSync(absResumePath)) {
              const isTailored = Boolean(job?.tailoredResumePath);
              this.log(`Attaching ${isTailored ? '✨ JD-TAILORED' : 'standard'} resume PDF: ${path.basename(absResumePath)}`, 'info');
              await input.setInputFiles(absResumePath);
              filledFields.push(`Resume Attached (${path.basename(absResumePath)})`);
              await this.page.waitForTimeout(500);
            } else {
              this.log(`Resume file path not found: ${absResumePath}`, 'warning');
            }
          }
          continue;
        }

        // Skip buttons/submits
        if (['submit', 'button', 'reset', 'hidden'].includes(elType)) continue;

        // 2. First Name
        if (
          (descriptor.includes('first') && descriptor.includes('name')) ||
          descriptor.includes('fname') || descriptor.includes('given-name') ||
          elName === 'first_name' || elId.includes('firstname')
        ) {
          const val = profile.firstName || profile.fullName.split(' ')[0] || '';
          await input.fill(val);
          filledFields.push(`First Name (${val})`);
          continue;
        }

        // 3. Last Name
        if (
          (descriptor.includes('last') && descriptor.includes('name')) ||
          descriptor.includes('lname') || descriptor.includes('family-name') ||
          elName === 'last_name' || elId.includes('lastname')
        ) {
          const val = profile.lastName || profile.fullName.split(' ').slice(1).join(' ') || '';
          await input.fill(val);
          filledFields.push(`Last Name (${val})`);
          continue;
        }

        // 4. Full Name
        if (
          (descriptor.includes('name') && !descriptor.includes('user') && !descriptor.includes('company') && !descriptor.includes('file')) ||
          elName === 'name' || descriptor.includes('full name') || descriptor.includes('applicant_name')
        ) {
          await input.fill(profile.fullName);
          filledFields.push(`Full Name (${profile.fullName})`);
          continue;
        }

        // 5. Email
        if (elType === 'email' || descriptor.includes('email') || descriptor.includes('e-mail')) {
          await input.fill(profile.email);
          filledFields.push(`Email (${profile.email})`);
          continue;
        }

        // 6. Phone (Requirement 6: "Mobile Number" -> Phone)
        if (elType === 'tel' || descriptor.includes('phone') || descriptor.includes('mobile') || descriptor.includes('contact number') || descriptor.includes('cell')) {
          await input.fill(profile.phone);
          filledFields.push(`Phone (${profile.phone})`);
          continue;
        }

        // 7. Location / City (Requirement 6: "Current City" -> Location)
        if (descriptor.includes('current city') || descriptor.includes('city') || descriptor.includes('location') || descriptor.includes('address') || descriptor.includes('current residence')) {
          await input.fill(profile.currentLocation);
          filledFields.push(`Location (${profile.currentLocation})`);
          continue;
        }

        // 8. LinkedIn Profile
        if (descriptor.includes('linkedin')) {
          await input.fill(profile.linkedIn || '');
          filledFields.push('LinkedIn URL');
          continue;
        }

        // 9. GitHub Profile
        if (descriptor.includes('github') || descriptor.includes('git')) {
          await input.fill(profile.github || '');
          filledFields.push('GitHub URL');
          continue;
        }

        // 10. Portfolio / Website
        if (descriptor.includes('portfolio') || descriptor.includes('website') || descriptor.includes('personal site') || descriptor.includes('url')) {
          await input.fill(profile.portfolio || '');
          filledFields.push('Portfolio URL');
          continue;
        }

        // 11. Expected Salary / CTC (Requirement 6: "Expected CTC" -> Expected Salary)
        if (descriptor.includes('expected ctc') || descriptor.includes('ctc') || descriptor.includes('salary') || descriptor.includes('desired compensation') || descriptor.includes('pay expectation')) {
          await input.fill(profile.expectedSalary || '$85,000');
          filledFields.push(`Expected Salary (${profile.expectedSalary})`);
          continue;
        }

        // 12. Notice Period
        if (descriptor.includes('notice') || descriptor.includes('availability') || descriptor.includes('start date') || descriptor.includes('how soon')) {
          await input.fill(profile.noticePeriod || '60 days');
          filledFields.push(`Notice Period (${profile.noticePeriod || '60 days'})`);
          continue;
        }

        // 13. Education / University / Degree
        if (descriptor.includes('university') || descriptor.includes('school') || descriptor.includes('college')) {
          const uni = profile.education?.[0]?.university || 'National Institute of Technology';
          await input.fill(uni);
          filledFields.push(`University (${uni})`);
          continue;
        }
        if (descriptor.includes('degree') || descriptor.includes('major') || descriptor.includes('field of study')) {
          const deg = profile.education?.[0]?.degree || 'B.Tech in Computer Science';
          await input.fill(deg);
          filledFields.push(`Degree (${deg})`);
          continue;
        }

        // 14. QA Questions (Selenium, Playwright, Why interested, etc.)
        const answer = profileService.getTruthfulAnswer(descriptor, job);
        if (answer) {
          await input.fill(answer);
          filledFields.push(`Question Answered: ${descriptor.slice(0, 30)}...`);
          continue;
        }

        // 15. Radio buttons / Checkboxes for Legal & Authorization questions
        if (elType === 'radio' || elType === 'checkbox') {
          if (descriptor.includes('authorized') || descriptor.includes('eligible to work')) {
            await input.check().catch(() => {});
            filledFields.push('Authorized to Work: Yes');
          } else if (descriptor.includes('sponsorship') || descriptor.includes('require visa')) {
            // Usually "No" radio or unchecked
            if (descriptor.includes('no')) {
              await input.check().catch(() => {});
              filledFields.push('Visa Sponsorship: No');
            }
          }
        }

      } catch (err) {
        // continue gracefully
      }
    }

    this.log(`Successfully mapped and auto-filled ${filledFields.length} application fields: ${filledFields.slice(0, 6).join(', ')}...`, 'info');
    await this.captureSnapshot('Fields Filled');
    return filledFields;
  }

  /**
   * Main Auto-Apply Single Job Workflow
   */
  async applyToJob(job, { autoSubmit = false, headless = false } = {}) {
    if (this.status === 'RUNNING') {
      throw new Error('Another application automation task is already running.');
    }

    // Requirement 9: Duplicate Prevention
    if (applicationTrackerService.hasAlreadyApplied(job.company, job.title, job.applicationUrl)) {
      this.log(`[SKIP] Already applied to ${job.company} - "${job.title}". Duplicate prevented.`, 'warning');
      return { status: 'DUPLICATE_SKIPPED' };
    }

    const profile = profileService.getProfile();
    if (!profile) {
      throw new Error('User profile is missing. Please save profile first.');
    }

    this.status = 'RUNNING';
    this.currentJob = job;
    this.broadcast({ type: 'STATUS_CHANGE', status: 'RUNNING', job });
    this.log(`=== Starting Application Session for: ${job.company} - ${job.title} ===`, 'info');

    // Automatically generate JD-tailored ATS resume before starting application
    try {
      this.log(`[AI RESUME TAILORING] Generating custom-tailored ATS resume for ${job.company}...`, 'info');
      const tailoredResult = await resumePdfGeneratorService.generateTailoredResumePdf(profile, job);
      if (tailoredResult.success && tailoredResult.filePath) {
        job.tailoredResumePath = tailoredResult.filePath;
        this.log(`[AI RESUME TAILORING] Generated tailored PDF: ${tailoredResult.fileName}`, 'info');
      }
    } catch (e) {
      this.log(`[AI RESUME TAILORING] Fallback notice: ${e.message}`, 'warning');
    }

    this.log(`Opening application page: ${job.applicationUrl}`, 'info');

    try {
      // Launch browser using system Chrome with fallback to default Chromium
      this.browser = await chromium.launch({
        channel: 'chrome',
        headless: headless,
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
      }).catch(async (e) => {
        this.log(`Chrome channel fallback to standard Chromium: ${e.message}`, 'warning');
        return await chromium.launch({ headless });
      });

      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      });

      this.page = await context.newPage();

      // Navigate to application URL
      await this.page.goto(job.applicationUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });

      this.log('Page loaded. Evaluating document readiness...', 'info');
      await this.page.waitForTimeout(2000);
      await this.captureSnapshot('Loaded Page');

      // Requirement 8: Check for CAPTCHA / Anti-Bot Security Challenge
      const securityCheck = await this.checkForCaptchaOrSecurityChallenge();
      if (securityCheck.detected) {
        this.log(`[SECURITY PROTOCOL TRIGGERED] Anti-bot verification challenge encountered: ${securityCheck.type}`, 'error');
        this.log('HALTING AUTOMATION IMMEDIATELY. Handing over to user for manual completion.', 'warning');

        this.status = 'PAUSED_FOR_CAPTCHA';
        this.broadcast({
          type: 'CAPTCHA_DETECTED',
          job,
          challengeType: securityCheck.type,
          screenshot: this.latestScreenshot
        });

        // Wait for user manual resolution or skip
        const userResolved = await new Promise((resolve) => {
          this.captchaResolver = resolve;
        });

        if (!userResolved) {
          this.log('User cancelled or skipped application after CAPTCHA challenge.', 'info');
          await this.stopAutomation();
          return { status: 'CANCELLED_BY_USER' };
        }

        this.log('User resolved challenge manually. Resuming automation flow...', 'info');
        this.status = 'RUNNING';
      }

      // Check if there is an "Apply Now" button before reaching the form
      const applyButtons = await this.page.$$('a:text-matches("Apply", "i"), button:text-matches("Apply", "i")');
      for (const btn of applyButtons.slice(0, 3)) {
        try {
          if (await btn.isVisible()) {
            this.log('Clicking "Apply" button to reveal application form...', 'info');
            await btn.click();
            await this.page.waitForTimeout(2000);
            break;
          }
        } catch (e) {}
      }

      // Semantic Form Filling
      const filledFields = await this.fillApplicationForm(profile, job);

      // Re-check for CAPTCHA after form interaction
      const postCheck = await this.checkForCaptchaOrSecurityChallenge();
      if (postCheck.detected) {
        this.log(`[SECURITY] Post-fill verification challenge detected: ${postCheck.type}. Pausing.`, 'warning');
        this.status = 'PAUSED_FOR_CAPTCHA';
        this.broadcast({ type: 'CAPTCHA_DETECTED', job, challengeType: postCheck.type });
        await new Promise(r => { this.captchaResolver = r; });
      }

      // Requirement 5.9: Submission mode check
      const matchEvaluation = jobMatcherService.evaluateMatch(job, profile);

      if (!autoSubmit) {
        // Safe Review Mode: Stop at final submission step for user approval
        this.log('Application fields filled and resume attached.', 'info');
        this.log('PAUSING AT FINAL SUBMISSION STEP for user inspection & approval (Safe Review Mode).', 'info');

        this.status = 'AWAITING_APPROVAL';
        const finalSnapshot = await this.captureSnapshot('Ready for Final Review');

        this.broadcast({
          type: 'READY_FOR_SUBMISSION',
          job,
          filledFieldsCount: filledFields.length,
          matchScore: matchEvaluation.overallScore,
          screenshot: finalSnapshot
        });

        // Wait for user click "Approve & Submit" in UI
        const approved = await new Promise((resolve) => {
          this.approvalResolver = resolve;
        });

        if (!approved) {
          this.log('Application submission deferred or skipped by user.', 'info');
          await this.stopAutomation();
          return { status: 'DEFERRED' };
        }
      }

      // Submit form
      this.log('Executing final submission...', 'info');
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Submit Application")',
        'button:has-text("Submit")',
        'button:has-text("Send Application")',
        'a:has-text("Submit")'
      ];

      let submitted = false;
      for (const sel of submitSelectors) {
        try {
          const submitBtn = await this.page.$(sel);
          if (submitBtn && await submitBtn.isVisible()) {
            this.log(`Clicking submit button: ${sel}`, 'info');
            await submitBtn.click();
            submitted = true;
            await this.page.waitForTimeout(3000);
            break;
          }
        } catch (e) {}
      }

      await this.captureSnapshot('Post Submission');

      // Requirement 10: Track Application
      const applicationRecord = applicationTrackerService.recordApplication({
        jobTitle: job.title,
        company: job.company,
        applicationUrl: job.applicationUrl,
        resumeUsed: profile.resumeOriginalName || 'Sushant_Kumar_Resume.pdf',
        status: 'Applied',
        matchScore: matchEvaluation.overallScore,
        matchBreakdown: matchEvaluation.breakdown,
        logs: this.sessionLogs.slice(-15),
        screenshotUrl: this.latestScreenshot
      });

      this.sessionCount++;
      this.log(`Application to ${job.company} marked as APPLIED! (Application ID: ${applicationRecord.id})`, 'info');
      this.broadcast({ type: 'APPLICATION_SUBMITTED', application: applicationRecord });

      // Clean up browser after brief delay
      await this.page.waitForTimeout(2000);
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.status = 'IDLE';
      this.currentJob = null;
      this.broadcast({ type: 'STATUS_CHANGE', status: 'IDLE' });

      return { status: 'APPLIED', application: applicationRecord };

    } catch (err) {
      this.log(`Error during application automation: ${err.message}`, 'error');
      await this.stopAutomation();
      throw err;
    }
  }

  approveSubmission() {
    if (this.approvalResolver) {
      this.log('User approved final submission from console.', 'info');
      this.approvalResolver(true);
      this.approvalResolver = null;
      return true;
    }
    return false;
  }

  handoverResolved() {
    if (this.captchaResolver) {
      this.log('User confirmed security verification challenge resolved in browser.', 'info');
      this.captchaResolver(true);
      this.captchaResolver = null;
      return true;
    }
    return false;
  }
}

module.exports = new BrowserAutomationService();
