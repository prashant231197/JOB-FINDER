const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const APPLICATIONS_FILE = path.join(__dirname, '..', 'data', 'applications.json');

const STATUSES = [
  'Discovered',
  'Matched',
  'Ready to Apply',
  'Applied',
  'Interview',
  'Offer',
  'Rejected'
];

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  try {
    let clean = url.trim().toLowerCase();
    clean = clean.replace(/^https?:\/\//i, '');
    clean = clean.replace(/^www\./i, '');
    clean = clean.split('?')[0].split('#')[0];
    clean = clean.replace(/\/+$/, '');
    return clean;
  } catch (e) {
    return (url || '').trim().toLowerCase();
  }
}

function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class ApplicationTrackerService {
  getAllApplications() {
    try {
      if (!fs.existsSync(APPLICATIONS_FILE)) return [];
      const raw = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading applications:', err);
      return [];
    }
  }

  saveApplications(apps) {
    try {
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf8');
      return apps;
    } catch (err) {
      console.error('Error saving applications:', err);
      throw err;
    }
  }

  /**
   * Requirement 9: Duplicate Prevention
   * Checks whether the user has already applied to the same:
   * 1. Company + Job Title
   * 2. Job URL
   */
  hasAlreadyApplied(company, jobTitle, applicationUrl) {
    if (typeof company === 'object' && company !== null) {
      const jobObj = company;
      company = jobObj.company;
      jobTitle = jobObj.title || jobObj.jobTitle;
      applicationUrl = jobObj.applicationUrl || jobObj.applyUrl || jobObj.url;
    }
    const apps = this.getAllApplications();
    const urlNorm = normalizeUrl(applicationUrl);
    const compNorm = normalizeText(company);
    const titleNorm = normalizeText(jobTitle);

    return apps.some(app => {
      const isAppliedStatus = ['Applied', 'Interview', 'Offer', 'Rejected'].includes(app.status || 'Applied');
      if (!isAppliedStatus) return false;

      // 1. Check identical / normalized URL
      const appUrlNorm = normalizeUrl(app.applicationUrl || app.url || app.applyUrl);
      if (urlNorm && appUrlNorm && urlNorm === appUrlNorm) {
        return true;
      }

      // 2. Check same company + matching job title
      const appCompNorm = normalizeText(app.company);
      const appTitleNorm = normalizeText(app.jobTitle || app.title);

      if (compNorm && appCompNorm && compNorm === appCompNorm && titleNorm && appTitleNorm) {
        if (titleNorm === appTitleNorm || titleNorm.includes(appTitleNorm) || appTitleNorm.includes(titleNorm)) {
          return true;
        }
      }

      return false;
    });
  }

  /**
   * Track or record an application entry
   */
  recordApplication({
    jobTitle,
    company,
    applicationUrl,
    resumeUsed,
    status = 'Applied',
    matchScore = 0,
    matchBreakdown = null,
    logs = [],
    screenshotUrl = ''
  }) {
    const apps = this.getAllApplications();
    const targetUrlNorm = normalizeUrl(applicationUrl);
    const targetCompNorm = normalizeText(company);
    const targetTitleNorm = normalizeText(jobTitle);

    // Check if entry for this URL or company+title exists
    const existingIndex = apps.findIndex(a => {
      const aUrlNorm = normalizeUrl(a.applicationUrl || a.url);
      if (targetUrlNorm && aUrlNorm && targetUrlNorm === aUrlNorm) return true;

      const aCompNorm = normalizeText(a.company);
      const aTitleNorm = normalizeText(a.jobTitle || a.title);
      if (targetCompNorm && aCompNorm && targetCompNorm === aCompNorm &&
          targetTitleNorm && aTitleNorm &&
          (targetTitleNorm === aTitleNorm || targetTitleNorm.includes(aTitleNorm) || aTitleNorm.includes(targetTitleNorm))) {
        return true;
      }
      return false;
    });

    const appEntry = {
      id: existingIndex >= 0 ? apps[existingIndex].id : `app-${uuidv4().slice(0, 8)}`,
      jobTitle,
      company,
      applicationUrl: applicationUrl || '',
      dateApplied: new Date().toISOString(),
      resumeUsed: resumeUsed || 'Sushant_Kumar_Senior_QA_SDET_Resume.pdf',
      status: STATUSES.includes(status) ? status : 'Applied',
      matchScore: matchScore || 0,
      matchBreakdown,
      logs: (logs || []).slice(-30),
      screenshotUrl: screenshotUrl || '',
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      apps[existingIndex] = { ...apps[existingIndex], ...appEntry };
    } else {
      apps.unshift(appEntry);
    }

    this.saveApplications(apps);

    // Also automatically delete matching job from jobSearchService / jobs.json
    try {
      const jobSearchService = require('./jobSearchService');
      jobSearchService.deleteJobMatch({
        url: applicationUrl,
        company,
        title: jobTitle
      });
    } catch (e) {
      console.warn('[ApplicationTracker] Note: jobSearchService sync skipped:', e.message);
    }

    return appEntry;
  }

  logApplication(data) {
    return this.recordApplication(data);
  }

  updateStatus(id, newStatus) {
    if (!STATUSES.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}. Must be one of: ${STATUSES.join(', ')}`);
    }
    const apps = this.getAllApplications();
    const target = apps.find(a => a.id === id);
    if (!target) throw new Error('Application not found');
    target.status = newStatus;
    target.updatedAt = new Date().toISOString();
    this.saveApplications(apps);
    return target;
  }

  deleteApplication(id) {
    const apps = this.getAllApplications();
    const filtered = apps.filter(a => a.id !== id);
    this.saveApplications(filtered);
    return true;
  }

  getPipelineMetrics() {
    const apps = this.getAllApplications();
    const counts = {};
    for (const st of STATUSES) counts[st] = 0;
    
    let totalScore = 0;
    let scoredCount = 0;

    for (const app of apps) {
      if (counts[app.status] !== undefined) counts[app.status]++;
      if (app.matchScore > 0) {
        totalScore += app.matchScore;
        scoredCount++;
      }
    }

    return {
      total: apps.length,
      counts,
      averageScore: scoredCount > 0 ? Math.round(totalScore / scoredCount) : 0
    };
  }
}

module.exports = new ApplicationTrackerService();
