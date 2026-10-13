require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const profileService = require('./services/profileService');
const jobSearchService = require('./services/jobSearchService');
const jobMatcherService = require('./services/jobMatcherService');
const browserAutomationService = require('./services/browserAutomationService');
const applicationTrackerService = require('./services/applicationTrackerService');
const resumePdfGeneratorService = require('./services/resumePdfGeneratorService');
const naukriAutomationService = require('./services/naukriAutomationService');
const linkedinAutomationService = require('./services/linkedinAutomationService');
const multiPlatformJobsService = require('./services/multiPlatformJobsService');
const groqService = require('./services/groqService');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  console.warn('nodemailer load issue:', e.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));

// Multer storage for Resume PDF/DOCX
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// -------------------------------------------------------------
// 1. Profile Endpoints
// -------------------------------------------------------------
app.get('/api/profile', (req, res) => {
  const profile = profileService.getProfile();
  const completeness = profileService.calculateCompleteness(profile);
  res.json({ profile, completeness });
});

app.post('/api/profile', (req, res) => {
  try {
    const updated = profileService.saveProfile(req.body);
    const completeness = profileService.calculateCompleteness(updated);
    res.json({ success: true, profile: updated, completeness });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/resume', upload.single('resume'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No resume file uploaded' });
    }
    const relativePath = `uploads/${req.file.filename}`;
    const updated = profileService.updateResumeFile(relativePath, req.file.originalname);
    const completeness = profileService.calculateCompleteness(updated);
    res.json({
      success: true,
      resumeFile: relativePath,
      resumeOriginalName: req.file.originalname,
      profile: updated,
      completeness
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resume/tailor-pdf', async (req, res) => {
  try {
    const { jobId, job } = req.body;
    let targetJob = job;
    if (!targetJob && jobId) {
      const allJobs = jobSearchService.getAllJobs();
      targetJob = allJobs.find(j => j.id === jobId);
    }
    if (!targetJob) {
      return res.status(400).json({ error: 'Job details or valid jobId required to tailor resume' });
    }
    const profile = profileService.getProfile();
    if (!profile) {
      return res.status(400).json({ error: 'Profile not found' });
    }

    const result = await resumePdfGeneratorService.generateTailoredResumePdf(profile, targetJob);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resume/download-pdf', async (req, res) => {
  try {
    const { targetJob, profile } = req.body;
    const effProfile = profile || profileService.getProfile();
    if (!effProfile) {
      return res.status(400).json({ error: 'Profile not found' });
    }
    const job = targetJob || { title: 'SDET-II', company: 'TargetCompany' };
    const result = await resumePdfGeneratorService.generateTailoredResumePdf(effProfile, job);
    if (result.success && result.filePath && fs.existsSync(result.filePath)) {
      return res.download(result.filePath, result.fileName);
    }
    res.status(500).json({ error: result.error || 'Failed to generate tailored PDF' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download Stored Candidate Resume PDF directly
app.get('/api/resume/raw-download', (req, res) => {
  const profile = profileService.getProfile();
  let relPath = profile?.resumeFile || 'uploads/1788844096376_SDET_II_ARY_PRASHANT.pdf';
  let fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) {
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
    if (files.length > 0) fullPath = path.join(uploadsDir, files[0]);
  }
  if (fs.existsSync(fullPath)) {
    const filename = profile?.resumeOriginalName || `${(profile?.fullName || 'Prashant_Kumar_Ary').replace(/\s+/g, '_')}_SDET_Resume.pdf`;
    return res.download(fullPath, filename);
  }
  res.status(404).json({ error: 'Resume PDF file not found' });
});

// Direct Send Recruiter Email with PDF Attachment via Nodemailer
app.post('/api/recruiter/send-email', upload.single('customResume'), async (req, res) => {
  try {
    if (!nodemailer) {
      return res.status(500).json({ error: 'Nodemailer is not installed or available' });
    }
    const { to, subject, body, senderEmail, senderPassword, saveToProfile, customResumeBase64, customResumeName } = req.body;
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'to, subject, and body are required' });
    }

    const profile = profileService.getProfile();
    let resumePath = null;
    let attachmentFileName = '';
    let attachmentContent = null;

    // 1. Check if user manually uploaded a custom resume file in this request
    if (req.file) {
      resumePath = req.file.path;
      attachmentFileName = req.file.originalname;

      // Also persist to candidate profile if requested
      if (saveToProfile === 'true' || saveToProfile === true) {
        const relPath = `uploads/${req.file.filename}`;
        profileService.updateResumeFile(relPath, req.file.originalname);
      }
    } else if (customResumeBase64) {
      // 2. Custom resume sent as Base64 in JSON body
      attachmentFileName = customResumeName || `${(profile?.fullName || 'Prashant_Kumar_Ary').replace(/\s+/g, '_')}_Resume.pdf`;
      attachmentContent = Buffer.from(customResumeBase64, 'base64');

      if (saveToProfile === 'true' || saveToProfile === true) {
        const safeName = `${Date.now()}_${attachmentFileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const targetPath = path.join(uploadsDir, safeName);
        fs.writeFileSync(targetPath, attachmentContent);
        profileService.updateResumeFile(`uploads/${safeName}`, attachmentFileName);
      }
    } else {
      // 3. Fallback to existing stored candidate resume from profile or uploads folder
      let relPath = profile?.resumeFile || 'uploads/1788844096376_SDET_II_ARY_PRASHANT.pdf';
      resumePath = path.join(__dirname, relPath);
      if (!fs.existsSync(resumePath)) {
        const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.pdf'));
        if (files.length > 0) resumePath = path.join(uploadsDir, files[0]);
      }
      attachmentFileName = profile?.resumeOriginalName || `${(profile?.fullName || 'Prashant_Kumar_Ary').replace(/\s+/g, '_')}_SDET_Resume.pdf`;
    }

    const emailUser = (senderEmail || profile?.email || process.env.SMTP_USER || '').trim();
    const rawPass = (senderPassword || process.env.SMTP_PASS || '').trim();
    // Google App Passwords are 16 characters often formatted with spaces: abcd efgh ijkl mnop
    const emailPass = rawPass.replace(/\s+/g, '');

    if (!emailPass) {
      return res.status(400).json({
        error: 'Gmail 16-character App Password is required to send emails directly with attachments. Or click "Pitch in Gmail" to use web compose with zero setup!'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const attachments = [];
    if (attachmentContent) {
      attachments.push({
        filename: attachmentFileName,
        content: attachmentContent
      });
    } else if (resumePath && fs.existsSync(resumePath)) {
      attachments.push({
        filename: attachmentFileName,
        path: resumePath
      });
    }

    const info = await transporter.sendMail({
      from: `"${profile?.fullName || 'Prashant Kumar Ary'}" <${emailUser}>`,
      to,
      subject,
      text: body,
      attachments
    });

    res.json({
      success: true,
      messageId: info.messageId,
      attachedFileName: attachmentFileName,
      message: `✓ Email successfully sent with ${attachmentFileName} attached!`
    });
  } catch (err) {
    console.error('Failed to send recruiter email:', err);
    let msg = err.message || 'Failed to dispatch email';
    if (msg.includes('534-5.7.9') || msg.includes('Application-specific password required') || msg.includes('InvalidSecondFactor')) {
      msg = 'Google requires a 16-character App Password (not your standard Gmail login password). Go to https://myaccount.google.com/apppasswords to generate one, or click "Open in Gmail Webmail" to send directly without a password.';
    } else if (msg.includes('Invalid login') || msg.includes('Username and Password not accepted')) {
      msg = 'Gmail authentication failed. Please check your Gmail address and 16-character App Password (from myaccount.google.com/apppasswords).';
    }
    res.status(500).json({ error: msg });
  }
});

// Bulk WhatsApp Automation Endpoint via Playwright
let whatsappAutomationService;
try {
  whatsappAutomationService = require('./services/whatsappAutomationService');
} catch (e) {
  console.warn('whatsappAutomationService load issue:', e.message);
}

app.post('/api/recruiter/bulk-whatsapp', async (req, res) => {
  try {
    if (!whatsappAutomationService) {
      return res.status(500).json({ error: 'WhatsApp automation service is not initialized' });
    }
    const { phones, message } = req.body;
    if (!phones || !Array.isArray(phones) || phones.length === 0 || !message) {
      return res.status(400).json({ error: 'A list of phone numbers and a message are required' });
    }

    const results = await whatsappAutomationService.sendBulkMessages(phones, message);
    res.json({ success: true, results });
  } catch (err) {
    console.error('Bulk WhatsApp error:', err);
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 1.5. Naukri.com Automation Endpoints
// -------------------------------------------------------------
app.get('/api/naukri/status', (req, res) => {
  const state = naukriAutomationService.getState();
  const hasSession = naukriAutomationService.hasActiveSession();
  res.json({
    ...state,
    isConnected: hasSession,
    hasSession
  });
});

app.post('/api/naukri/login-interactive', async (req, res) => {
  try {
    const result = await naukriAutomationService.launchInteractiveLogin();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/naukri/save-cookies', (req, res) => {
  try {
    const { cookies } = req.body;
    const result = naukriAutomationService.saveCookies(cookies);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/naukri/disconnect', (req, res) => {
  const result = naukriAutomationService.clearSession();
  res.json(result);
});

app.post('/api/naukri/boost', async (req, res) => {
  try {
    const { headline } = req.body || {};
    const result = await naukriAutomationService.boostProfile(headline);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/naukri/search', async (req, res) => {
  try {
    const { keyword, location, experience, freshnessDays, hideApplied, limit } = req.body || {};
    const jobs = await naukriAutomationService.searchNaukriJobs({ 
      keyword, 
      location, 
      experience, 
      freshnessDays: freshnessDays !== undefined ? parseInt(freshnessDays) : 7,
      hideApplied: hideApplied !== undefined ? Boolean(hideApplied) : true,
      limit 
    });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/naukri/apply', async (req, res) => {
  try {
    const { job } = req.body;
    if (!job) {
      return res.status(400).json({ error: 'Job details required for application' });
    }
    const result = await naukriAutomationService.applyToNaukriJob(job);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 1.8. LinkedIn.com Automation Endpoints
// -------------------------------------------------------------
app.get('/api/linkedin/status', (req, res) => {
  const state = linkedinAutomationService.getState();
  const hasSession = linkedinAutomationService.hasActiveSession();
  res.json({
    ...state,
    isConnected: hasSession,
    hasSession
  });
});

app.post('/api/linkedin/login-interactive', async (req, res) => {
  try {
    const result = await linkedinAutomationService.launchInteractiveLogin();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/linkedin/save-cookies', (req, res) => {
  try {
    const { cookies } = req.body;
    const result = linkedinAutomationService.saveCookies(cookies);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/linkedin/disconnect', (req, res) => {
  const result = linkedinAutomationService.clearSession();
  res.json(result);
});

app.post('/api/linkedin/cancel-login', async (req, res) => {
  const result = await linkedinAutomationService.cancelInteractiveLogin();
  res.json(result);
});

app.post('/api/linkedin/search', async (req, res) => {
  try {
    const { query, location, datePosted, easyApplyOnly, limit } = req.body || {};
    const result = await linkedinAutomationService.searchFreshJobs({
      query,
      location,
      datePosted,
      easyApplyOnly,
      limit: limit ? parseInt(limit, 10) : 25
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/linkedin/apply', async (req, res) => {
  try {
    const { job } = req.body;
    if (!job) return res.status(400).json({ error: 'Job required' });
    const result = await linkedinAutomationService.applyToJob(job);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/linkedin/apply-batch', async (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'Jobs array required' });
    }
    const result = await linkedinAutomationService.applyToJobsBatch(jobs);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/linkedin/stop', (req, res) => {
  const result = linkedinAutomationService.stopAutomation();
  res.json(result);
});

// -------------------------------------------------------------
// 1.9. Multi-Platform Job Hub Endpoints (35+ Platforms across Indian, Startup, Remote, Staffing)
// -------------------------------------------------------------
app.get('/api/platforms/meta', (req, res) => {
  res.json(multiPlatformJobsService.getCategories());
});

app.get('/api/platforms/categories', (req, res) => {
  res.json(multiPlatformJobsService.getCategories());
});

app.get('/api/platforms/list', (req, res) => {
  res.json(multiPlatformJobsService.getPlatformsList());
});

app.get('/api/platforms/credentials', (req, res) => {
  res.json(multiPlatformJobsService.getCredentials());
});

app.get('/api/platforms/daily-target', (req, res) => {
  res.json(multiPlatformJobsService.getDailyTargetStats());
});

app.post('/api/platforms/search', async (req, res) => {
  try {
    const { platform = 'all', category = 'all', query = 'SDET', location = 'Worldwide', datePosted = 'past-week', limit = 40 } = req.body || {};
    const result = await multiPlatformJobsService.searchJobs({
      platform,
      category,
      query,
      location,
      datePosted,
      limit: limit ? parseInt(limit, 10) : 40
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1-Click Auto-Apply for Single Platform Job
app.post('/api/platforms/apply', async (req, res) => {
  try {
    const { job, options } = req.body || {};
    if (!job) return res.status(400).json({ error: 'Job payload required' });
    const result = await multiPlatformJobsService.applyToJob(job, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Batch Auto-Apply for Multiple Selected Platform Jobs
app.post('/api/platforms/apply-batch', async (req, res) => {
  try {
    const { jobs, options } = req.body || {};
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'Jobs array required' });
    }
    const result = await multiPlatformJobsService.applyBatch(jobs, options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Platform Automation Logs
app.get('/api/platforms/automation-logs', (req, res) => {
  res.json({ logs: multiPlatformJobsService.getAutomationLogs() });
});

app.post('/api/platforms/clear-logs', (req, res) => {
  res.json(multiPlatformJobsService.clearAutomationLogs());
});

// Update or Inject Session Credentials for a Platform
app.post('/api/platforms/connect-session', (req, res) => {
  try {
    const { platform, credentials } = req.body || {};
    if (!platform) return res.status(400).json({ error: 'Platform identifier required' });
    const result = multiPlatformJobsService.saveCredentials(platform, credentials);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 2. Settings Endpoints
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  res.json(jobMatcherService.getSettings());
});

app.post('/api/settings', (req, res) => {
  try {
    const saved = jobMatcherService.saveSettings(req.body);
    res.json({ success: true, settings: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3. Job Search & Matching Endpoints
// -------------------------------------------------------------
app.get('/api/jobs', (req, res) => {
  const jobs = jobSearchService.getAllJobs();
  const profile = profileService.getProfile();

  // Attach dynamic match evaluation and exclude applied jobs from radar
  const evaluatedJobs = [];
  for (const j of jobs) {
    const hasApplied = applicationTrackerService.hasAlreadyApplied(j.company, j.title, j.applicationUrl);
    if (hasApplied) {
      continue; // Exclude applied jobs from Job Radar
    }
    const match = jobMatcherService.evaluateMatch(j, profile);
    evaluatedJobs.push({
      ...j,
      matchScore: match.overallScore,
      matchBreakdown: match.breakdown,
      matchReasons: match.reasons,
      fintechMatchDetails: match.fintechMatchDetails,
      disqualified: match.disqualified,
      hasAlreadyApplied: false
    });
  }

  // Sort descending by match score
  evaluatedJobs.sort((a, b) => b.matchScore - a.matchScore);

  res.json({ jobs: evaluatedJobs, total: evaluatedJobs.length });
});

app.post('/api/jobs/search', async (req, res) => {
  try {
    const { query, location, remoteOnly } = req.body;
    const result = await jobSearchService.searchWorldwideQAJobs({ query, location, remoteOnly });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3.5 Fintech 500+ Directory & Copilot Endpoints
// -------------------------------------------------------------
app.get('/api/fintech/companies', (req, res) => {
  try {
    const { search = '', sector = '', country = '', page = 1, limit = 50 } = req.query;
    const result = jobSearchService.getFintechCompanies({
      search,
      sector,
      country,
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 10) || 50
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/fintech/scan', async (req, res) => {
  try {
    const { sector, domainTag, query, limit, company } = req.body;
    if (company) {
      const result = await jobSearchService.scanCompanyRealJobs(company);
      return res.json(result);
    }
    const result = await jobSearchService.scanFintechCompanies({
      sector,
      domainTag,
      query,
      limit: limit || 30
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3.6 Industry Research & 10-Day Call Fast-Track Hub
app.get('/api/industry-research', (req, res) => {
  try {
    const researchFile = path.join(__dirname, 'data', 'industry_research.json');
    if (fs.existsSync(researchFile)) {
      const data = JSON.parse(fs.readFileSync(researchFile, 'utf8'));
      return res.json(data);
    }
    res.status(404).json({ error: 'Industry research data not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fintech/copilot/:jobId', (req, res) => {
  try {
    const { jobId } = req.params;
    const allJobs = jobSearchService.getAllJobs();
    const job = allJobs.find(j => j.id === jobId);
    const profile = profileService.getProfile();

    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!profile) return res.status(400).json({ error: 'Profile not found' });

    const match = jobMatcherService.evaluateMatch(job, profile);

    // Generate tailored domain answers for this specific job context
    const tailoredAnswers = [
      {
        question: "Why are you interested in this position?",
        answer: `I am excited about the ${job.title} opportunity at ${job.company}. My 5+ years of quality engineering experience in scalable automation frameworks (Playwright, Selenium, RestAssured) directly align with your engineering standards. I am particularly eager to contribute to ${job.company}'s mission-critical transaction and payment systems.`
      },
      {
        question: "Describe your experience with ISO 8583 / ISO 8989 / Financial Messaging & Switch Testing",
        answer: profileService.getTruthfulAnswer("iso 8583 payment switch testing", job)
      },
      {
        question: "Describe your experience with Payment Gateways, Card Lifecycle, 3DS & Tokenization",
        answer: profileService.getTruthfulAnswer("payment gateway card tokenization 3ds", job)
      },
      {
        question: "Describe your Test Automation Architecture & CI/CD Pipeline integration",
        answer: profileService.getTruthfulAnswer("sdet automation tester framework architecture", job)
      }
    ];

    // Universal bookmarklet script that user can drag or run to autofill fields on application page
    const bookmarkletScript = `javascript:(function(){
      const data = {
        name: "${profile.fullName || ''}",
        firstName: "${profile.firstName || ''}",
        lastName: "${profile.lastName || ''}",
        email: "${profile.email || ''}",
        phone: "${profile.phone || ''}",
        city: "${profile.currentLocation || ''}",
        linkedin: "${profile.linkedIn || ''}",
        github: "${profile.github || ''}",
        portfolio: "${profile.portfolio || ''}",
        notice: "${profile.noticePeriod || '60 days'}",
        salary: "${profile.expectedSalary || '$85,000'}"
      };
      let filled = 0;
      document.querySelectorAll('input, textarea').forEach(el => {
        const text = (el.name + ' ' + el.id + ' ' + (el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || '')).toLowerCase();
        if (text.includes('first') && text.includes('name')) { el.value = data.firstName; filled++; }
        else if (text.includes('last') && text.includes('name')) { el.value = data.lastName; filled++; }
        else if (text.includes('name') && !text.includes('user') && !text.includes('company')) { el.value = data.name; filled++; }
        else if (el.type === 'email' || text.includes('email')) { el.value = data.email; filled++; }
        else if (el.type === 'tel' || text.includes('phone') || text.includes('mobile')) { el.value = data.phone; filled++; }
        else if (text.includes('city') || text.includes('location')) { el.value = data.city; filled++; }
        else if (text.includes('linkedin')) { el.value = data.linkedin; filled++; }
        else if (text.includes('github')) { el.value = data.github; filled++; }
        else if (text.includes('portfolio') || text.includes('website')) { el.value = data.portfolio; filled++; }
        else if (text.includes('notice') || text.includes('availability')) { el.value = data.notice; filled++; }
        else if (text.includes('salary') || text.includes('ctc') || text.includes('compensation')) { el.value = data.salary; filled++; }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      });
      alert('✓ QA Hunter Form Filler: Successfully autofilled ' + filled + ' application fields!');
    })();`;

    res.json({
      job,
      matchScore: match.overallScore,
      matchBreakdown: match.breakdown,
      matchReasons: match.reasons,
      fintechMatchDetails: match.fintechMatchDetails,
      applicantData: {
        fullName: profile.fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        currentLocation: profile.currentLocation,
        linkedIn: profile.linkedIn,
        github: profile.github,
        portfolio: profile.portfolio,
        noticePeriod: profile.noticePeriod,
        expectedSalary: profile.expectedSalary,
        resumeOriginalName: profile.resumeOriginalName,
        yearsOfExperience: profile.yearsOfExperience
      },
      tailoredAnswers,
      bookmarkletScript
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Screening Question Answerer for Form Filler Extension
app.post('/api/ai/answer-question', async (req, res) => {
  try {
    const { question, jobTitle, company } = req.body;
    if (!question) return res.status(400).json({ error: 'Question is required' });
    const profile = profileService.getProfile();
    const answer = await groqService.answerScreeningQuestion(question, profile, { title: jobTitle, company });
    res.json({ success: true, answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs/direct-parse', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    const job = await jobSearchService.parseDirectJobUrl(url);
    const profile = profileService.getProfile();
    const match = jobMatcherService.evaluateMatch(job, profile);
    res.json({
      success: true,
      job: {
        ...job,
        matchScore: match.overallScore,
        matchBreakdown: match.breakdown,
        matchReasons: match.reasons,
        fintechMatchDetails: match.fintechMatchDetails
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all jobs in radar
app.delete('/api/jobs', (req, res) => {
  try {
    jobSearchService.clearAllJobs();
    res.json({ success: true, message: 'All radar jobs cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  try {
    const idOrUrl = decodeURIComponent(req.params.id);
    jobSearchService.deleteJobMatch({ id: idOrUrl, url: idOrUrl });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove single job from radar by ID, URL, or Company+Title
app.post('/api/jobs/remove', (req, res) => {
  try {
    const { id, url, company, title } = req.body || {};
    const remaining = jobSearchService.deleteJobMatch({ id, url, company, title });
    res.json({ success: true, count: remaining.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk ingest jobs into radar (from Naukri, CSV, Fintech directory)
app.post('/api/jobs/bulk', (req, res) => {
  try {
    const { jobs } = req.body;
    if (!Array.isArray(jobs)) {
      return res.status(400).json({ error: 'Array of jobs is required' });
    }
    const saved = jobSearchService.addJobs(jobs);
    res.json({ success: true, count: saved.length, jobs: saved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 3.8 Application Tracker Pipeline Endpoints
// -------------------------------------------------------------
app.get('/api/applications', (req, res) => {
  try {
    const apps = applicationTrackerService.getAllApplications();
    const metrics = applicationTrackerService.getPipelineMetrics();
    res.json({ applications: apps, metrics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', (req, res) => {
  try {
    const jobTitle = req.body.jobTitle || req.body.title;
    const company = req.body.company;
    const applicationUrl = req.body.applicationUrl || req.body.applyUrl || req.body.url || '';
    const { status, matchScore, matchBreakdown, resumeUsed } = req.body;

    if (!company || !jobTitle) {
      return res.status(400).json({ error: 'Company and Job Title are required' });
    }

    const record = applicationTrackerService.recordApplication({
      jobTitle,
      company,
      applicationUrl,
      status: status || 'Applied',
      matchScore: matchScore || 0,
      matchBreakdown: matchBreakdown || null,
      resumeUsed: resumeUsed || 'Sushant_Kumar_Senior_QA_SDET_Resume.pdf'
    });

    // Automatically remove from radar jobs store
    jobSearchService.deleteJobMatch({
      id: req.body.id,
      url: applicationUrl,
      company,
      title: jobTitle
    });

    res.json({ success: true, application: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/applications/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const updated = applicationTrackerService.updateStatus(req.params.id, status);
    res.json({ success: true, application: updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/applications/:id', (req, res) => {
  try {
    applicationTrackerService.deleteApplication(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// 4. Automation & Live SSE Stream
// -------------------------------------------------------------
app.get('/api/automation/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  browserAutomationService.subscribe(res);
});

app.post('/api/automation/start', async (req, res) => {
  try {
    const { jobId, job, autoSubmit, headless } = req.body;
    let targetJob = job;

    if (!targetJob && jobId) {
      const allJobs = jobSearchService.getAllJobs();
      targetJob = allJobs.find(j => j.id === jobId);
    }

    if (!targetJob) {
      return res.status(400).json({ error: 'Job not found for automation' });
    }

    const settings = jobMatcherService.getSettings();
    const runHeadless = headless !== undefined ? headless : (settings.headless ?? true);
    const shouldAutoSubmit = autoSubmit !== undefined ? autoSubmit : (settings.autoSubmitTrusted ?? false);

    // Launch automation in non-blocking manner or return kickoff confirmation
    res.json({ success: true, message: `Automation launched for ${targetJob.company}` });

    browserAutomationService.applyToJob(targetJob, {
      autoSubmit: shouldAutoSubmit,
      headless: runHeadless
    }).catch(err => {
      console.error('[Automation Error]', err.message);
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/stop', async (req, res) => {
  try {
    await browserAutomationService.stopAutomation();
    res.json({ success: true, message: 'Automation halted by Kill Switch' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/approve', (req, res) => {
  const approved = browserAutomationService.approveSubmission();
  res.json({ success: approved });
});

app.post('/api/automation/handover-resolved', (req, res) => {
  const resolved = browserAutomationService.handoverResolved();
  res.json({ success: resolved });
});


// -------------------------------------------------------------
// 6. Mock ATS Application Form (For safe local testing & demo)
// -------------------------------------------------------------
app.get('/mock-ats/apply', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Greenhouse ATS - Senior QA Automation Engineer Application</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    h1 { font-size: 20px; margin-top: 0; color: #0f172a; }
    p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
    .field { margin-bottom: 18px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #334155; }
    input[type="text"], input[type="email"], input[type="tel"], textarea, select {
      width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px;
    }
    .row { display: flex; gap: 12px; }
    .row .field { flex: 1; }
    button[type="submit"] {
      background: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px;
    }
    button[type="submit"]:hover { background: #0369a1; }
    .success { display: none; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 16px; border-radius: 8px; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Acme Fintech — Senior QA Automation Engineer</h1>
    <p>Please submit your candidate credentials below to apply for this position.</p>

    <div id="success-banner" class="success">
      <h3>🎉 Application Submitted Successfully!</h3>
      <p>Thank you for applying. Our talent team will review your application.</p>
    </div>

    <form id="ats-form" onsubmit="event.preventDefault(); document.getElementById('ats-form').style.display='none'; document.getElementById('success-banner').style.display='block';">
      <div class="row">
        <div class="field">
          <label for="first_name">First Name *</label>
          <input type="text" id="first_name" name="first_name" required>
        </div>
        <div class="field">
          <label for="last_name">Last Name *</label>
          <input type="text" id="last_name" name="last_name" required>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label for="email">Email Address *</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="field">
          <!-- Semantic matching test: "Mobile Number" -> Phone -->
          <label for="mobile_number">Mobile Number *</label>
          <input type="tel" id="mobile_number" name="mobile_number" required>
        </div>
      </div>

      <div class="row">
        <div class="field">
          <!-- Semantic matching test: "Current City" -> Location -->
          <label for="current_city">Current City / Location *</label>
          <input type="text" id="current_city" name="current_city" required>
        </div>
        <div class="field">
          <!-- Semantic matching test: "Expected CTC" -> Expected Salary -->
          <label for="expected_ctc">Expected CTC / Salary ($)</label>
          <input type="text" id="expected_ctc" name="expected_ctc">
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label for="linkedin_url">LinkedIn Profile URL</label>
          <input type="text" id="linkedin_url" name="linkedin_url">
        </div>
        <div class="field">
          <label for="github_profile">GitHub Profile URL</label>
          <input type="text" id="github_profile" name="github_profile">
        </div>
      </div>

      <div class="field">
        <!-- Semantic matching test: "CV Upload" -> Resume file input -->
        <label for="cv_upload">CV Upload / Resume (PDF) *</label>
        <input type="file" id="cv_upload" name="cv_upload" accept=".pdf,.docx">
      </div>

      <div class="field">
        <label for="selenium_exp">What is your experience with Selenium / Automation Frameworks?</label>
        <textarea id="selenium_exp" name="selenium_exp" rows="3"></textarea>
      </div>

      <div class="field">
        <label for="why_interested">Why are you interested in this role?</label>
        <textarea id="why_interested" name="why_interested" rows="3"></textarea>
      </div>

      <button type="submit" id="submit-application-btn">Submit Application</button>
    </form>
  </div>
</body>
</html>`);
});

// -------------------------------------------------------------
// Serve Static Frontend (Vite build) when running in production/Termux
// -------------------------------------------------------------
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[QA Hunter Engine] Express backend & Web UI running on http://localhost:${PORT}`);
  console.log(`[QA Hunter Engine] Network accessible on http://0.0.0.0:${PORT}`);
});
