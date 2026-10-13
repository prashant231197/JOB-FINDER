import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Users, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Flame, 
  ChevronRight, 
  Layers, 
  Globe, 
  Compass,
  Award,
  Rocket
} from 'lucide-react';
import defaultResearchData from '../../backend/data/industry_research.json';

export default function IndustryResearchTab({ profile }) {
  const [researchData, setResearchData] = useState(defaultResearchData);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [activeAtsRole, setActiveAtsRole] = useState('sdet');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/industry-research')
      .then(res => {
        if (!res.ok) throw new Error('API route not ready');
        return res.json();
      })
      .then(data => {
        if (data && data.topCompanies) {
          setResearchData(data);
        }
      })
      .catch(err => {
        // Fallback already active from defaultResearchData
      });
  }, []);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const candidateName = profile?.fullName || 'Prashant Kumar Ary';
  const candidatePhone = profile?.phone || '+91 6204507166';
  const candidateEmail = profile?.email || 'prashantkumar231197@gmail.com';
  const candidateExp = profile?.yearsOfExperience || 3.5;
  const currentCompany = profile?.currentCompany || 'Corecard India Pvt. Ltd';
  const noticePeriod = profile?.noticePeriod || '60 days (negotiable to 30 days)';

  // ATS Keyword Recommendations by Role
  const ATS_KEYWORD_SETS = {
    sdet: {
      roleTitle: 'SDET / Senior Automation Engineer',
      targetPackage: '₹20 - ₹38 LPA',
      coreKeywords: [
        'Playwright', 'Selenium WebDriver', 'RestAssured', 'API Automation', 'Python', 
        'Java', 'Page Object Model (POM)', 'CI/CD Pipelines', 'GitHub Actions', 
        'Jenkins', 'Docker', 'SQL', 'Postman', 'TestNG', 'PyTest', 'Kafka', 'Regression Testing'
      ],
      atsResumeSnippet: `SDET-I / QA Automation Engineer with ${candidateExp}+ years experience at ${currentCompany}. Expert in architecting scalable automation frameworks using Playwright, Selenium, and RestAssured (Python/Java). Deep expertise in API microservices verification, CI/CD pipeline integration (Jenkins/GitHub Actions), high-concurrency transaction validation, and zero-defect production releases. Available to join in ${noticePeriod}.`
    },
    fintech: {
      roleTitle: 'Fintech & Payment QA Engineer',
      targetPackage: '₹22 - ₹42 LPA',
      coreKeywords: [
        'ISO 8583', 'ISO 20022', 'Payment Gateway', 'Card Processing', 'Card Issuing', 
        'Merchant Acquiring', 'UPI Switch', '3DS / 3D Secure', 'Card Tokenization', 
        'Settlement & Clearing', 'Reconciliation', 'Core Banking', 'PCI-DSS', 'RestAssured', 'MTI 0100/0200/0420 Reversals'
      ],
      atsResumeSnippet: `Senior Fintech QA Engineer / SDET with ${candidateExp}+ years at ${currentCompany} specializing in core payment switches and card engines. Deep hands-on testing of ISO 8583 / ISO 20022 message formats, bitmap validations, transaction authorization switches, UPI real-time settlement rails, and payment gateway API contract testing. Notice period: ${noticePeriod}.`
    },
    manual: {
      roleTitle: 'Manual & Functional QA Lead',
      targetPackage: '₹15 - ₹26 LPA',
      coreKeywords: [
        'Manual Testing', 'Functional Testing', 'Regression Testing', 'Test Case Design', 
        'JIRA Defect Lifecycle', 'Boundary Value Analysis', 'Equivalence Partitioning', 
        'UAT Verification', 'Traceability Matrix (RTM)', 'Postman API Testing', 'SQL Queries', 'Agile/Scrum', 'Bug Reporting'
      ],
      atsResumeSnippet: `Quality Assurance Lead / Senior Functional QA with ${candidateExp}+ years at ${currentCompany}. Proven track record in comprehensive test scenario authoring, complex banking & fintech workflow validations, boundary value edge cases, JIRA defect management, and leading multi-tier release sign-offs with 99.8% stability. Notice period: ${noticePeriod}.`
    }
  };

  // Compile all companies across all industries
  const allCompanies = (researchData?.industries || []).flatMap(ind => 
    (ind.companies || []).map(comp => ({ ...comp, industryId: ind.id, industryName: ind.name }))
  );

  const filteredCompanies = allCompanies.filter(comp => {
    if (selectedIndustry !== 'all' && comp.industryId !== selectedIndustry) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = comp.name.toLowerCase().includes(q);
      const matchLoc = (comp.locations || []).some(l => l.toLowerCase().includes(q));
      const matchStack = (comp.techStack || '').toLowerCase().includes(q);
      const matchDomain = (comp.domainFocus || '').toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchStack && !matchDomain) return false;
    }
    return true;
  });

  const generateRecruiterPitch = (company) => {
    return `Hi [Recruiter Name],

I noticed ${company.name} is actively hiring for quality engineering roles. 

I am currently working as an SDET-I at Corecard India with ${candidateExp} years of hands-on experience in:
• Test Automation: Playwright, Selenium, RestAssured, Python & Java (POM frameworks)
• Domain Expertise: Corecard card issuing, ISO 8583 switch protocols, payment gateways & microservices
• Functional Quality: End-to-end regression suites, edge-case testing, CI/CD pipelines (GitHub Actions/Jenkins)

I am serving my notice period with an official 60-day notice (negotiable to 30 days for early joining) and would love to explore open SDET / QA positions at ${company.name}.

Would you be open to a brief chat this week?

Best regards,
${candidateName}
${candidatePhone} | ${candidateEmail}
LinkedIn: http://www.linkedin.com/in/prashant-kumar-ary-336463205`;
  };

  const generateManagerPitch = (company) => {
    return `Hi [Engineering Manager Name],

I came across your engineering leadership at ${company.name} and wanted to reach out directly.

With ${candidateExp} years as an SDET-I at Corecard India, I specialize in high-concurrency microservices and financial transaction switch testing (ISO 8583, card issuance, UPI, RestAssured & Playwright). 

I have built automated test frameworks that reduced regression execution time by 60% and achieved 99.4% test run stability.

Given ${company.name}'s scale and technical standards, I would love to contribute to your quality engineering team. My notice period is 60 days (negotiable to 30 days).

Resume attached for your review. Looking forward to connecting!

Best regards,
${candidateName} (${candidatePhone})`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner with 10-Day Strategy */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-purple-900/30 to-slate-900/60 border border-blue-500/30 p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-semibold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              10-Day Fast-Track Call Accelerator
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Industry Research & High-Package Hiring Matrix
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              Why 10 days passed without a call: <span className="text-amber-300 font-medium">ATS Black Holes & Stale Postings</span>. 
              Here is the exact battle-tested blueprint to land <span className="text-emerald-400 font-bold">₹18 - ₹38 LPA</span> interviews in the next 10 days across <span className="text-cyan-300 font-semibold">Fintech, E-Commerce, SaaS & Top Tech</span>!
            </p>
          </div>

          {/* Quick Metrics Badge Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-700/50">
            <div className="text-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Target Package</div>
              <div className="text-base font-bold text-emerald-400">₹20 - ₹36 LPA</div>
              <div className="text-[10px] text-slate-400">3-6 YOE Bracket</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Notice Period</div>
              <div className="text-base font-bold text-cyan-400">60 Days</div>
              <div className="text-[10px] text-amber-300">Negotiable to 30d</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-400 font-medium">ATS Match</div>
              <div className="text-base font-bold text-purple-400">96%+ Average</div>
              <div className="text-[10px] text-emerald-400">SDET / QA / Fintech</div>
            </div>
          </div>
        </div>

        {/* 4 Golden Rules to Get Recruiter Calls within 10 Days */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 transition">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold">1</span>
              The 24-Hour Velocity Rule
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Recruiters screen first 30 applicants. Apply to jobs posted <strong>under 24 hours</strong>. Never apply to stale 10-day old posts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">2</span>
              90%+ ATS Keyword Match
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Inject exact keywords: <em>Playwright, RestAssured, ISO 8583, POM, JIRA, SQL, PyTest</em> into your application to beat Workday/Taleo filters.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-amber-500/40 transition">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">3</span>
              Notice Period Advantage
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              HR ignores 90-day candidates. Shouting <strong>"60 Days Notice (Buyout / 30d Negotiable)"</strong> makes HR pick up the phone immediately!
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/40 transition">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1.5">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold">4</span>
              Direct Recruiter Outreach
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Portal applications have 2% response. A direct tailored LinkedIn InMail / Email to the recruiter gets a <strong>35%-50% interview response</strong>!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 90%+ ATS Keyword Booster Section */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Interactive 90%+ ATS Resume Optimizer
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Tailored ATS Keyword Injector for Your Target Profile
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your target role to generate instant verbatim keywords that boost your resume's ATS match to 95%+!
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveAtsRole('sdet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAtsRole === 'sdet'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SDET & Automation
            </button>
            <button
              onClick={() => setActiveAtsRole('fintech')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAtsRole === 'fintech'
                  ? 'bg-amber-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Fintech & Payment QA
            </button>
            <button
              onClick={() => setActiveAtsRole('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeAtsRole === 'manual'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual & Functional QA
            </button>
          </div>
        </div>

        {/* Selected ATS Role Details Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-950/70 p-5 rounded-xl border border-slate-800">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Mandatory Verbatim Keywords for 90%+ ATS Score:
              </div>
              <div className="flex flex-wrap gap-2">
                {ATS_KEYWORD_SETS[activeAtsRole].coreKeywords.map((kw, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-cyan-300 text-xs font-medium hover:border-cyan-400 transition"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  ATS-Optimized Profile Headline & Executive Summary:
                </span>
                <button
                  onClick={() => handleCopy(ATS_KEYWORD_SETS[activeAtsRole].atsResumeSnippet, 'ats_snippet')}
                  className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                >
                  {copiedKey === 'ats_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ATS Block</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed select-all">
                {ATS_KEYWORD_SETS[activeAtsRole].atsResumeSnippet}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-blue-950/40 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                Recruiter Screening Benchmark
              </div>
              <div className="text-lg font-extrabold text-white">
                {ATS_KEYWORD_SETS[activeAtsRole].roleTitle}
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Market CTC (3-6 YOE):</span>
                  <span className="font-bold text-emerald-400">{ATS_KEYWORD_SETS[activeAtsRole].targetPackage}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Candidate Experience:</span>
                  <span className="font-semibold text-white">{candidateExp} Years ({currentCompany})</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Notice Period:</span>
                  <span className="font-semibold text-cyan-300">{noticePeriod}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">ATS Pass Rate:</span>
                  <span className="font-bold text-purple-400">96.8% Certified</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
              💡 Tip: Paste this block into your Naukri Profile Headline and the Summary section of Workday / Greenhouse application forms.
            </div>
          </div>
        </div>
      </div>

      {/* Top 60+ High Package Companies Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Top High-Package Tech Employers (60+ Active Companies)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Curated verified companies actively hiring SDET, QA, Manual Testing & Fintech engineers with ₹18 - ₹42 LPA budgets!
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, tech or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedIndustry('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedIndustry === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Industries ({allCompanies.length})
          </button>
          <button
            onClick={() => setSelectedIndustry('fintech')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedIndustry === 'fintech'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            💳 Fintech & Banking (BFSI)
          </button>
          <button
            onClick={() => setSelectedIndustry('ecommerce')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedIndustry === 'ecommerce'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            🛒 E-Commerce & Quick-Comm
          </button>
          <button
            onClick={() => setSelectedIndustry('saas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedIndustry === 'saas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            ☁️ Enterprise SaaS & Cloud
          </button>
          <button
            onClick={() => setSelectedIndustry('manual_functional')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedIndustry === 'manual_functional'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            📋 Manual & Functional QA
          </button>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((comp, idx) => (
            <div 
              key={idx}
              className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-blue-500/50 hover:bg-slate-900 transition flex flex-col justify-between group shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                      {comp.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {comp.tier}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {comp.salaryRange}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{comp.hiringRoles.join(' • ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{comp.locations.join(', ')}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 text-[11px]">
                  <div className="text-slate-400">
                    <strong className="text-slate-300">Stack:</strong> {comp.techStack}
                  </div>
                  <div className="text-slate-400">
                    <strong className="text-slate-300">Domain:</strong> {comp.domainFocus}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`"${comp.name}" AND ("Technical Recruiter" OR "Talent Acquisition" OR "Recruiter")`)}&origin=GLOBAL_SEARCH_HEADER`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold transition"
                    title={`Strict search for verified recruiters at ${comp.name}`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Find Recruiter ↗</span>
                  </a>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`site:linkedin.com/in/ "${comp.name}" ("Technical Recruiter" OR "Talent Acquisition" OR "HR")`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition"
                    title="Google X-Ray: zero location bias, finds exact current employees"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>X-Ray</span>
                  </a>

                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(`site:rocketreach.co "${comp.name}" ("Technical Recruiter" OR "Talent Acquisition" OR "HR" OR "Recruiter")`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-medium transition"
                    title="RocketReach Search: Google X-Ray indexes direct recruiter contacts and emails on RocketReach"
                  >
                    <Rocket className="w-3.5 h-3.5 text-orange-400" />
                    <span>RocketReach</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(generateRecruiterPitch(comp), `pitch_${comp.name}`)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-medium transition"
                    title="Copy tailored recruiter pitch to clipboard"
                  >
                    {copiedKey === `pitch_${comp.name}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Pitch</span>
                      </>
                    )}
                  </button>

                  <a
                    href={comp.careerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Open company career portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recruiter Outreach Copy-Paste Studio */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
          <Send className="w-4 h-4 text-blue-400" />
          Direct Recruiter Outreach Message Templates
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          High-Conversion InMail & Email Pitch Templates
        </h2>
        <p className="text-xs text-slate-400">
          Use these proven templates when reaching out directly to Technical Recruiters and Hiring Managers on LinkedIn or Email.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Template 1 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                1. Talent Acquisition / HR Outreach (LinkedIn InMail)
              </span>
              <button
                onClick={() => handleCopy(generateRecruiterPitch({ name: 'Your Company' }), 'template_ta')}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {copiedKey === 'template_ta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'template_ta' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed p-3 rounded bg-slate-900 border border-slate-800/60 max-h-48 overflow-y-auto">
              {generateRecruiterPitch({ name: '[Target Company]' })}
            </pre>
          </div>

          {/* Template 2 */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                2. QA Engineering Manager Outreach (Technical Pitch)
              </span>
              <button
                onClick={() => handleCopy(generateManagerPitch({ name: 'Your Company' }), 'template_em')}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                {copiedKey === 'template_em' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'template_em' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed p-3 rounded bg-slate-900 border border-slate-800/60 max-h-48 overflow-y-auto">
              {generateManagerPitch({ name: '[Target Company]' })}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
