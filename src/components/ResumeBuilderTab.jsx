import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Download,
  AlertCircle,
  ExternalLink,
  Edit3,
  Eye,
  Key,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Smartphone,
  Check,
  Wand2,
  Briefcase
} from 'lucide-react';
import {
  PRASHANT_BASELINE_RESUME,
  enhanceResumeWithJD,
  enhanceOfflineHeuristic,
  detectJobTitleFromJD,
  detectCompanyFromJD
} from '../services/resumeEnhancerService';
import ModernExecutiveResume, {
  formatPhoneNumber,
  formatVisibleUrl,
  cleanJobTitle,
  cleanSummaryAcronyms,
  cleanBulletRoboticText
} from './ModernExecutiveResume';

const SAMPLE_JDS = [
  {
    title: 'Fintech SDET II (Payments & ISO 8583)',
    company: 'Stripe / Worldline Partner',
    content: `Role: SDET II - Payment Processing & Switch Automation
Location: Remote / Bengaluru
Requirements:
- 4+ years of automated testing in Fintech, Payment Gateway, or Card Switch domains.
- Hands-on expertise with Playwright, Selenium, and Python or Java test automation frameworks.
- Deep familiarity with ISO 8583, ISO 20022 message formats, 3DS authentication, and transaction settlement workflows.
- Strong REST API testing experience with Postman, Rest Assured, and SQL database validations.
- Proven experience with Page Object Model (POM), CI/CD pipelines (GitHub Actions/Jenkins), and Agile/Scrum delivery.
- Experience with GenAI test generation or AI-assisted test reconciliation is a plus.`
  },
  {
    title: 'Senior SDET (API & Microservices)',
    company: 'Revolut / Neobank',
    content: `Role: Senior SDET - Core Banking & High-Scale Microservices
Requirements:
- 4+ years in software quality engineering and test framework architecture.
- Core skills in Playwright (TypeScript/Python), Rest Assured, and Kafka event testing.
- Strong database skills with PostgreSQL/MySQL, data assertions, and schema migrations.
- Experience testing card issuing, acquiring, UPI switches, or real-time transaction processing.
- Excellent defect tracking in JIRA, performance load testing using JMeter or k6, and Dockerized test runners.`
  }
];

export default function ResumeBuilderTab({ profile, onSaveProfile }) {
  // Mobile / View state
  const [mobileActiveView, setMobileActiveView] = useState('editor'); // 'editor' | 'preview'
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // 'modern' | 'classic'

  // Form inputs
  const [jobDescription, setJobDescription] = useState('');
  const [targetTitle, setTargetTitle] = useState('SDET-I (Software Development Engineer in Test)');
  const [targetCompany, setTargetCompany] = useState('');
  const [engine, setEngine] = useState('groq'); // 'groq' | 'grok' | 'offline'

  // Keys
  const [customGrokKey, setCustomGrokKey] = useState('');
  const [customGroqKey, setCustomGroqKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);

  // Resume state
  const [resumeData, setResumeData] = useState(() => {
    try {
      const saved = localStorage.getItem('prashant_tailored_resume');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If saved resume has robotic bullets starting with "Accomplished", purge it and restore clean baseline!
        const hasRoboticFormula = parsed?.experience?.[0]?.bullets?.some(b => /^Accomplished\s+/i.test(b))
          || parsed?.projects?.some(p => p.rolesAndResponsibilities?.some(r => /^Accomplished\s+/i.test(r)));
        if (hasRoboticFormula) {
          localStorage.removeItem('prashant_tailored_resume');
          return PRASHANT_BASELINE_RESUME;
        }
        if (parsed?.header) {
          parsed.header.phone = '+91 6204507166';
          if (!parsed.header.githubUrl || parsed.header.githubUrl.includes('prashant-kumar-sdet')) {
            parsed.header.githubUrl = 'https://github.com/prashant231197';
          }
        }
        if (parsed?.summary) {
          parsed.summary = parsed.summary.replace(/\*\*/g, '').replace(/3\+\s*years/gi, '4+ years');
        }
        return parsed;
      }
    } catch (e) { }
    return PRASHANT_BASELINE_RESUME;
  });

  // Processing & feedback state
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancingStep, setEnhancingStep] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [atsAnalysis, setAtsAnalysis] = useState(null);
  const [copied, setCopied] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({
    header: false,
    summary: true,
    skills: false,
    experience: false,
    projects: false
  });

  // Load saved keys
  useEffect(() => {
    try {
      const grokKey = localStorage.getItem('custom_grok_api_key') || '';
      const groqKey = localStorage.getItem('custom_groq_api_key') || '';
      if (grokKey) setCustomGrokKey(grokKey);
      if (groqKey) setCustomGroqKey(groqKey);
    } catch (e) { }
  }, []);

  // Save tailored resume to localStorage for persistence across sessions & Cloudflare Pages
  const saveResumeState = (data) => {
    setResumeData(data);
    try {
      localStorage.setItem('prashant_tailored_resume', JSON.stringify(data));
    } catch (e) { }
  };

  const handleSaveKeys = () => {
    try {
      if (customGrokKey) localStorage.setItem('custom_grok_api_key', customGrokKey.trim());
      if (customGroqKey) localStorage.setItem('custom_groq_api_key', customGroqKey.trim());
      setShowKeyConfig(false);
      alert('API Key settings saved locally in your browser!');
    } catch (e) {
      alert('Failed to save settings to localStorage');
    }
  };

  const toggleAccordion = (section) => {
    setOpenAccordions(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // AI Enhancer execution
  const handleEnhanceResume = async () => {
    if (!jobDescription || jobDescription.trim().length < 20) {
      alert('Please paste a Job Description (at least 20 characters) to enhance the resume.');
      return;
    }

    setIsEnhancing(true);
    setEnhancingStep('Parsing JD requirements & domain keywords...');

    try {
      // Small simulated step progression for UI responsiveness
      setTimeout(() => setEnhancingStep('Rewriting Summary to target domain...'), 600);
      setTimeout(() => setEnhancingStep('Aligning Experience bullets & frameworks...'), 1200);
      setTimeout(() => setEnhancingStep('Re-scoring categorized skills & ATS index...'), 1800);

      const enhanced = await enhanceResumeWithJD({
        currentResume: PRASHANT_BASELINE_RESUME,
        jobDescription,
        targetTitle,
        engine,
        customGrokKey,
        customGroqKey
      });

      // Strip any markdown asterisks and sanitize bullets
      if (enhanced.summary) {
        enhanced.summary = cleanSummaryAcronyms(enhanced.summary);
      }
      if (enhanced.experience?.[0]?.bullets) {
        enhanced.experience[0].bullets = enhanced.experience[0].bullets.map(b => cleanBulletRoboticText(b));
      }
      if (enhanced.projects) {
        enhanced.projects = enhanced.projects.map(p => ({
          ...p,
          rolesAndResponsibilities: (p.rolesAndResponsibilities || []).map(r => cleanBulletRoboticText(r))
        }));
      }

      saveResumeState(enhanced);
      if (enhanced.targetCompany && (!targetCompany || targetCompany === 'Company')) {
        setTargetCompany(enhanced.targetCompany);
      }
      setAtsAnalysis({
        atsScore: enhanced.atsScore || 94,
        matchingKeywords: enhanced.matchingKeywords || [],
        domain: enhanced.domain || 'Fintech Quality Engineering',
        engineUsed: enhanced.engineUsed || 'AI Engine'
      });

      // On mobile, auto-switch to preview so user sees the enhanced result immediately
      if (window.innerWidth < 768) {
        setMobileActiveView('preview');
      }
    } catch (err) {
      console.error('Enhancement error:', err);
      alert(`Error enhancing resume: ${err.message}. Using built-in offline ATS engine instead.`);
      const offlineEnhanced = enhanceOfflineHeuristic(PRASHANT_BASELINE_RESUME, jobDescription, targetTitle);
      saveResumeState(offlineEnhanced);
      setAtsAnalysis({
        atsScore: offlineEnhanced.atsScore,
        matchingKeywords: offlineEnhanced.matchingKeywords,
        domain: offlineEnhanced.domain,
        engineUsed: 'Built-in ATS Heuristic Engine'
      });
      if (window.innerWidth < 768) {
        setMobileActiveView('preview');
      }
    } finally {
      setIsEnhancing(false);
      setEnhancingStep('');
    }
  };

  // Reset to original Prashant resume
  const handleResetToBaseline = () => {
    if (window.confirm('Reset resume back to original Prashant Kumar Ary (SDET-I) baseline format?')) {
      localStorage.removeItem('prashant_tailored_resume');
      saveResumeState(PRASHANT_BASELINE_RESUME);
      setAtsAnalysis(null);
      setJobDescription('');
    }
  };

  // Sync with main application profile
  const handleSyncToProfile = () => {
    if (onSaveProfile) {
      onSaveProfile({
        ...profile,
        fullName: resumeData.header.fullName,
        resumeText: `${resumeData.header.fullName} - ${resumeData.header.title}
${resumeData.header.location} | ${resumeData.header.email} | ${resumeData.header.phone}
${resumeData.header.linkedinUrl}

Summary:
${resumeData.summary}

Experience:
${resumeData.experience[0]?.role} - ${resumeData.experience[0]?.companyAndDuration}
${resumeData.experience[0]?.bullets?.map(b => `• ${b}`).join('\n')}

Skills:
${resumeData.skills?.map(s => `• ${s.category}: ${s.items}`).join('\n')}

Projects:
${resumeData.projects?.map(p => `${p.title}\n${p.rolesAndResponsibilities?.map(r => `• ${r}`).join('\n')}`).join('\n\n')}`
      });
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
  };

  // Dynamic Filename Generator matching updated resume, target role, and company
  const getDynamicFilename = () => {
    const candidateName = (resumeData.header?.fullName || 'Prashant_Kumar_Ary')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const rawRole = resumeData.header?.title || targetTitle || 'SDET';
    const cleanRole = rawRole
      .replace(/\(.*?\)/g, '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 25) || 'SDET';

    const cleanCompany = (targetCompany || resumeData.targetCompany || '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 25);

    const companySnippet = cleanCompany ? `_${cleanCompany}` : '';
    return `${candidateName}_${cleanRole}${companySnippet}_Resume.pdf`;
  };

  // Direct 1-Click PDF Download (No browser print dialog, No dates/headers)
  const handleDownloadDirectPDF = async () => {
    setIsDownloadingPdf(true);

    try {
      // 1. If currently in mobile editor mode, switch to preview so the paper element is in the active DOM
      if (mobileActiveView !== 'preview' && window.innerWidth < 768) {
        setMobileActiveView('preview');
        await new Promise(r => setTimeout(r, 300));
      }

      // 2. Target the exact rendered paper element based on selected template
      const targetId = selectedTemplate === 'modern' ? 'modern-resume-paper' : 'prashant-resume-paper';
      const element = document.getElementById(targetId);
      if (!element) {
        throw new Error('Resume paper element not found in DOM');
      }

      // 3. Scroll to top to guarantee 0 scroll offset in html2canvas
      const prevScrollY = window.scrollY;
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 100));

      // 4. Get html2pdf engine
      let h2pdf = typeof window !== 'undefined' ? window.html2pdf : null;
      if (!h2pdf) {
        try {
          const mod = await import('html2pdf.js');
          h2pdf = mod.default || mod;
        } catch (e) {
          console.warn('Could not dynamically import html2pdf.js', e);
        }
      }

      if (!h2pdf) {
        await new Promise(r => setTimeout(r, 400));
        h2pdf = window.html2pdf;
      }

      if (!h2pdf) {
        // Fallback to isolated clean print
        window.scrollTo(0, prevScrollY);
        handlePrint();
        setIsDownloadingPdf(false);
        return;
      }

      const filename = getDynamicFilename();

      // Lock element to fixed desktop A4 width of 780px, remove outer UI border/shadow, and reset margins
      const prevWidth = element.style.width;
      const prevMinWidth = element.style.minWidth;
      const prevMaxWidth = element.style.maxWidth;
      const prevMargin = element.style.margin;
      const prevMarginLeft = element.style.marginLeft;
      const prevMarginRight = element.style.marginRight;
      const prevBorder = element.style.border;
      const prevBoxShadow = element.style.boxShadow;

      element.style.width = '780px';
      element.style.minWidth = '780px';
      element.style.maxWidth = '780px';
      element.style.margin = '0';
      element.style.marginLeft = '0';
      element.style.marginRight = '0';
      element.style.border = 'none';
      element.style.boxShadow = 'none';

      const opt = {
        margin: [4, 4, 4, 4], // mm (tight margin prevents double-padding overflow)
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollY: 0,
          scrollX: 0,
          x: 0,
          y: 0,
          windowWidth: 800
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            'li',
            'p',
            'header',
            'h2',
            'h3',
            'h4',
            '.avoid-break',
            '.skill-row'
          ]
        }
      };

      try {
        await h2pdf().set(opt).from(element).save(filename);
      } finally {
        element.style.width = prevWidth;
        element.style.minWidth = prevMinWidth;
        element.style.maxWidth = prevMaxWidth;
        element.style.margin = prevMargin;
        element.style.marginLeft = prevMarginLeft;
        element.style.marginRight = prevMarginRight;
        element.style.border = prevBorder;
        element.style.boxShadow = prevBoxShadow;
      }

      // Restore scroll position
      window.scrollTo(0, prevScrollY);
    } catch (err) {
      console.error('Direct PDF error, falling back to clean print:', err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Rock-solid PDF Print Helper using isolated iframe
  // Eliminates blank pages caused by parent flexbox / overflow-x / dark themes
  const handlePrint = () => {
    // Clean up any stale iframe
    const old = document.getElementById('resume-print-iframe');
    if (old) {
      try { old.remove(); } catch (e) { }
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'resume-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    if (selectedTemplate === 'modern') {
      const modernElement = document.getElementById('modern-resume-paper');
      const modernContent = modernElement ? modernElement.innerHTML : '';
      doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${getDynamicFilename().replace(/\.pdf$/i, '')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff !important;
      color: #0f172a !important;
      font-size: 13px;
      line-height: 1.42;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    a { color: #0284c7; text-decoration: none; }
    li, p, .avoid-break, .skill-row, .exp-block, .proj-block, h1, h2, h3, h4 {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    h1, h2, h3, h4 {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 800px; margin: 0 auto;">
    ${modernContent}
  </div>
</body>
</html>`);
    } else {
      doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${getDynamicFilename().replace(/\.pdf$/i, '')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Georgia', 'Cambria', 'Times New Roman', Times, serif;
      background: #ffffff !important;
      color: #000000 !important;
      font-size: 13.5px;
      line-height: 1.38;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .header {
      text-align: center;
      margin-bottom: 14px;
      padding-bottom: 2px;
    }
    .name {
      font-size: 26px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 2px;
      letter-spacing: -0.01em;
    }
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #000000;
      margin-bottom: 4px;
    }
    .contact {
      font-size: 13px;
      color: #222222;
      line-height: 1.35;
    }
    .contact a {
      color: #0056b3;
      text-decoration: underline;
    }
    .section-title {
      font-size: 15px;
      font-weight: bold;
      color: #000000;
      margin-top: 12px;
      margin-bottom: 4px;
    }
    p.summary {
      text-align: justify;
      color: #222222;
      line-height: 1.4;
      font-size: 13px;
    }
    .edu-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 13px;
      color: #000000;
    }
    .edu-sub {
      font-size: 13px;
      color: #333333;
    }
    .exp-role {
      font-weight: bold;
      font-size: 13.5px;
      color: #000000;
    }
    .exp-meta {
      font-weight: bold;
      font-size: 13px;
      color: #000000;
      margin-bottom: 4px;
    }
    ul.bullet-list {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }
    ul.bullet-list li {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 13px;
      color: #222222;
      margin-bottom: 3px;
      line-height: 1.36;
    }
    ul.bullet-list li .bullet {
      font-family: monospace, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      flex-shrink: 0;
      font-weight: bold;
      color: #000000;
    }
    .skill-row {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 13px;
      color: #222222;
      margin-bottom: 3px;
      line-height: 1.36;
    }
    .skill-row .bullet {
      font-weight: bold;
      flex-shrink: 0;
      color: #000000;
    }
    .project-card {
      margin-bottom: 10px;
    }
    .proj-title {
      font-weight: bold;
      font-size: 13px;
      color: #000000;
      margin-bottom: 1px;
    }
    .proj-sub {
      font-weight: 600;
      font-size: 13px;
      color: #000000;
      margin-bottom: 3px;
    }
    .project-card, .skill-row, ul.bullet-list li, .section-title {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }
    .section-title {
      break-after: avoid !important;
      page-break-after: avoid !important;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="name">${resumeData.header.fullName || 'Prashant Kumar Ary'}</div>
    <div class="title">${resumeData.header.title || 'SDET-I'}</div>
    <div class="contact">
      <span>${resumeData.header.location || 'Bhopal, Madhya Pradesh'} | </span>
      <a href="mailto:${resumeData.header.email || 'prashantkumar231197@gmail.com'}">${resumeData.header.email || 'prashantkumar231197@gmail.com'}</a>
      <span> | ${resumeData.header.phone || '6204507166'} |</span><br/>
      <a href="${resumeData.header.linkedinUrl || 'http://www.linkedin.com/in/prashant-kumar-ary-336463205'}" target="_blank">${resumeData.header.linkedinUrl || 'http://www.linkedin.com/in/prashant-kumar-ary-336463205'}</a>
    </div>
  </div>

  <div class="section-title">Summary:</div>
  <p class="summary">${resumeData.summary}</p>

  <div class="section-title">Education</div>
  ${(resumeData.education || []).map(e => `
    <div style="margin-bottom: 4px;">
      <div class="edu-header">
        <span>${e.institution}</span>
        <span>${e.duration}</span>
      </div>
      <div class="edu-sub">${e.degree}</div>
    </div>
  `).join('')}

  <div class="section-title">Experince</div>
  ${(resumeData.experience || []).map(exp => `
    <div style="margin-bottom: 6px;">
      <div class="exp-role">${exp.role}</div>
      <div class="exp-meta">${exp.companyAndDuration}</div>
      <ul class="bullet-list">
        ${(exp.bullets || []).map(b => `
          <li><span class="bullet">▪</span><span>${b}</span></li>
        `).join('')}
      </ul>
    </div>
  `).join('')}

  <div class="section-title">Skills</div>
  <div>
    ${(resumeData.skills || []).map(s => `
      <div class="skill-row">
        <span class="bullet">➢</span>
        <div><strong>${s.category}: </strong><span>${s.items}</span></div>
      </div>
    `).join('')}
  </div>

  <div class="section-title">Projects</div>
  ${(resumeData.projects || []).map(p => `
    <div class="project-card">
      <div class="proj-title">${p.title}</div>
      <div class="proj-sub">Roles and Responsibilities:</div>
      <ul class="bullet-list">
        ${(p.rolesAndResponsibilities || []).map(r => `
          <li><span class="bullet">❖</span><span>${r}</span></li>
        `).join('')}
      </ul>
    </div>
  `).join('')}
</body>
</html>`);
    }
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.warn('Iframe print fallback to window.print():', err);
        window.print();
      }
    }, 250);
  };

  // Copy plain text formatted for ATS submission
  const handleCopyText = () => {
    const header = resumeData.header || {};
    const formattedPhone = formatPhoneNumber(header.phone, header.location);
    const visibleLinkedin = formatVisibleUrl(header.linkedinUrl);
    const visibleGithub = formatVisibleUrl(header.githubUrl);
    const cleanedTitle = cleanJobTitle(header.title);
    const cleanedSummary = cleanSummaryAcronyms(resumeData.summary);

    const skillsText = (resumeData.skills || []).map(s => {
      const items = (typeof s.items === 'string' ? s.items.split(',') : (Array.isArray(s.items) ? s.items : []))
        .map(item => item.trim().replace(/\.$/, ''))
        .filter(Boolean);
      return `${s.category}\n${items.map(it => `- ${it}`).join('\n')}`;
    }).join('\n\n');

    const text = `${header.fullName.toUpperCase()}
${cleanedTitle}
${header.location} | ${header.email} | ${formattedPhone}
${visibleLinkedin}${visibleGithub ? ` | ${visibleGithub}` : ''}

SUMMARY:
${cleanedSummary}

EDUCATION:
${resumeData.education?.map(e => `${e.institution} ${e.duration}\n${e.degree}`).join('\n')}

EXPERIENCE:
${resumeData.experience?.map(exp => `${cleanJobTitle(exp.role)}\n${exp.companyAndDuration}\n${exp.bullets?.map(b => `- ${b}`).join('\n')}`).join('\n\n')}

SKILLS:
${skillsText}

PROJECTS:
${resumeData.projects?.map(p => `${p.title}\nRoles and Responsibilities:\n${p.rolesAndResponsibilities?.map(r => `- ${r}`).join('\n')}`).join('\n\n')}
`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Quick paste sample JD with automatic dynamic title detection
  const handleLoadSampleJD = (sample) => {
    setJobDescription(sample.content);
    const detected = detectJobTitleFromJD(sample.content, sample.title.split('(')[0].trim());
    setTargetTitle(detected);
    setTargetCompany(sample.company);
    setResumeData(prev => ({
      ...prev,
      header: { ...prev.header, title: detected },
      experience: prev.experience?.map((exp, i) => i === 0 ? { ...exp, role: detected } : exp)
    }));
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">

      {/* ========================================================= */}
      {/* 1. TOP HERO HEADER & MOBILE VIEW TOGGLE                   */}
      {/* ========================================================= */}
      <div className="no-print bg-[#0c1222] border border-cyan-500/20 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 animate-spin text-cyan-400" />
                SDET-PRASHANT.pdf Replica Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Cloudflare & Mobile Ready
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              AI Resume Builder <span className="text-cyan-400 font-mono font-normal text-base">(JD Matcher & PDF Replica)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Paste any Job Description. Grok / Groq AI re-architects Summary, Skills, Experience bullets, and Projects to realistically match the role in the exact format of <strong className="text-slate-200">SDET-PRASHANT.pdf</strong>.
            </p>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={handleDownloadDirectPDF}
              disabled={isDownloadingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              title={`Directly download clean PDF: ${getDynamicFilename()}`}
            >
              {isDownloadingPdf ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Direct Download PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              title={`Print / System PDF dialog: ${getDynamicFilename()}`}
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print to PDF</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied ATS Text!' : 'Copy Text'}</span>
            </button>

            <button
              onClick={handleResetToBaseline}
              className="px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs border border-slate-700/80 transition-all cursor-pointer flex items-center gap-1.5"
              title="Reset resume back to original Prashant baseline format"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Format</span>
            </button>

            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${showKeyConfig ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'}`}
              title="Configure Grok / Groq API Keys"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile View Toggle Switch (< 768px screens) */}
        <div className="flex md:hidden mt-4 pt-3 border-t border-slate-800/80 w-full">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800 w-full">
            <button
              onClick={() => setMobileActiveView('editor')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileActiveView === 'editor' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>1. JD & AI Tailor</span>
            </button>
            <button
              onClick={() => setMobileActiveView('preview')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mobileActiveView === 'preview' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Live PDF Replica</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. OPTIONAL API KEY CONFIGURATION ACCORDION               */}
      {/* ========================================================= */}
      {showKeyConfig && (
        <div className="no-print bg-[#090e1c] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">AI Engine Configuration (Saved locally on device)</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Works on Cloudflare Pages static hosting</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Grok (xAI) API Key:</label>
              <input
                type="password"
                placeholder="xai-..."
                value={customGrokKey}
                onChange={(e) => setCustomGrokKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Direct client-side calls to xAI Grok API (grok-2 / grok-beta).</p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Groq Cloud API Key (Optional override):</label>
              <input
                type="password"
                placeholder="gsk_..."
                value={customGroqKey}
                onChange={(e) => setCustomGroqKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Defaults to ultra-fast built-in Groq key (Llama-3.3-70b).</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowKeyConfig(false)}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveKeys}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all cursor-pointer shadow-md"
            >
              Save Keys to LocalStorage
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MAIN WORKSPACE (SIDE-BY-SIDE OR MOBILE TABS)           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* --------------------------------------------------------- */}
        {/* LEFT PANE: JD INPUT, ENGINE SELECTOR & EDITORS            */}
        {/* --------------------------------------------------------- */}
        <div className={`no-print lg:col-span-5 space-y-4 ${mobileActiveView === 'editor' ? 'block' : 'hidden md:block'}`}>

          {/* Card: Job Description Input & Controls */}
          <div className="bg-[#0b101e] border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white">Target Job Description (JD)</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {jobDescription.length} chars
              </span>
            </div>

            {/* Quick Sample JD Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-slate-400 font-mono">Load Sample JD:</span>
              {SAMPLE_JDS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLoadSampleJD(sample)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-300 border border-slate-700 transition-all cursor-pointer"
                >
                  {sample.title.split('(')[0].trim()}
                </button>
              ))}
              {jobDescription && (
                <button
                  onClick={() => setJobDescription('')}
                  className="px-1.5 py-0.5 rounded text-[10px] text-rose-400 hover:text-rose-300 ml-auto cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* JD Textarea */}
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => {
                const val = e.target.value;
                setJobDescription(val);
                if (val.length > 20) {
                  const autoDetected = detectJobTitleFromJD(val, targetTitle);
                  if (autoDetected && autoDetected !== targetTitle) {
                    setTargetTitle(autoDetected);
                    setResumeData(prev => ({
                      ...prev,
                      header: { ...prev.header, title: autoDetected },
                      experience: prev.experience?.map((exp, i) => i === 0 ? { ...exp, role: autoDetected } : exp)
                    }));
                  }
                  const autoDetectedComp = detectCompanyFromJD(val);
                  if (autoDetectedComp && (!targetCompany || targetCompany === 'Company')) {
                    setTargetCompany(autoDetectedComp);
                    setResumeData(prev => ({
                      ...prev,
                      targetCompany: autoDetectedComp
                    }));
                  }
                }
              }}
              placeholder="Paste the target Job Description (JD) here... (e.g. QA Automation Engineer, Performance Test Engineer, Senior SDET...)"
              className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all resize-y font-mono leading-relaxed"
            />

            {/* Role, Company & Engine Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Title (Auto-matches JD):</label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setTargetTitle(newTitle);
                    setResumeData(prev => ({
                      ...prev,
                      header: { ...prev.header, title: newTitle },
                      experience: prev.experience?.map((exp, i) => i === 0 ? { ...exp, role: newTitle } : exp)
                    }));
                  }}
                  placeholder="e.g. QA Automation Engineer, Senior SDET"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Target Company (For Filename):</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. onsemi, Razorpay, Stripe, Google"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">AI Engine:</label>
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                  <option value="groq">Groq Cloud (Ultra-Fast Qwen 27B)</option>
                  <option value="grok">Grok (xAI API grok-2)</option>
                  <option value="offline">Smart Heuristic Engine (Offline / Cloudflare)</option>
                </select>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={handleEnhanceResume}
              disabled={isEnhancing || !jobDescription.trim()}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${isEnhancing
                  ? 'bg-cyan-700/50 text-cyan-200 cursor-wait'
                  : !jobDescription.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-[0.99]'
                }`}
            >
              {isEnhancing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{enhancingStep || 'Enhancing Resume with AI...'}</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-200" />
                  <span>Enhance Resume to Match this JD</span>
                </>
              )}
            </button>
          </div>

          {/* Card: ATS Match Score & Extracted Keywords (if analysis available) */}
          {atsAnalysis && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-lg space-y-2.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">
                    ✓
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">ATS Alignment Score</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
                  {atsAnalysis.atsScore}% Match
                </span>
              </div>

              <div className="text-[11px] text-slate-300">
                <span className="text-slate-400">Target Domain:</span> <strong className="text-emerald-300">{atsAnalysis.domain}</strong>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Infused JD Keywords:</div>
                <div className="flex flex-wrap gap-1">
                  {atsAnalysis.matchingKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>Engine: {atsAnalysis.engineUsed}</span>
                <button
                  onClick={handleSyncToProfile}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{syncSuccess ? 'Profile Synced!' : 'Sync to App Profile'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Card: Section Fine-Tuning Accordions */}
          <div className="bg-[#0b101e] border border-slate-800/90 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fine-Tune Sections</h3>
              </div>
            </div>

            {/* Accordion 0: Header & Contact Info */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('header')}
                className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <span>Header & Contact Details (Icons & Links)</span>
                {openAccordions.header ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openAccordions.header && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Full Name:</label>
                    <input
                      type="text"
                      value={resumeData.header?.fullName || ''}
                      onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, fullName: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Title:</label>
                      <input
                        type="text"
                        value={resumeData.header?.title || ''}
                        onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, title: e.target.value } })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Location:</label>
                      <input
                        type="text"
                        value={resumeData.header?.location || ''}
                        onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, location: e.target.value } })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Email:</label>
                      <input
                        type="email"
                        value={resumeData.header?.email || ''}
                        onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, email: e.target.value } })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400 mb-0.5">Phone (+91 Country Code):</label>
                      <input
                        type="text"
                        value={resumeData.header?.phone || '+91 6204507166'}
                        onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, phone: e.target.value } })}
                        placeholder="+91 6204507166"
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">LinkedIn Profile URL:</label>
                    <input
                      type="text"
                      value={resumeData.header?.linkedinUrl || ''}
                      onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, linkedinUrl: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">GitHub Profile URL:</label>
                    <input
                      type="text"
                      value={resumeData.header?.githubUrl || 'https://github.com/prashant231197'}
                      onChange={(e) => saveResumeState({ ...resumeData, header: { ...resumeData.header, githubUrl: e.target.value } })}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 1: Summary */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('summary')}
                className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <span>Summary:</span>
                {openAccordions.summary ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openAccordions.summary && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2">
                  <textarea
                    rows={5}
                    value={resumeData.summary}
                    onChange={(e) => saveResumeState({ ...resumeData, summary: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-resume-serif leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Accordion 2: Categorized Skills */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('skills')}
                className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <span>Skills ({resumeData.skills?.length || 10} Categories)</span>
                {openAccordions.skills ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openAccordions.skills && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 max-h-72 overflow-y-auto">
                  {resumeData.skills?.map((sCat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="text-[11px] font-bold text-cyan-300">➢ {sCat.category}:</div>
                      <input
                        type="text"
                        value={sCat.items}
                        onChange={(e) => {
                          const updated = [...resumeData.skills];
                          updated[idx] = { ...updated[idx], items: e.target.value };
                          saveResumeState({ ...resumeData, skills: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 3: Experience */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('experience')}
                className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <span>Experience ({resumeData.experience?.[0]?.bullets?.length || 11} Bullets)</span>
                {openAccordions.experience ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openAccordions.experience && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-2 max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <input
                      type="text"
                      value={resumeData.experience[0]?.role || ''}
                      onChange={(e) => {
                        const updated = [...resumeData.experience];
                        updated[0] = { ...updated[0], role: e.target.value };
                        saveResumeState({ ...resumeData, experience: updated });
                      }}
                      placeholder="Role Title"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-bold"
                    />
                  </div>
                  {resumeData.experience?.[0]?.bullets?.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <span className="text-slate-400 font-mono text-xs pt-1">▪</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const updated = [...resumeData.experience];
                          const newBullets = [...updated[0].bullets];
                          newBullets[bIdx] = e.target.value;
                          updated[0].bullets = newBullets;
                          saveResumeState({ ...resumeData, experience: updated });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-resume-serif"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 4: Projects */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion('projects')}
                className="w-full px-3 py-2 bg-slate-900/80 hover:bg-slate-900 flex items-center justify-between text-xs font-semibold text-slate-200 cursor-pointer"
              >
                <span>Projects ({resumeData.projects?.length || 2} Projects)</span>
                {openAccordions.projects ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
              </button>
              {openAccordions.projects && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 space-y-3 max-h-72 overflow-y-auto">
                  {resumeData.projects?.map((proj, pIdx) => (
                    <div key={pIdx} className="space-y-1.5 border-b border-slate-800/80 pb-2">
                      <div className="text-xs font-bold text-white">{proj.title}</div>
                      {proj.rolesAndResponsibilities?.slice(0, 5).map((r, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-slate-400 text-xs">❖</span>
                          <textarea
                            rows={2}
                            value={r}
                            onChange={(e) => {
                              const updated = [...resumeData.projects];
                              const newR = [...updated[pIdx].rolesAndResponsibilities];
                              newR[rIdx] = e.target.value;
                              updated[pIdx].rolesAndResponsibilities = newR;
                              saveResumeState({ ...resumeData, projects: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-xs text-slate-200 font-resume-serif"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT PANE: EXACT SDET-PRASHANT.pdf LIVE PAPER REPLICA    */}
        {/* --------------------------------------------------------- */}
        <div className={`lg:col-span-7 ${mobileActiveView === 'preview' ? 'block' : 'hidden md:block'}`}>

          {/* Preview Toolbar */}
          <div className="no-print bg-[#0e1626] border border-slate-800 rounded-t-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Left: Template Selector Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-700/60">
              <button
                type="button"
                onClick={() => setSelectedTemplate('modern')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${selectedTemplate === 'modern'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                title="Elite Top-Tier ATS Format with verified Logos, modern fonts & Google X-Y-Z metrics (100% Pass Rate)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>🌟 Elite Modern ATS</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono font-bold">
                  Top Pick
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('classic')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${selectedTemplate === 'classic'
                    ? 'bg-slate-700 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                title="Original 1:1 SDET-PRASHANT.pdf layout (Classic Serif)"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>📄 Prashant Classic</span>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInlineEditing(!isInlineEditing)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${isInlineEditing
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
                  }`}
                title="Click any text on the sheet to edit directly"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isInlineEditing ? 'Direct Edit: ON' : 'Direct Edit'}</span>
              </button>

              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-300 font-mono bg-emerald-950/80 border border-emerald-700/60 px-2.5 py-1 rounded-lg shadow-sm" title={`Active dynamic filename: ${getDynamicFilename()}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="max-w-[200px] sm:max-w-xs truncate">📄 {getDynamicFilename()}</span>
              </span>

              <button
                type="button"
                onClick={handleDownloadDirectPDF}
                disabled={isDownloadingPdf}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
                title={`Download ${getDynamicFilename()}`}
              >
                {isDownloadingPdf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Direct Download PDF'}</span>
              </button>
            </div>
          </div>

          {/* Paper Container (Matches selected template) */}
          <div className="bg-[#101726] p-3 sm:p-6 rounded-b-2xl border border-t-0 border-slate-800 overflow-x-auto shadow-2xl">
            {selectedTemplate === 'modern' ? (
              <ModernExecutiveResume
                resumeData={resumeData}
                isInlineEditing={isInlineEditing}
              />
            ) : (
              <div
                id="prashant-resume-paper"
                contentEditable={isInlineEditing}
                suppressContentEditableWarning={true}
                className="resume-paper-sheet bg-white text-black font-resume-serif mx-auto p-6 sm:p-10 shadow-2xl border border-slate-300 transition-all text-left"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#111111',
                  width: '100%',
                  maxWidth: '820px',
                  minHeight: '1080px',
                  fontSize: '13.5px',
                  lineHeight: '1.38',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                }}
              >
                {/* =================================================== */}
                {/* HEADER (Centered)                                   */}
                {/* =================================================== */}
                <div className="text-center pb-2 mb-3">
                  <h1 className="text-2xl sm:text-[28px] font-bold tracking-tight text-black mb-1">
                    {resumeData.header.fullName}
                  </h1>
                  <div className="text-base sm:text-lg font-bold text-black tracking-wide mb-1">
                    {resumeData.header.title}
                  </div>
                  <div className="text-[12.5px] sm:text-[13px] text-[#222222] leading-tight">
                    <span>{resumeData.header.location} | </span>
                    <a href={`mailto:${resumeData.header.email}`} className="text-[#0056b3] hover:underline">
                      {resumeData.header.email}
                    </a>
                    <span> | {resumeData.header.phone} |</span>
                    <div className="pt-0.5">
                      <a
                        href={resumeData.header.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0056b3] hover:underline"
                      >
                        {resumeData.header.linkedinUrl}
                      </a>
                    </div>
                  </div>
                </div>

                {/* =================================================== */}
                {/* 1. SUMMARY                                          */}
                {/* =================================================== */}
                <div className="mb-4">
                  <div className="text-[15px] font-bold text-black mb-1">
                    Summary:
                  </div>
                  <p className="text-justify text-[#222222] leading-relaxed text-[13px]">
                    {resumeData.summary}
                  </p>
                </div>

                {/* =================================================== */}
                {/* 2. EDUCATION                                        */}
                {/* =================================================== */}
                <div className="mb-4">
                  <div className="text-[15px] font-bold text-black mb-1">
                    Education
                  </div>
                  {resumeData.education?.map((edu, idx) => (
                    <div key={idx} className="mb-1 text-[13px]">
                      <div className="flex items-center justify-between font-bold text-black">
                        <span>{edu.institution}</span>
                        <span>{edu.duration}</span>
                      </div>
                      <div className="text-[#333333]">
                        {edu.degree}
                      </div>
                    </div>
                  ))}
                </div>

                {/* =================================================== */}
                {/* 3. EXPERIENCE (Original has "Experince")             */}
                {/* =================================================== */}
                <div className="mb-4">
                  <div className="text-[15px] font-bold text-black mb-1">
                    Experince
                  </div>
                  {resumeData.experience?.map((exp, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="font-bold text-black text-[13.5px]">
                        {exp.role}
                      </div>
                      <div className="font-bold text-black text-[13px] mb-1.5">
                        {exp.companyAndDuration}
                      </div>
                      <ul className="list-none space-y-1 pl-1 text-[13px] text-[#222222]">
                        {exp.bullets?.map((bullet, bIdx) => (
                          <li key={bIdx} className="avoid-break flex items-start gap-2" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <span className="font-mono text-[10px] leading-relaxed select-none shrink-0 pt-0.5">▪</span>
                            <span className="leading-snug">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* =================================================== */}
                {/* 4. SKILLS                                           */}
                {/* =================================================== */}
                <div className="mb-4 avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                  <div className="text-[15px] font-bold text-black mb-1.5">
                    Skills
                  </div>
                  <div className="space-y-1 text-[13px] text-[#222222]">
                    {resumeData.skills?.map((sCat, idx) => (
                      <div key={idx} className="avoid-break flex items-start gap-1.5 leading-snug" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                        <span className="select-none shrink-0 font-bold text-black">➢</span>
                        <div>
                          <strong className="text-black">{sCat.category}: </strong>
                          <span>{sCat.items}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* =================================================== */}
                {/* 5. PROJECTS                                         */}
                {/* =================================================== */}
                <div className="mb-4">
                  <div className="text-[15px] font-bold text-black mb-2">
                    Projects
                  </div>
                  {resumeData.projects?.map((proj, idx) => (
                    <div key={idx} className="mb-3 text-[13px] avoid-break" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                      <div className="font-bold text-black mb-0.5">
                        {proj.title}
                      </div>
                      <div className="font-semibold text-black mb-1">
                        Roles and Responsibilities:
                      </div>
                      <ul className="list-none space-y-1 pl-1 text-[13px] text-[#222222]">
                        {proj.rolesAndResponsibilities?.map((resp, rIdx) => (
                          <li key={rIdx} className="avoid-break flex items-start gap-2" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                            <span className="select-none shrink-0 text-[11px] pt-0.5">❖</span>
                            <span className="leading-snug">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>

          {/* Floating Mobile Action Bar when in preview mode */}
          <div className="no-print md:hidden mt-3 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-2 sticky bottom-4 shadow-2xl z-20">
            <button
              onClick={() => setMobileActiveView('editor')}
              className="py-2 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit JD</span>
            </button>
            <button
              onClick={handleDownloadDirectPDF}
              disabled={isDownloadingPdf}
              className="py-2 px-4 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              {isDownloadingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={handleCopyText}
              className="py-2 px-3 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
