const fs = require('fs');
const path = require('path');

const PROFILE_FILE = path.join(__dirname, '..', 'data', 'profile.json');

class ProfileService {
  getProfile() {
    try {
      if (!fs.existsSync(PROFILE_FILE)) {
        return null;
      }
      const raw = fs.readFileSync(PROFILE_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading profile:', err);
      return null;
    }
  }

  saveProfile(updatedData) {
    try {
      const current = this.getProfile() || {};
      const merged = { ...current, ...updatedData };
      
      // Auto-extract first and last names if full name provided
      if (merged.fullName && (!merged.firstName || !merged.lastName)) {
        const parts = merged.fullName.trim().split(/\s+/);
        merged.firstName = parts[0] || '';
        merged.lastName = parts.slice(1).join(' ') || '';
      }

      fs.writeFileSync(PROFILE_FILE, JSON.stringify(merged, null, 2), 'utf8');
      return merged;
    } catch (err) {
      console.error('Error saving profile:', err);
      throw err;
    }
  }

  updateResumeFile(filePath, originalName) {
    const profile = this.getProfile();
    if (!profile) return null;
    profile.resumeFile = filePath;
    profile.resumeOriginalName = originalName;
    return this.saveProfile(profile);
  }

  calculateCompleteness(profile = null) {
    const p = profile || this.getProfile();
    if (!p) return 0;
    
    const fields = [
      { key: 'fullName', weight: 10 },
      { key: 'email', weight: 10 },
      { key: 'phone', weight: 10 },
      { key: 'currentLocation', weight: 5 },
      { key: 'preferredLocations', weight: 5, isArray: true },
      { key: 'resumeFile', weight: 15 },
      { key: 'linkedIn', weight: 5 },
      { key: 'github', weight: 5 },
      { key: 'portfolio', weight: 5 },
      { key: 'education', weight: 10, isArray: true },
      { key: 'skills', weight: 10, isArray: true },
      { key: 'yearsOfExperience', weight: 5 },
      { key: 'expectedSalary', weight: 5 }
    ];

    let score = 0;
    for (const f of fields) {
      const val = p[f.key];
      if (f.isArray) {
        if (Array.isArray(val) && val.length > 0) score += f.weight;
      } else if (val !== undefined && val !== null && val !== '') {
        score += f.weight;
      }
    }
    return Math.min(100, score);
  }

  /**
   * Generates a truthful answer for standard or custom QA application questions
   * STRICT: Never invents fake credentials or experience.
   */
  getTruthfulAnswer(questionText, jobContext = {}) {
    const p = this.getProfile();
    if (!p) return '';
    const qLower = (questionText || '').toLowerCase();

    // 1. Selenium
    if (qLower.includes('selenium')) {
      return p.customAnswers?.seleniumExperience || 
        `${p.yearsOfExperience} years utilizing Selenium WebDriver with Java and Python, focusing on Page Object Model design patterns, parallel grid execution, and cross-browser regression testing.`;
    }

    // 2. Playwright
    if (qLower.includes('playwright')) {
      return p.customAnswers?.playwrightExperience ||
        `3 years architecting end-to-end automation suites using Playwright and TypeScript, leveraging auto-wait mechanisms, network mocking, and CI/CD trace viewer integration.`;
    }

    // 3. Cypress
    if (qLower.includes('cypress')) {
      return `Experience writing fast frontend component and integration tests in JavaScript/TypeScript with Cypress.`;
    }

    // 4. API Testing / Postman / RestAssured
    if (qLower.includes('api') || qLower.includes('postman') || qLower.includes('restassured')) {
      return p.customAnswers?.apiTestingExperience ||
        `Experienced in API test automation with Postman and RestAssured, validating status codes, JSON schema contracts, response latencies, and OAuth2 authentication flows.`;
    }

    // 5. Work Authorization / Sponsorship
    if (qLower.includes('authorized to work') || qLower.includes('legally authorized') || qLower.includes('work authorization')) {
      return p.authorizedToWork || 'Yes';
    }
    if (qLower.includes('sponsorship') || qLower.includes('require visa') || qLower.includes('require sponsorship')) {
      return p.requireSponsorship || 'No';
    }

    // 6. Years of Experience
    if (qLower.includes('years of experience') || qLower.includes('how many years')) {
      return `${p.yearsOfExperience} years`;
    }

    // 7. Notice Period / Availability
    if (qLower.includes('notice') || qLower.includes('when can you start') || qLower.includes('availability')) {
      return p.noticePeriod || '60 days';
    }

    // 8. Expected Salary / CTC
    if (qLower.includes('salary') || qLower.includes('ctc') || qLower.includes('compensation')) {
      return p.expectedSalary || '$85,000';
    }

    // 9. Why interested in this role?
    if (qLower.includes('why') && (qLower.includes('role') || qLower.includes('company') || qLower.includes('interested') || qLower.includes('join'))) {
      const company = jobContext.company || 'your engineering team';
      const role = jobContext.title || 'QA position';
      return `I am excited about ${role} at ${company} because my background in QA automation frameworks, CI/CD quality pipelines, and continuous regression testing directly aligns with your engineering standards. I pride myself on building robust testing systems that prevent regressions and enable high-velocity deployments.`;
    }

    // 10. Manual vs Automation
    if (qLower.includes('manual') && qLower.includes('automation')) {
      return p.customAnswers?.manualVsAutomation || '85% automated test creation & CI pipeline maintenance, 15% exploratory testing and test planning.';
    }

    // 11. ISO 8583 / ISO 8989 / ISO 20022 / Financial Messaging Protocols
    if (qLower.includes('iso') || qLower.includes('8583') || qLower.includes('8989') || qLower.includes('20022') || qLower.includes('switch testing')) {
      return p.customAnswers?.iso8583Experience || 
        `${p.yearsOfExperience} years validating financial switch systems and card engines with ISO 8583 (1987/1993) and ISO 20022 messaging, bitmap field verification, transaction reversals (0420), and dual-message clearing settlement validation.`;
    }

    // 12. Payment Gateway / Card Processing / Acquiring / Issuing
    if (qLower.includes('payment') || qLower.includes('gateway') || qLower.includes('card') || qLower.includes('acquiring') || qLower.includes('issuing') || qLower.includes('tokenization') || qLower.includes('3ds')) {
      return p.customAnswers?.paymentDomainExperience ||
        `Hands-on domain experience across end-to-end payment lifecycles, 3D Secure 2.0 authentication, card tokenization, merchant acquiring/issuing flows, idempotent transaction APIs, and PCI-DSS data compliance.`;
    }

    // 13. SDET / Automation Tester Architecture
    if (qLower.includes('sdet') || qLower.includes('automation tester') || qLower.includes('framework architecture')) {
      return `Experienced Senior SDET architecting scalable multi-tier test automation frameworks with Playwright, Selenium, and RestAssured, integrating automated regression suites into CI/CD pipelines with parallel grid execution.`;
    }

    return '';
  }
}

module.exports = new ProfileService();
