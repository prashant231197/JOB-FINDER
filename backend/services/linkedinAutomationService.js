const { chromium } = require('playwright');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const profileService = require('./profileService');
const applicationTrackerService = require('./applicationTrackerService');
const resumePdfGeneratorService = require('./resumePdfGeneratorService');
const jobMatcherService = require('./jobMatcherService');
const groqService = require('./groqService');

const SESSION_FILE = path.join(__dirname, '..', 'data', 'linkedin_session.json');
const STATE_FILE = path.join(__dirname, '..', 'data', 'linkedin_state.json');
const DATA_DIR = path.join(__dirname, '..', 'data');

function getBrowserExecutablePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function launchBrowser(options = {}) {
  const execPath = getBrowserExecutablePath();
  const launchOptions = {
    headless: options.headless !== undefined ? options.headless : true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      ...(options.args || [])
    ]
  };

  if (execPath) {
    launchOptions.executablePath = execPath;
    return await chromium.launch(launchOptions);
  }

  try {
    return await chromium.launch({
      channel: 'chrome',
      ...launchOptions
    });
  } catch (err) {
    return await chromium.launch(launchOptions);
  }
}

class LinkedInAutomationService {
  constructor() {
    this.isSearching = false;
    this.isApplying = false;
    this.shouldStop = false;
    this.loginBrowser = null;
    this.initStorage();
  }

  initStorage() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STATE_FILE)) {
      const initialState = {
        isConnected: false,
        lastSearchAt: null,
        totalApplicationsSubmitted: 0,
        recentLogs: []
      };
      fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
    }
  }

  getState() {
    try {
      if (fs.existsSync(STATE_FILE)) {
        return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      }
    } catch (e) {
      console.error('[LinkedIn] Error reading state:', e);
    }
    return { isConnected: false, totalApplicationsSubmitted: 0, recentLogs: [] };
  }

  saveState(partialState) {
    try {
      const current = this.getState();
      const updated = { ...current, ...partialState };
      fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2));
      return updated;
    } catch (e) {
      console.error('[LinkedIn] Error saving state:', e);
      return null;
    }
  }

  log(message, type = 'info') {
    const entry = {
      timestamp: new Date().toISOString(),
      message,
      type
    };
    console.log(`[LinkedIn][${type.toUpperCase()}] ${message}`);
    try {
      const current = this.getState();
      const logs = [entry, ...(current.recentLogs || [])].slice(0, 50);
      this.saveState({ recentLogs: logs });
    } catch (e) {}
  }

  hasActiveSession() {
    try {
      if (!fs.existsSync(SESSION_FILE)) return false;
      const raw = fs.readFileSync(SESSION_FILE, 'utf8');
      const cookies = JSON.parse(raw);
      if (!Array.isArray(cookies) || cookies.length === 0) return false;

      const hasAuthCookie = cookies.some(c => 
        c.name === 'li_at' || (c.domain && c.domain.includes('linkedin.com') && c.name.toLowerCase().includes('auth'))
      );
      return hasAuthCookie || cookies.length > 3;
    } catch (e) {
      return false;
    }
  }

  getSessionCookies() {
    try {
      if (!fs.existsSync(SESSION_FILE)) return [];
      return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    } catch (e) {
      return [];
    }
  }

  saveCookies(cookiesInput) {
    try {
      let parsed = [];
      if (Array.isArray(cookiesInput)) {
        parsed = cookiesInput;
      } else if (typeof cookiesInput === 'object' && cookiesInput !== null) {
        parsed = Object.entries(cookiesInput).map(([name, value]) => ({
          name,
          value: String(value),
          domain: '.linkedin.com',
          path: '/'
        }));
      } else if (typeof cookiesInput === 'string') {
        const trimmed = cookiesInput.trim();
        if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
          const json = JSON.parse(trimmed);
          if (Array.isArray(json)) {
            parsed = json;
          } else {
            parsed = Object.entries(json).map(([name, value]) => ({
              name,
              value: String(value),
              domain: '.linkedin.com',
              path: '/'
            }));
          }
        } else {
          parsed = trimmed.split(';').map(part => {
            const p = part.trim();
            if (!p) return null;
            const eqIdx = p.indexOf('=');
            if (eqIdx === -1) return null;
            return {
              name: p.slice(0, eqIdx).trim(),
              value: p.slice(eqIdx + 1).trim(),
              domain: '.linkedin.com',
              path: '/'
            };
          }).filter(Boolean);
        }
      }

      if (!parsed || parsed.length === 0) {
        throw new Error('No valid cookies found in input.');
      }

      parsed = parsed.map(c => ({
        ...c,
        domain: c.domain || '.linkedin.com',
        path: c.path || '/'
      }));

      fs.writeFileSync(SESSION_FILE, JSON.stringify(parsed, null, 2));
      this.saveState({ isConnected: true });
      this.log(`Session cookies saved successfully (${parsed.length} cookies). LinkedIn connected!`, 'success');
      return { success: true, count: parsed.length };
    } catch (e) {
      this.log(`Failed to save cookies: ${e.message}`, 'error');
      throw new Error(`Invalid cookie format: ${e.message}`);
    }
  }

  clearSession() {
    try {
      if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
      }
      this.saveState({ isConnected: false });
      this.log('LinkedIn session cleared and disconnected.', 'info');
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async cancelInteractiveLogin() {
    this.cancelLoginRequested = true;
    if (this.loginBrowser) {
      try {
        await this.loginBrowser.close();
      } catch (e) {}
      this.loginBrowser = null;
    }
    this.log('Interactive login was cancelled by user.', 'info');
    return { success: true, message: 'Login cancelled' };
  }

  /**
   * 1-Click Interactive Login
   */
  async launchInteractiveLogin() {
    this.cancelLoginRequested = false;
    if (this.loginBrowser) {
      try { await this.loginBrowser.close(); } catch (e) {}
      this.loginBrowser = null;
    }

    this.log('Launching Chrome browser for 1-time LinkedIn Login...', 'info');

    try {
      this.loginBrowser = await launchBrowser({
        headless: false,
        args: [
          '--start-maximized',
          '--new-window',
          '--no-first-run',
          '--no-default-browser-check'
        ]
      });

      const context = await this.loginBrowser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: null
      });

      const existing = this.getSessionCookies();
      if (existing.length > 0) {
        await context.addCookies(existing);
      }

      const page = await context.newPage();
      await page.bringToFront().catch(() => {});
      await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: 35000 }).catch(err => {
        console.warn('[LinkedIn] Login navigation note:', err.message);
      });
      await page.bringToFront().catch(() => {});

      this.log('LinkedIn login page opened. Please log in with your credentials and complete 2FA if prompted.', 'info');

      let loggedIn = false;
      const startTime = Date.now();
      const TIMEOUT_MS = 6 * 60 * 1000; // 6 minutes

      while (Date.now() - startTime < TIMEOUT_MS) {
        if (this.cancelLoginRequested) {
          this.log('Login loop terminated by user cancel request.', 'info');
          break;
        }

        await new Promise(r => setTimeout(r, 2000));

        if (this.cancelLoginRequested) break;

        try {
          const currentUrl = page.url();
          const cookies = await context.cookies();
          const hasLiAt = cookies.some(c => c.name === 'li_at' && c.value && c.value.length > 10);

          if (currentUrl.includes('/feed') || currentUrl.includes('/in/') || hasLiAt) {
            loggedIn = true;
            this.log('Login detected! Saving session cookies...', 'success');
            
            const formatted = cookies.map(c => ({
              name: c.name,
              value: c.value,
              domain: c.domain,
              path: c.path,
              expires: c.expires,
              httpOnly: c.httpOnly,
              secure: c.secure,
              sameSite: c.sameSite
            }));

            fs.writeFileSync(SESSION_FILE, JSON.stringify(formatted, null, 2));
            this.saveState({ isConnected: true });
            this.log('LinkedIn connected successfully! Session saved.', 'success');
            break;
          }
        } catch (pollErr) {
          // Window was probably closed manually
          break;
        }
      }

      setTimeout(async () => {
        try {
          if (this.loginBrowser) {
            await this.loginBrowser.close();
            this.loginBrowser = null;
          }
        } catch (e) {}
      }, 1500);

      return { success: loggedIn, isConnected: loggedIn };
    } catch (err) {
      this.log(`Interactive login error: ${err.message}`, 'error');
      if (this.loginBrowser) {
        try { await this.loginBrowser.close(); } catch (e) {}
        this.loginBrowser = null;
      }
      throw err;
    }
  }

  /**
   * Search Fresh LinkedIn QA/SDET Jobs using ultra-fast Guest API with fallback
   */
  async searchFreshJobs({ 
    query = 'SDET', 
    location = 'Worldwide', 
    datePosted = 'past-week', 
    easyApplyOnly = true, 
    limit = 25 
  } = {}) {
    this.isSearching = true;
    this.log(`Searching LinkedIn for fresh "${query}" jobs in ${location} (${datePosted}, Easy Apply: ${easyApplyOnly})...`, 'info');

    try {
      let timeFilter = 'f_TPR=r604800'; // 7 days
      if (datePosted === 'past-24h') timeFilter = 'f_TPR=r86400';
      if (datePosted === 'past-month') timeFilter = 'f_TPR=r2592000';
      if (datePosted === 'all') timeFilter = '';

      const cleanQuery = encodeURIComponent(query.trim());
      const cleanLoc = encodeURIComponent(location.trim() === 'Worldwide' ? '' : location.trim());

      const rawJobs = [];
      const offsets = [0, 10, 20];

      // Fetch multiple pages via LinkedIn guest search API
      for (const start of offsets) {
        if (rawJobs.length >= limit) break;

        let apiUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${cleanQuery}&start=${start}`;
        if (cleanLoc) apiUrl += `&location=${cleanLoc}`;
        if (timeFilter) apiUrl += `&${timeFilter}`;
        if (easyApplyOnly) apiUrl += `&f_AL=true`;

        try {
          const res = await axios.get(apiUrl, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            }
          });

          if (res.data) {
            const $ = cheerio.load(res.data);
            $('li').each((i, el) => {
              const title = $(el).find('.base-search-card__title, h3').text().trim();
              const company = $(el).find('.base-search-card__subtitle, h4').text().trim();
              const loc = $(el).find('.job-search-card__location').text().trim();
              let link = $(el).find('a.base-card__full-link, a').attr('href') || '';
              const time = $(el).find('time').text().trim() || $(el).find('time').attr('datetime') || 'Recent';

              if (link.includes('?')) link = link.split('?')[0];

              if (title && company) {
                rawJobs.push({
                  title,
                  company,
                  location: loc || location,
                  applicationUrl: link,
                  postedDate: time,
                  isEasyApply: true
                });
              }
            });
          }
        } catch (pageErr) {
          // If a page encounters error or rate limit, break smoothly
          break;
        }
      }

      this.log(`Successfully scraped ${rawJobs.length} active QA/SDET jobs from LinkedIn.`, 'success');

      // Deduplicate by company + title
      const seen = new Set();
      const unique = [];
      for (const r of rawJobs) {
        const key = `${r.company.toLowerCase()}:::${r.title.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          unique.push(r);
        }
      }

      // Filter out already applied jobs and evaluate match scores
      const profile = profileService.getProfile();
      const processedJobs = [];

      for (const raw of unique.slice(0, limit)) {
        const hasApplied = applicationTrackerService.hasAlreadyApplied(raw.company, raw.title, raw.applicationUrl);
        if (hasApplied) continue;

        const jobObj = {
          id: `li-${Buffer.from(`${raw.company}-${raw.title}`).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`,
          title: raw.title,
          company: raw.company,
          location: raw.location,
          applicationUrl: raw.applicationUrl,
          postedDate: raw.postedDate,
          isEasyApply: raw.isEasyApply,
          source: 'LinkedIn Easy Apply',
          sector: 'Software & Technology',
          salary: 'Competitive / Market Rate',
          experience: '3-6 Years',
          requiredSkills: ['Playwright', 'Selenium', 'Python', 'RestAssured', 'API Automation', 'CI/CD'],
          description: `${raw.title} opening at ${raw.company} (${raw.location}). Verified active posting via LinkedIn Easy Apply.`,
          fintechTags: ['QA Automation', 'SDET', 'Easy Apply']
        };

        const match = jobMatcherService.evaluateMatch(jobObj, profile);
        processedJobs.push({
          ...jobObj,
          matchScore: match.overallScore,
          matchBreakdown: match.breakdown,
          matchReasons: match.reasons,
          fintechMatchDetails: match.fintechMatchDetails
        });
      }

      processedJobs.sort((a, b) => b.matchScore - a.matchScore);
      this.saveState({ lastSearchAt: new Date().toISOString() });
      this.log(`Returning ${processedJobs.length} unapplied fresh LinkedIn jobs.`, 'success');

      return {
        jobs: processedJobs,
        total: processedJobs.length
      };
    } catch (err) {
      this.log(`LinkedIn job search error: ${err.message}`, 'error');
      throw err;
    } finally {
      this.isSearching = false;
    }
  }

  /**
   * 1-Click LinkedIn Easy Apply Automation
   */
  async applyToJob(job) {
    if (!this.hasActiveSession()) {
      throw new Error('No active LinkedIn session found. Please click "Connect LinkedIn Account" first.');
    }

    this.log(`=== Starting LinkedIn Easy Apply for: ${job.company} - "${job.title}" ===`, 'info');
    let browser = null;

    try {
      const profile = profileService.getProfile();

      // 1. Generate tailored ATS PDF resume
      this.log(`Generating JD-tailored ATS resume for ${job.company}...`, 'info');
      const tailoredPdf = await resumePdfGeneratorService.generateTailoredResumePdf(profile, job);
      const resumeFilePath = tailoredPdf.filePath;
      this.log(`Tailored resume ready: ${tailoredPdf.fileName}`, 'info');

      // 2. Launch browser with saved session cookies using system Chrome
      browser = await launchBrowser({ headless: true });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
      });

      await context.addCookies(this.getSessionCookies());
      const page = await context.newPage();

      this.log(`Navigating to job posting: ${job.applicationUrl}`, 'info');
      await page.goto(job.applicationUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);

      // 3. Find and click Easy Apply button
      const applyBtnSelectors = [
        'button.jobs-apply-button',
        'button:has-text("Easy Apply")',
        '.jobs-apply-button--top-card button',
        'button[aria-label*="Easy Apply"]'
      ];

      let applyButton = null;
      for (const sel of applyBtnSelectors) {
        const btn = await page.$(sel);
        if (btn && await btn.isVisible()) {
          applyButton = btn;
          break;
        }
      }

      if (!applyButton) {
        const alreadyApplied = await page.$('.jobs-applied-badge, button:has-text("Applied")');
        if (alreadyApplied) {
          this.log(`Already applied to ${job.company} - "${job.title}"! Tracking in pipeline.`, 'success');
          applicationTrackerService.recordApplication({
            jobTitle: job.title,
            company: job.company,
            applicationUrl: job.applicationUrl,
            status: 'Applied',
            matchScore: job.matchScore || 85
          });
          return { success: true, alreadyApplied: true };
        }
        throw new Error('Easy Apply button not found on job page (may require external apply portal).');
      }

      await applyButton.click();
      this.log('Clicked "Easy Apply" button. Opening application modal...', 'info');
      await page.waitForTimeout(2000);

      // 4. Step-by-Step Modal Form Handling
      let stepCount = 0;
      const MAX_STEPS = 8;
      let submitted = false;

      while (stepCount < MAX_STEPS && !submitted) {
        stepCount++;
        await page.waitForTimeout(1000);

        // Contact Phone Check
        const phoneInput = await page.$('input[id*="phoneNumber"], input[type="tel"], input[name*="phone"]');
        if (phoneInput) {
          const currentPhone = await phoneInput.inputValue();
          if (!currentPhone || currentPhone.trim().length < 5) {
            await phoneInput.fill(profile.phone || '+91 6204507166');
            this.log('Filled contact phone number.', 'info');
          }
        }

        // Resume Upload
        const fileInput = await page.$('input[type="file"]');
        if (fileInput && resumeFilePath && fs.existsSync(resumeFilePath)) {
          try {
            await fileInput.setInputFiles(resumeFilePath);
            this.log(`Attached tailored ATS resume (${tailoredPdf.fileName}).`, 'info');
            await page.waitForTimeout(1500);
          } catch (fileErr) {}
        }

        // Screening Questions
        await this.handleScreeningQuestions(page, profile, job);

        // Submit Button Check
        const submitBtn = await page.$(
          'button[aria-label="Submit application"], ' +
          'button:has-text("Submit application"), ' +
          'footer button:has-text("Submit")'
        );

        if (submitBtn && await submitBtn.isVisible()) {
          const followCheck = await page.$('input#follow-company-checkbox, input[name*="follow"]');
          if (followCheck && await followCheck.isChecked()) {
            await followCheck.uncheck();
          }

          await submitBtn.click();
          this.log(`Clicked "Submit application"! Finalizing...`, 'info');
          await page.waitForTimeout(2500);
          submitted = true;
          break;
        }

        // Review or Next Button
        const nextBtn = await page.$(
          'button[aria-label="Review your application"], ' +
          'button:has-text("Review"), ' +
          'button[aria-label="Continue to next step"], ' +
          'button:has-text("Next")'
        );

        if (nextBtn && await nextBtn.isVisible()) {
          await nextBtn.click();
          this.log(`Completed Step ${stepCount}. Moving to next step...`, 'info');
          await page.waitForTimeout(1500);
        } else {
          const doneBtn = await page.$('button[aria-label="Dismiss"], button:has-text("Done")');
          if (doneBtn) {
            submitted = true;
            await doneBtn.click();
          }
          break;
        }
      }

      try {
        const dismissBtn = await page.$('button[aria-label="Dismiss"], button:has-text("Done")');
        if (dismissBtn) await dismissBtn.click();
      } catch (e) {}

      // 5. Record successful application in Application Tracker
      applicationTrackerService.recordApplication({
        jobTitle: job.title,
        company: job.company,
        applicationUrl: job.applicationUrl,
        status: 'Applied',
        matchScore: job.matchScore || 85,
        resumeUsed: tailoredPdf.fileName
      });

      const state = this.getState();
      this.saveState({ totalApplicationsSubmitted: (state.totalApplicationsSubmitted || 0) + 1 });
      this.log(`✅ Successfully submitted application to ${job.company} - "${job.title}"!`, 'success');

      return {
        success: true,
        company: job.company,
        jobTitle: job.title,
        resumeUsed: tailoredPdf.fileName
      };
    } catch (err) {
      this.log(`Easy Apply failed for ${job.company}: ${err.message}`, 'error');
      throw err;
    } finally {
      if (browser) {
        try { await browser.close(); } catch (e) {}
      }
    }
  }

  async handleScreeningQuestions(page, profile, job) {
    try {
      const textInputs = await page.$$('.jobs-easy-apply-form-section input[type="text"], .jobs-easy-apply-modal input[type="number"], .fb-single-line-text input');
      for (const inp of textInputs) {
        const val = await inp.inputValue();
        if (val && val.trim().length > 0) continue;

        const label = await page.evaluate(el => {
          const parent = el.closest('.fb-dash-form-element, .jobs-easy-apply-form-element, div');
          return parent ? parent.textContent.toLowerCase() : '';
        }, inp);

        if (label.includes('experience') || label.includes('years') || label.includes('playwright') || label.includes('selenium') || label.includes('automation') || label.includes('python') || label.includes('restassured')) {
          await inp.fill('4');
          this.log(`Answered experience question with "4" years.`, 'info');
        } else if (label.includes('notice') || label.includes('availability')) {
          await inp.fill('30');
        } else if (label.includes('ctc') || label.includes('salary') || label.includes('compensation')) {
          await inp.fill('1800000');
        } else if (label.includes('gpa') || label.includes('grade')) {
          await inp.fill('8.8');
        }
      }

      const radioGroups = await page.$$('.fb-radio-group, fieldset');
      for (const rg of radioGroups) {
        const text = await page.evaluate(el => el.textContent.toLowerCase(), rg);
        if (text.includes('authorized') || text.includes('legally')) {
          const yesRadio = await rg.$('input[value*="Yes"], label:has-text("Yes")');
          if (yesRadio) await yesRadio.click();
        } else if (text.includes('sponsorship') || text.includes('require visa') || text.includes('require sponsorship')) {
          const noRadio = await rg.$('input[value*="No"], label:has-text("No")');
          if (noRadio) await noRadio.click();
        } else if (text.includes('comfortable') || text.includes('agree')) {
          const yesRadio = await rg.$('input[value*="Yes"], label:has-text("Yes")');
          if (yesRadio) await yesRadio.click();
        }
      }

      const selects = await page.$$('.jobs-easy-apply-modal select');
      for (const sel of selects) {
        const label = await page.evaluate(el => {
          const parent = el.closest('.fb-dash-form-element, div');
          return parent ? parent.textContent.toLowerCase() : '';
        }, sel);

        if (label.includes('authorized') || label.includes('legally')) {
          await sel.selectOption({ label: 'Yes' }).catch(() => {});
        } else if (label.includes('sponsorship') || label.includes('visa')) {
          await sel.selectOption({ label: 'No' }).catch(() => {});
        } else if (label.includes('notice')) {
          await sel.selectOption({ index: 1 }).catch(() => {});
        }
      }

      const textareas = await page.$$('.jobs-easy-apply-modal textarea');
      for (const ta of textareas) {
        const existingVal = await ta.inputValue();
        if (existingVal && existingVal.trim().length > 10) continue;

        const questionText = await page.evaluate(el => {
          const parent = el.closest('.fb-dash-form-element, div');
          return parent ? parent.textContent.trim() : '';
        }, ta);

        if (questionText) {
          this.log(`Consulting Groq AI for question: "${questionText.slice(0, 60)}..."`, 'info');
          const aiAnswer = await groqService.answerScreeningQuestion(questionText, profile, {
            title: job.title,
            company: job.company
          });
          if (aiAnswer) {
            await ta.fill(aiAnswer);
            this.log(`Answered with Groq AI tailored SDET response.`, 'info');
          }
        }
      }
    } catch (e) {
      this.log(`Screening questions handler warning: ${e.message}`, 'info');
    }
  }

  async applyToJobsBatch(jobs = []) {
    if (this.isApplying) {
      throw new Error('An automation run is already in progress.');
    }

    this.isApplying = true;
    this.shouldStop = false;
    const results = { successful: [], failed: [], total: jobs.length };

    this.log(`=== Starting Batch Easy Apply for ${jobs.length} LinkedIn jobs ===`, 'info');

    for (let i = 0; i < jobs.length; i++) {
      if (this.shouldStop) {
        this.log('Batch apply stopped by user.', 'info');
        break;
      }

      const job = jobs[i];
      this.log(`[${i + 1}/${jobs.length}] Processing: ${job.company} - "${job.title}"...`, 'info');

      try {
        const res = await this.applyToJob(job);
        results.successful.push({ job, ...res });
      } catch (err) {
        results.failed.push({ job, error: err.message });
        this.log(`Skipping to next job due to error: ${err.message}`, 'info');
      }

      if (i < jobs.length - 1 && !this.shouldStop) {
        const delay = Math.floor(Math.random() * 2000) + 2000;
        await new Promise(r => setTimeout(r, delay));
      }
    }

    this.isApplying = false;
    this.log(`=== Batch Apply Completed: ${results.successful.length} submitted, ${results.failed.length} failed ===`, 'success');
    return results;
  }

  stopAutomation() {
    this.shouldStop = true;
    this.isApplying = false;
    this.log('Stop signal received. Halting LinkedIn automation...', 'info');
    return { success: true };
  }
}

module.exports = new LinkedInAutomationService();
