const fs = require('fs');
const path = require('path');
const { chromium } = require('./playwrightHelper');
const groqService = require('./groqService');

const OUTPUT_DIR = path.join(__dirname, '..', 'uploads', 'tailored_resumes');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

class ResumePdfGeneratorService {
  /**
   * Builds an ATS-optimized single-page HTML resume string
   */
  generateHtmlTemplate(profile, job, tailoredData, fileName = '') {
    const fullName = profile.fullName || 'Prashant Kumar Ary';
    const email = profile.email || 'prashantkumar231197@gmail.com';
    const phone = profile.phone || '+91 6204507166';
    const location = profile.currentLocation || 'Bengaluru, Karnataka, India';
    const linkedIn = profile.linkedIn || 'http://www.linkedin.com/in/prashant-kumar-ary-336463205';
    const title = tailoredData.tailoredJobTitle || 'SDET-II / Senior QA Automation Engineer';
    const summary = tailoredData.tailoredSummary || '';
    const skills = tailoredData.topSkills || [];
    const bullets = tailoredData.tailoredBullets || [];

    // Group skills
    const skillsListStr = skills.join(' • ');
    const pageTitle = fileName ? fileName.replace(/\.pdf$/i, '') : `${fullName} - ${title}`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background-color: #ffffff;
      font-size: 9.5pt;
      line-height: 1.4;
      padding: 0;
      margin: 0;
    }
    .resume-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 10px 15px;
    }
    /* Header */
    .header {
      text-align: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 8px;
      margin-bottom: 10px;
    }
    .name {
      font-size: 20pt;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .target-title {
      font-size: 11pt;
      font-weight: 600;
      color: #2563eb;
      margin-top: 2px;
      margin-bottom: 4px;
    }
    .contact-info {
      font-size: 8.5pt;
      color: #475569;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .contact-info a {
      color: #2563eb;
      text-decoration: none;
    }
    /* Section */
    .section {
      margin-bottom: 10px;
    }
    .section-title {
      font-size: 10pt;
      font-weight: 700;
      color: #1e3a8a;
      text-transform: uppercase;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 2px;
      margin-bottom: 5px;
      letter-spacing: 0.5px;
    }
    .summary-text {
      font-size: 9pt;
      color: #334155;
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
    }
    /* Skills */
    .skills-block {
      font-size: 9pt;
      color: #1e293b;
      line-height: 1.45;
    }
    .skills-label {
      font-weight: 600;
      color: #0f172a;
    }
    /* Experience */
    .exp-item {
      margin-bottom: 8px;
    }
    .exp-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }
    .exp-role {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
    }
    .exp-company {
      font-weight: 600;
      color: #2563eb;
    }
    .exp-meta {
      font-size: 8.5pt;
      color: #64748b;
      font-weight: 500;
    }
    .bullet-list {
      list-style-type: disc;
      padding-left: 18px;
      margin-top: 3px;
    }
    .bullet-list li {
      font-size: 8.8pt;
      color: #334155;
      margin-bottom: 3px;
      line-height: 1.35;
      text-align: justify;
      text-justify: inter-word;
    }
    .bullet-list li strong {
      color: #0f172a;
    }
    /* Projects */
    .project-title {
      font-size: 9pt;
      font-weight: 700;
      color: #0f172a;
    }
    .project-desc {
      font-size: 8.5pt;
      color: #475569;
      margin-top: 1px;
      text-align: justify;
      text-justify: inter-word;
    }
    /* Education */
    .edu-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 9pt;
    }
    .edu-degree {
      font-weight: 700;
      color: #0f172a;
    }
    .edu-school {
      color: #475569;
    }
    .edu-year {
      font-size: 8.5pt;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header -->
    <div class="header">
      <div class="name">${fullName}</div>
      <div class="target-title">${title}</div>
      <div class="contact-info">
        <span>📍 ${location}</span>
        <span>✉️ <a href="mailto:${email}">${email}</a></span>
        <span>📞 ${phone}</span>
        <span>🔗 <a href="${linkedIn}">LinkedIn Profile</a></span>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-title">Professional Summary</div>
      <div class="summary-text">${summary}</div>
    </div>

    <!-- Core Skills -->
    <div class="section">
      <div class="section-title">Key Technical Competencies & Keywords</div>
      <div class="skills-block">
        <div><span class="skills-label">Core Automation & Frameworks:</span> ${skillsListStr}</div>
        <div style="margin-top: 3px;"><span class="skills-label">Testing Types & Standards:</span> Functional & Regression Testing, REST API Contract Automation, Performance Testing, CI/CD Pipeline Gates, Root Cause Defect Analysis</div>
      </div>
    </div>

    <!-- Experience -->
    <div class="section">
      <div class="section-title">Professional Experience</div>
      <div class="exp-item">
        <div class="exp-header">
          <div>
            <span class="exp-role">Software Development Engineer in Test (SDET)</span> — 
            <span class="exp-company">Corecard India Pvt. Ltd</span>
          </div>
          <div class="exp-meta">Aug 2022 – Present | India</div>
        </div>
        <ul class="bullet-list">
          ${bullets.map(b => `<li>${b}</li>`).join('\n          ')}
          <li>Automated mission-critical transaction workflows, executing daily automated CI/CD regression suites across GitHub Actions and Jenkins pipelines.</li>
          <li>Partnered cross-functionally with development, product, and devops teams in an agile release cadence to ensure 100% test traceability and zero defect escapes.</li>
        </ul>
      </div>
    </div>

    <!-- Key Engineering Projects -->
    <div class="section">
      <div class="section-title">Key Quality Engineering Projects</div>
      <div class="exp-item" style="margin-bottom: 5px;">
        <div class="project-title">AI-Powered Test Script Generation & Log Analysis Engine</div>
        <div class="project-desc">Designed an AI-driven test tool using LLMs to automatically generate PyTest and Playwright scripts from natural language test specifications and analyze execution failure logs, reducing test scripting time by 60%.</div>
      </div>
      <div class="exp-item">
        <div class="project-title">Enterprise Cloud Platform Regression & REST API Automation Suite</div>
        <div class="project-desc">Architected end-to-end API test suites using Postman and Rest Assured validating microservice contracts, JSON schema variations, and database assertions with SQL, cutting manual regression overhead by 65%.</div>
      </div>
    </div>

    <!-- Education -->
    <div class="section">
      <div class="section-title">Education & Credentials</div>
      <div class="edu-item">
        <div>
          <span class="edu-degree">Bachelor of Technology in Computer Science & Engineering</span> — 
          <span class="edu-school">Sagar Institute of Science and Technology Bhopal</span>
        </div>
        <div class="edu-year">2020 | CGPA: 8.8 / 10.0</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Main function: Tailor resume to JD and compile to PDF
   * @param {Object} profile - Candidate profile
   * @param {Object} job - Target job (title, company, description, requiredSkills)
   * @returns {Promise<{ filePath: string, fileName: string, relativeUrl: string, tailoredData: Object }>}
   */
  async generateTailoredResumePdf(profile, job) {
    console.log(`[Resume Tailoring] Tailoring resume for: ${job.company || 'Company'} - "${job.title || 'SDET'}"...`);

    // 1. Get tailored content from Groq AI (with heuristic fallback)
    const tailoredData = await groqService.generateTailoredResumeData(profile, job);

    const candidateName = (profile.fullName || 'Prashant Kumar Ary')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const rawRole = tailoredData?.tailoredJobTitle || job.title || 'SDET';
    const roleClean = rawRole
      .replace(/\(.*?\)/g, '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 25) || 'SDET';

    const companyClean = (job.company || '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 25);

    const companySnippet = companyClean ? `_${companyClean}` : '';
    const fileName = `${candidateName}_${roleClean}${companySnippet}_Resume.pdf`;
    const outputPath = path.join(OUTPUT_DIR, fileName);

    // 2. Generate clean HTML string
    const htmlContent = this.generateHtmlTemplate(profile, job, tailoredData, fileName);

    // 3. Render HTML to Vector PDF via Playwright
    let browser = null;
    try {
      browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }).catch(async () => {
        return await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
      });

      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

      // Generate crisp A4 PDF
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '6mm',
          bottom: '6mm',
          left: '8mm',
          right: '8mm'
        }
      });

      console.log(`[Resume Tailoring] Successfully generated tailored PDF: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);

      return {
        success: true,
        filePath: outputPath,
        fileName: fileName,
        relativeUrl: `/uploads/tailored_resumes/${fileName}`,
        tailoredData: tailoredData
      };
    } catch (err) {
      console.error('[Resume Tailoring Error]', err.message);
      // Fallback: Return original default resume if PDF rendering fails
      const defaultPath = path.join(__dirname, '..', '..', 'SDET-PRASHANT.pdf');
      return {
        success: false,
        error: err.message,
        filePath: fs.existsSync(defaultPath) ? defaultPath : outputPath,
        fileName: path.basename(defaultPath),
        tailoredData: tailoredData
      };
    } finally {
      if (browser) {
        await browser.close().catch(() => {});
      }
    }
  }
}

module.exports = new ResumePdfGeneratorService();
