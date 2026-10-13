import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  Globe, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  CreditCard, 
  FileCheck, 
  Layers,
  ChevronDown,
  ChevronUp,
  Building2,
  FileSpreadsheet,
  Copy,
  Check,
  Trash2,
  Rocket,
  ArrowRight,
  EyeOff,
  Eye,
  Link2,
  Clock,
  CheckCheck,
  Linkedin,
  Download,
  UserCheck,
  MessageSquare,
  Flame
} from 'lucide-react';

export default function JobRadar({ 
  jobs = [], 
  applications = [],
  onSearchWorldwide, 
  onParseDirectUrl, 
  onSelectJobForMatch, 
  onApplyToJob,
  onOpenFormFiller,
  onOpenBulkModal,
  onClearAllJobs,
  onNavigateToTab,
  isSearching 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedKeys, setDismissedKeys] = useState(new Set());
  const [filterRemote, setFilterRemote] = useState(false);
  const [filterHighMatch, setFilterHighMatch] = useState(false);
  const [filter90PlusMatch, setFilter90PlusMatch] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all'); // 'all' | 'sdet' | 'qa' | 'manual' | 'fintech'
  const [selectedIndustry, setSelectedIndustry] = useState('all'); // 'all' | 'fintech' | 'ecommerce' | 'saas'
  const [filterFintechOnly, setFilterFintechOnly] = useState(false);
  const [filterIsoCards, setFilterIsoCards] = useState(false);
  const [filterPaymentGateway, setFilterPaymentGateway] = useState(false);
  const [filterSdetOnly, setFilterSdetOnly] = useState(false);
  
  const [showDirectIngest, setShowDirectIngest] = useState(jobs.length === 0);
  const [directUrl, setDirectUrl] = useState('');
  const [parsingUrl, setParsingUrl] = useState(false);
  const [urlMessage, setUrlMessage] = useState(null);
  const [copiedJobId, setCopiedJobId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  React.useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#radar-export-container')) {
        setShowExportDropdown(false);
      }
    };
    if (showExportDropdown) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showExportDropdown]);

  const handleDirectParse = async (e) => {
    if (e) e.preventDefault();
    if (!directUrl.trim()) return;
    setParsingUrl(true);
    setUrlMessage(null);
    try {
      await onParseDirectUrl(directUrl.trim());
      setUrlMessage({ type: 'success', text: 'Job URL successfully parsed, verified, and added to radar!' });
      setDirectUrl('');
      setTimeout(() => setUrlMessage(null), 4000);
    } catch (err) {
      setUrlMessage({ type: 'error', text: err.message || 'Failed to parse URL' });
    } finally {
      setParsingUrl(false);
    }
  };

  const [copiedPitchJobId, setCopiedPitchJobId] = useState(null);

  const cleanCompanyName = (company) => {
    if (!company) return '';
    let cleaned = company
      .replace(/\b(Pvt\.?\s*Ltd\.?|Private\s+Limited|Ltd\.?|Inc\.?|LLC|Corporation|Corp\.?|Solutions|Services|Technologies|Technology|Software|Internet|Consulting|Group)\b/gi, '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return cleaned.length >= 2 ? cleaned : company.trim();
  };

  const handleCopyRecruiterPitch = (job) => {
    const rawCompany = job.company || 'your team';
    const company = cleanCompanyName(rawCompany);
    const role = job.title || 'SDET / QA Role';
    const pitch = `Hi, I noticed the open ${role} position at ${company}.

With 3.5 years of experience as an SDET-I at Corecard India (specializing in Payment Switches, ISO 8583, Playwright, Selenium, RestAssured API automation, and CI/CD pipelines), I can ramp up immediately.

I am currently on an official 60-day notice period (negotiable to 30 days for an early start). Would love to share my resume and connect briefly regarding this opening!

Best regards,
Prashant Kumar Ary | +91 6204507166`;

    navigator.clipboard.writeText(pitch);
    const key = job.id || job._id || job.applicationUrl || job.title;
    setCopiedPitchJobId(key);
    setToastMessage({
      type: 'success',
      text: `1-Click Recruiter DM for ${company} copied! Send directly to recruiter on LinkedIn.`
    });
    setTimeout(() => setCopiedPitchJobId(null), 3000);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFindRecruiter = (job) => {
    const rawCompany = job.company || '';
    const cleanCompany = cleanCompanyName(rawCompany);
    // Strict boolean query: Quotes around company + explicit AND + grouped HR roles
    // Eliminates random local city (Bhopal) fallback results completely!
    const query = `"${cleanCompany}" AND ("Technical Recruiter" OR "Talent Acquisition" OR "Recruiter" OR "HR" OR "Hiring Lead")`;
    const url = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}&origin=GLOBAL_SEARCH_HEADER`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOpenCompanyPage = (job) => {
    const rawCompany = job.company || '';
    const cleanCompany = cleanCompanyName(rawCompany);
    // Directly opens official company search on LinkedIn so candidate can view verified company employees
    const url = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(cleanCompany)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleXray = (job) => {
    const rawCompany = job.company || '';
    const cleanCompany = cleanCompanyName(rawCompany);
    // Google X-Ray Search: zero location/Bhopal bias, indexes current employer directly on LinkedIn
    const query = `site:linkedin.com/in/ "${cleanCompany}" ("Technical Recruiter" OR "Talent Acquisition" OR "HR" OR "Recruiter")`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRocketReach = (job) => {
    const rawCompany = job.company || '';
    const cleanCompany = cleanCompanyName(rawCompany);
    // RocketReach Google X-Ray: indexes exact recruiter emails, phone numbers & profiles on rocketreach.co bypassing paywalls
    const query = `site:rocketreach.co "${cleanCompany}" ("Technical Recruiter" OR "Talent Acquisition" OR "HR" OR "Recruiter")`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDismissKeys = (j) => {
    if (!j) return [];
    const keys = [];
    if (j.id) keys.push(String(j.id));
    if (j._id) keys.push(String(j._id));
    const u = j.applicationUrl || j.applyUrl || j.url;
    if (u) {
      const cleanU = String(u).trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('?')[0].split('#')[0].replace(/\/+$/, '');
      keys.push(cleanU);
    }
    const comp = (j.company || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const title = (j.title || j.jobTitle || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (comp && title) {
      keys.push(`${comp}:::${title}`);
    }
    return keys;
  };

  const handleMarkDone = (job, status = 'Applied') => {
    // Synchronously dismiss locally so card vanishes immediately with zero latency
    const keys = getDismissKeys(job);
    setDismissedKeys(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.add(k));
      return next;
    });

    if (onApplyToJob) {
      onApplyToJob(job, status);
    }
    setToastMessage({
      type: 'success',
      text: `✓ "${job.title || job.jobTitle}" marked as ${status} & moved to Application Tracker!`
    });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleDismissJob = (job) => {
    const keys = getDismissKeys(job);
    setDismissedKeys(prev => {
      const next = new Set(prev);
      keys.forEach(k => next.add(k));
      return next;
    });

    const jobId = job.id || job._id || '';
    const jobUrl = job.applicationUrl || job.applyUrl || job.url || '';
    const jobTitle = job.title || job.jobTitle || '';
    const jobCompany = job.company || '';

    // Remove from backend jobs store
    fetch('/api/jobs/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: jobId,
        url: jobUrl,
        company: jobCompany,
        title: jobTitle
      })
    }).catch(() => {});

    setToastMessage({
      type: 'info',
      text: `Opening "${job.title || job.jobTitle}" dismissed from Radar.`
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDirectApplyClick = (job) => {
    const targetUrl = job.applicationUrl || job.applyUrl || job.url || '';
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    handleMarkDone(job, 'Applied');
  };

  const handleClearRadar = () => {
    if (window.confirm(`Clear all ${jobs.length} job(s) from Radar? This will reset the radar so you can ingest fresh jobs.`)) {
      if (onClearAllJobs) {
        onClearAllJobs();
        setToastMessage({
          type: 'info',
          text: 'Radar has been cleared. Ingest your fresh jobs below!'
        });
        setTimeout(() => setToastMessage(null), 4000);
      }
    }
  };

  const appliedCount = (applications && applications.length > 0)
    ? applications.filter(a => ['Applied', 'Interview', 'Offer', 'Rejected'].includes(a.status || 'Applied')).length
    : jobs.filter(j => j.hasAlreadyApplied || j.status === 'Applied' || j.applicationStatus === 'Applied').length;

  const filteredJobs = jobs.filter(job => {
    if (job.disqualified) return false;

    // Check if dismissed in current session
    const jobKeys = getDismissKeys(job);
    if (jobKeys.some(k => dismissedKeys.has(k))) return false;

    // Automatically remove any job marked as applied on the job object
    const isApplied = job.hasAlreadyApplied || job.status === 'Applied' || job.applicationStatus === 'Applied';
    if (isApplied) return false;

    // Automatically remove if already present in application pipeline
    if (applications && applications.length > 0) {
      const jUrlClean = (job.applicationUrl || job.applyUrl || job.url || '').trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('?')[0].split('#')[0].replace(/\/+$/, '');
      const jCompNorm = (job.company || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
      const jTitleNorm = (job.title || job.jobTitle || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

      const isTracked = applications.some(app => {
        const isDone = ['Applied', 'Interview', 'Offer', 'Rejected'].includes(app.status || 'Applied');
        if (!isDone) return false;

        const aUrlClean = (app.applicationUrl || app.url || app.applyUrl || '').trim().toLowerCase().replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('?')[0].split('#')[0].replace(/\/+$/, '');
        if (jUrlClean && aUrlClean && jUrlClean === aUrlClean) return true;

        const aCompNorm = (app.company || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
        const aTitleNorm = (app.jobTitle || app.title || '').toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

        if (jCompNorm && aCompNorm && jCompNorm === aCompNorm && jTitleNorm && aTitleNorm) {
          if (jTitleNorm === aTitleNorm || jTitleNorm.includes(aTitleNorm) || aTitleNorm.includes(jTitleNorm)) {
            return true;
          }
        }
        return false;
      });

      if (isTracked) return false;
    }
    
    // 100% Remote filter
    if (filterRemote) {
      const loc = (job.location || '').toLowerCase();
      const pref = (job.workPreference || '').toLowerCase();
      if (!loc.includes('remote') && !pref.includes('remote') && !loc.includes('worldwide')) return false;
    }

    // 90%+ ATS Match Only Filter
    if (filter90PlusMatch && (job.matchScore || 0) < 90) return false;

    // High match score filter (80%+)
    if (filterHighMatch && (job.matchScore || 0) < 80) return false;

    // Target Role Filter (SDET, QA, Manual Testing, Fintech QA)
    if (selectedRole !== 'all') {
      const text = `${job.title} ${job.description} ${(job.requiredSkills || []).join(' ')} ${(job.fintechTags || []).join(' ')} ${job.roleCategory || ''}`.toLowerCase();
      if (selectedRole === 'sdet') {
        if (!text.includes('sdet') && !text.includes('automation') && !text.includes('playwright')) return false;
      } else if (selectedRole === 'qa') {
        if (!text.includes('qa') && !text.includes('quality') && !text.includes('test')) return false;
      } else if (selectedRole === 'manual') {
        if (!text.includes('manual') && !text.includes('functional') && !text.includes('test case') && !text.includes('uat')) return false;
      } else if (selectedRole === 'fintech') {
        if (!text.includes('fintech') && !text.includes('card') && !text.includes('switch') && !text.includes('payment') && !text.includes('iso')) return false;
      }
    }

    // Industry Filter (Fintech, E-commerce, SaaS, Manual/Banking)
    if (selectedIndustry !== 'all') {
      const text = `${job.title} ${job.company} ${job.sector || ''} ${job.industry || ''} ${job.description}`.toLowerCase();
      if (selectedIndustry === 'fintech') {
        if (!text.includes('fintech') && !text.includes('bank') && !text.includes('payment') && !text.includes('card') && !text.includes('bfsi')) return false;
      } else if (selectedIndustry === 'ecommerce') {
        if (!text.includes('commerce') && !text.includes('cart') && !text.includes('checkout') && !text.includes('flipkart') && !text.includes('amazon') && !text.includes('swiggy') && !text.includes('zomato') && !text.includes('zepto') && !text.includes('blinkit')) return false;
      } else if (selectedIndustry === 'saas') {
        if (!text.includes('saas') && !text.includes('cloud') && !text.includes('enterprise') && !text.includes('browserstack') && !text.includes('postman') && !text.includes('adobe') && !text.includes('microsoft')) return false;
      }
    }

    // Fintech domain filter
    if (filterFintechOnly) {
      const isFintech = job.sector || (job.fintechTags && job.fintechTags.length > 0) ||
        /fintech|payment|card|iso|switch|banking/i.test(`${job.title} ${job.description}`);
      if (!isFintech) return false;
    }

    // ISO 8583 & Cards domain filter
    if (filterIsoCards) {
      const text = `${job.title} ${job.description} ${(job.fintechTags || []).join(' ')}`.toLowerCase();
      const matchesIsoCard = text.includes('iso') || text.includes('8583') || text.includes('8989') || text.includes('card') || text.includes('switch');
      if (!matchesIsoCard) return false;
    }

    // Payment Gateway filter
    if (filterPaymentGateway) {
      const text = `${job.title} ${job.description} ${(job.fintechTags || []).join(' ')}`.toLowerCase();
      const matchesGateway = text.includes('payment') || text.includes('gateway') || text.includes('checkout') || text.includes('acquiring');
      if (!matchesGateway) return false;
    }

    // SDET only filter
    if (filterSdetOnly) {
      const text = `${job.title}`.toLowerCase();
      if (!text.includes('sdet') && !text.includes('automation engineer')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (job.title || '').toLowerCase().includes(q);
      const compMatch = (job.company || '').toLowerCase().includes(q);
      const sectorMatch = (job.sector || '').toLowerCase().includes(q);
      const skillsMatch = (job.requiredSkills || []).some(s => s.toLowerCase().includes(q));
      const tagsMatch = (job.fintechTags || []).some(t => t.toLowerCase().includes(q));
      const locMatch = (job.location || '').toLowerCase().includes(q);
      if (!titleMatch && !compMatch && !skillsMatch && !sectorMatch && !tagsMatch && !locMatch) return false;
    }

    return true;
  });

  const hasActiveFilters = filterRemote || filterHighMatch || filter90PlusMatch || selectedRole !== 'all' || selectedIndustry !== 'all' || filterFintechOnly || filterIsoCards || filterPaymentGateway || filterSdetOnly || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRemote(false);
    setFilterHighMatch(false);
    setFilter90PlusMatch(false);
    setSelectedRole('all');
    setSelectedIndustry('all');
    setFilterFintechOnly(false);
    setFilterIsoCards(false);
    setFilterPaymentGateway(false);
    setFilterSdetOnly(false);
  };

  const handleExportCsv = (exportAll = false) => {
    // If exportAll is requested, export the full jobs list; otherwise export filteredJobs if filters are active
    const listToExport = exportAll 
      ? jobs 
      : (hasActiveFilters && filteredJobs.length > 0 ? filteredJobs : jobs);

    if (!listToExport || listToExport.length === 0) {
      setToastMessage({
        type: 'error',
        text: 'No jobs available in Radar to export.'
      });
      setTimeout(() => setToastMessage(null), 3500);
      setShowExportDropdown(false);
      return;
    }

    const headers = [
      'Company',
      'Job Title',
      'Match Score (%)',
      'Location',
      'Salary / Compensation',
      'Experience',
      'Domain / Sector',
      'Work Mode',
      'Source Platform',
      'Status',
      'Direct Apply URL',
      'Fintech Tags',
      'Required Skills',
      'Job Description Snippet',
      'Exported Date'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/\r\n/g, ' ').replace(/[\r\n]/g, ' ').trim();
      return `"${clean.replace(/"/g, '""')}"`;
    };

    const rows = listToExport.map(j => {
      const matchScore = typeof j.matchScore === 'number' ? j.matchScore : (parseInt(j.matchScore) || 0);
      const applyUrl = j.applicationUrl || j.applyUrl || j.url || j.link || '';
      const tags = Array.isArray(j.fintechTags) ? j.fintechTags.join('; ') : (j.fintechTags || '');
      const skills = Array.isArray(j.requiredSkills) ? j.requiredSkills.join('; ') : (j.requiredSkills || '');
      const status = (j.hasAlreadyApplied || j.status === 'Applied' || j.applicationStatus === 'Applied') 
        ? 'Applied (In Tracker)' 
        : (j.status || 'Active in Radar');
      const descSnippet = (j.description || '').replace(/\s+/g, ' ').slice(0, 350);

      return [
        escapeCsv(j.company || 'Unknown Company'),
        escapeCsv(j.title || 'Untitled Role'),
        escapeCsv(`${matchScore}%`),
        escapeCsv(j.location || 'Remote / Worldwide'),
        escapeCsv(j.salary || 'Competitive / Unspecified'),
        escapeCsv(j.experience || 'Not specified'),
        escapeCsv(j.sector || 'Fintech / QA Automation'),
        escapeCsv(j.workPreference || j.workMode || 'Flexible'),
        escapeCsv(j.source || 'Direct Radar Ingest'),
        escapeCsv(status),
        escapeCsv(applyUrl),
        escapeCsv(tags),
        escapeCsv(skills),
        escapeCsv(descSnippet),
        escapeCsv(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }))
      ].join(',');
    });

    // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows/Mac properly parses special characters and currencies
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const scopeSuffix = (!exportAll && hasActiveFilters && filteredJobs.length !== jobs.length) ? '_filtered' : '_all';
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_radar_export${scopeSuffix}_${dateStamp}_${listToExport.length}jobs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage({
      type: 'success',
      text: `✓ Successfully exported ${listToExport.length} job(s) to CSV!`
    });
    setTimeout(() => setToastMessage(null), 4000);
    setShowExportDropdown(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Floating Status / Action Toast */}
      {toastMessage && (
        <div className={`p-3.5 rounded-xl border shadow-xl flex items-center justify-between gap-3 text-xs font-semibold animate-in slide-in-from-top-3 duration-200 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50 shadow-emerald-950/50'
            : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/50 shadow-cyan-950/50'
        }`}>
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('pipeline')}
              className="text-[11px] underline text-white hover:text-emerald-200 font-bold shrink-0 ml-2"
            >
              View in App Tracker →
            </button>
          )}
        </div>
      )}
      
      {/* Top Search & Filter Control Hub */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              className="input-field input-with-icon text-xs py-2.5 bg-slate-900 border-slate-700 w-full"
              placeholder="Search by role title, company, SDET, ISO 8583, Cards, Playwright, Python..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={() => setShowDirectIngest(!showDirectIngest)}
              className="btn btn-primary text-xs font-semibold py-2.5 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-md shadow-violet-900/30"
              title="Add a custom direct job link"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Direct URL Ingest</span>
              <span className="sm:hidden">URL Ingest</span>
              {showDirectIngest ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
            </button>

            <button
              onClick={() => onOpenBulkModal && onOpenBulkModal()}
              className="btn btn-secondary text-xs font-medium py-2.5 px-3 flex items-center justify-center gap-1.5 text-cyan-300 border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 hover:text-white"
              title="Upload CSV of career portals or paste URLs in bulk"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Bulk CSV Ingest</span>
              <span className="sm:hidden">CSV Ingest</span>
            </button>

            {/* Export CSV Button (Export anytime) */}
            <div className="relative" id="radar-export-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (jobs.length === 0) {
                    handleExportCsv(false);
                    return;
                  }
                  if (hasActiveFilters && filteredJobs.length !== jobs.length) {
                    setShowExportDropdown(!showExportDropdown);
                  } else {
                    handleExportCsv(false);
                  }
                }}
                className={`btn btn-secondary text-xs font-semibold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all ${
                  jobs.length === 0
                    ? 'text-slate-500 border-slate-800 bg-slate-900/50 hover:text-slate-400'
                    : 'text-emerald-300 border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-900/40 hover:text-white shadow-md shadow-emerald-950/30'
                }`}
                title={jobs.length === 0 ? "Radar has no jobs to export yet" : (hasActiveFilters && filteredJobs.length !== jobs.length ? "Export CSV (Choose Filtered or All)" : `Export ${jobs.length} jobs to CSV`)}
              >
                <Download className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export CSV</span>
                {jobs.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {hasActiveFilters ? filteredJobs.length : jobs.length}
                  </span>
                )}
                {hasActiveFilters && filteredJobs.length !== jobs.length && (
                  <ChevronDown className="w-3 h-3 text-emerald-400 shrink-0 ml-0.5" />
                )}
              </button>

              {/* Dropdown Scope Menu when filtered */}
              {showExportDropdown && hasActiveFilters && filteredJobs.length !== jobs.length && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-[#090e1a] border border-emerald-500/40 shadow-2xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    Export to CSV Scope
                  </div>
                  <button
                    onClick={() => handleExportCsv(false)}
                    className="w-full text-left p-2 rounded-lg hover:bg-emerald-950/60 text-xs text-white flex items-center justify-between group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-emerald-300 flex items-center gap-1">
                        <Download className="w-3 h-3 text-emerald-400" /> Filtered Openings
                      </span>
                      <span className="text-[10px] text-slate-400">Export currently visible jobs</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                      {filteredJobs.length}
                    </span>
                  </button>
                  <button
                    onClick={() => handleExportCsv(true)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-300 group-hover:text-white flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-400" /> All Radar Openings
                      </span>
                      <span className="text-[10px] text-slate-400">Export full radar database</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {jobs.length}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {jobs.length > 0 && (
              <button
                onClick={handleClearRadar}
                className="btn btn-secondary text-xs font-medium py-2.5 px-3 flex items-center justify-center gap-1.5 text-rose-300 border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/40 hover:text-rose-100"
                title="Clear all jobs from Radar to start a fresh ingest"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="hidden sm:inline">Clear Radar ({jobs.length})</span>
                <span className="sm:hidden">Clear ({jobs.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Direct URL Ingestion Drawer */}
        {showDirectIngest && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-violet-500/40 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-violet-400" /> Direct Job Link Ingestion (Paste & Add)
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Greenhouse • Lever • Ashby • Workday • Naukri • Official Career URLs
              </span>
            </div>
            <form onSubmit={handleDirectParse} className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                className="input-field text-xs py-2.5 bg-slate-950 border-slate-700 flex-1 font-mono text-cyan-200"
                placeholder="Paste direct job application URL (e.g. https://boards.greenhouse.io/... or https://jobs.lever.co/...)"
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={parsingUrl || !directUrl.trim()}
                className="btn btn-primary text-xs px-5 py-2.5 shrink-0 font-bold w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
              >
                {parsingUrl ? (
                  <>
                    <Globe className="w-3.5 h-3.5 animate-spin" />
                    <span>Parsing & Ingesting...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Ingest into Radar</span>
                  </>
                )}
              </button>
            </form>
            {urlMessage && (
              <div className={`text-xs p-2.5 rounded-lg flex items-center gap-2 ${
                urlMessage.type === 'success' 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium' 
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}>
                {urlMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{urlMessage.text}</span>
              </div>
            )}
          </div>
        )}

        {/* Domain, Role & Industry Filter Control Matrix */}
        {jobs.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            {/* Row 1: Target Roles & 90%+ ATS Match Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
                Role:
              </span>
              <button
                onClick={() => setSelectedRole('all')}
                className={`text-xs py-1.5 px-3 rounded-lg border font-semibold transition-all ${
                  selectedRole === 'all'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                All Roles
              </button>
              <button
                onClick={() => setSelectedRole('sdet')}
                className={`text-xs py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                  selectedRole === 'sdet'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>🤖 SDET (Automation)</span>
              </button>
              <button
                onClick={() => setSelectedRole('qa')}
                className={`text-xs py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                  selectedRole === 'qa'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>🎯 QA / Senior QA</span>
              </button>
              <button
                onClick={() => setSelectedRole('manual')}
                className={`text-xs py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                  selectedRole === 'manual'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>📋 Manual & Functional QA</span>
              </button>
              <button
                onClick={() => setSelectedRole('fintech')}
                className={`text-xs py-1.5 px-3 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
                  selectedRole === 'fintech'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>💳 Fintech & Payment QA</span>
              </button>

              {/* 90%+ ATS Match Only Toggle */}
              <button
                onClick={() => setFilter90PlusMatch(!filter90PlusMatch)}
                className={`ml-auto text-xs py-1.5 px-3 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                  filter90PlusMatch 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-300 shadow-lg shadow-emerald-950/50 animate-pulse' 
                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>⭐ 90%+ ATS Match Only</span>
              </button>
            </div>

            {/* Row 2: Industries & Remote Filter */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono mr-1">
                Industry:
              </span>
              <button
                onClick={() => setSelectedIndustry('all')}
                className={`text-xs py-1 px-2.5 rounded-lg border font-medium transition-all ${
                  selectedIndustry === 'all'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                All Industries
              </button>
              <button
                onClick={() => setSelectedIndustry('fintech')}
                className={`text-xs py-1 px-2.5 rounded-lg border font-medium transition-all ${
                  selectedIndustry === 'fintech'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                💳 Fintech & BFSI
              </button>
              <button
                onClick={() => setSelectedIndustry('ecommerce')}
                className={`text-xs py-1 px-2.5 rounded-lg border font-medium transition-all ${
                  selectedIndustry === 'ecommerce'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                🛒 E-Commerce & Quick-Comm
              </button>
              <button
                onClick={() => setSelectedIndustry('saas')}
                className={`text-xs py-1 px-2.5 rounded-lg border font-medium transition-all ${
                  selectedIndustry === 'saas'
                    ? 'bg-purple-600 text-white border-purple-400'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                ☁️ Enterprise SaaS
              </button>

              <button
                onClick={() => setFilterRemote(!filterRemote)}
                className={`text-xs py-1 px-2.5 rounded-lg border font-medium flex items-center gap-1 transition-all ${
                  filterRemote 
                    ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400' 
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>🌐 Remote</span>
              </button>

              {/* Notice Period & Fast Track Link */}
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('industry-research')}
                  className="ml-auto text-[11px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 underline"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>10-Day Call Strategy & Top 60+ Employers →</span>
                </button>
              )}
            </div>

            {/* Status count bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Showing <strong className="text-white font-bold">{filteredJobs.length}</strong> of {jobs.length} opening(s)</span>
                {appliedCount > 0 && (
                  <span className="text-emerald-400 font-semibold">• {appliedCount} Applied</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {jobs.length > 0 && (
                  <button
                    onClick={() => handleExportCsv(false)}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-sans flex items-center gap-1 hover:underline cursor-pointer font-medium"
                    title="Export currently displayed jobs to CSV file"
                  >
                    <Download className="w-3 h-3 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                )}
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-sans"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Fresh Ingest Hub / Empty State when Radar has 0 jobs */}
      {jobs.length === 0 && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0c1322] via-[#0f172a] to-[#131b2e] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-2xl mx-auto text-center space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                RADAR READY FOR FRESH INGESTION
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ingest QA & SDET Openings
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Jobs Radar strictly displays verified jobs added by you. Ingest openings via direct ATS URLs, 1-week Naukri scan, 520+ Fintech directory, or Bulk CSV upload.
              </p>
            </div>

            {/* Ingestion Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 relative z-10">
              
              {/* Option 1: Direct URL Ingestion */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-violet-500/30 hover:border-violet-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-violet-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
                      <Link2 className="w-4 h-4 text-violet-400" />
                    </div>
                    <span>1. Direct Job Link Ingest</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste any official job URL (Greenhouse, Lever, Ashby, Workday, Naukri). Extracts JD, tech stack, and attaches direct apply link.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowDirectIngest(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full btn btn-secondary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 text-violet-300 border-violet-500/40 bg-violet-950/20 hover:bg-violet-950/50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Paste Direct URL</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Naukri 1-Week Latest Hub */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-cyan-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>2. Naukri Latest Postings Hub</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Fresh QA/SDET jobs posted under 1 week across Bangalore, Pune, Hyderabad, or any global location. Ingest with 1 click.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('naukri')}
                    className="w-full btn btn-primary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white"
                  >
                    <span>Launch Naukri Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 2.5: LinkedIn Easy Apply Hub */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-sky-500/30 hover:border-sky-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-sky-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
                      <Linkedin className="w-4 h-4 text-sky-400" />
                    </div>
                    <span>3. LinkedIn Easy Apply Hub</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scan verified 1-week LinkedIn Easy Apply SDET openings with 1-click tailored ATS resume generation.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('linkedin')}
                    className="w-full btn btn-primary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-blue-600 text-white"
                  >
                    <span>Launch LinkedIn Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 2.8: 5 Global Platforms Hub */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>4. Global Platforms Hub</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We Work Remotely, Otta, Wellfound, Y Combinator, and Glassdoor in one consolidated tab with match scoring.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('global-platforms')}
                    className="w-full btn btn-primary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white"
                  >
                    <span>Launch 5-Platform Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 3: 520+ Fintech Directory */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-emerald-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span>3. 520+ Fintech Directory</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Explore curated QA/SDET openings across global fintech giants: Stripe, Adyen, Razorpay, PhonePe, Paytm, and ISO 8583 switches.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateToTab && onNavigateToTab('fintech')}
                    className="w-full btn btn-secondary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 text-emerald-300 border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/50"
                  >
                    <span>Explore 520+ Fintechs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Option 4: Bulk CSV / URL Spreadsheet */}
              <div className="p-5 rounded-2xl bg-[#080d19]/90 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-3 flex flex-col justify-between group">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                      <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                    </div>
                    <span>4. Bulk CSV Upload</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have an Excel or CSV file of career URLs or company portals? Upload it here to bulk ingest and rank them against your resume.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => onOpenBulkModal && onOpenBulkModal()}
                    className="w-full btn btn-secondary text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-2 text-amber-300 border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/50"
                  >
                    <span>Upload CSV / Bulk URLs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Discovered Jobs List */}
      {jobs.length > 0 && (
        <div className="space-y-3.5">
          {filteredJobs.length === 0 ? (
            <div className="bg-[#0f172a]/70 border border-dashed border-slate-800 p-12 text-center rounded-2xl">
              <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-300">No QA / SDET openings match current filter criteria</div>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Try adjusting or resetting your filters to see all {jobs.length} ingested jobs.
              </p>
              <button
                onClick={clearFilters}
                className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const score = job.matchScore || 0;
              const scoreClass = score >= 85 ? 'score-high' : score >= 70 ? 'score-mid' : 'score-low';
              const isApplied = job.hasAlreadyApplied || job.status === 'Applied' || job.applicationStatus === 'Applied';
              const directApplyUrl = job.applicationUrl || job.applyUrl || job.url || '';
              const isCopied = copiedJobId === (job.id || job._id || directApplyUrl);

              return (
                <div 
                  key={job.id || job._id || directApplyUrl} 
                  className={`job-card-item p-4 sm:p-5 rounded-2xl border transition-all space-y-3 group shadow-lg ${
                    isApplied 
                      ? 'bg-[#09101d]/90 border-emerald-500/30' 
                      : 'bg-[#0b101d]/90 border-slate-800 hover:border-cyan-500/40 hover:bg-[#0f172a]'
                  }`}
                >
                  {/* Row 1: Company & Tags on Left, Match Score on Right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider font-mono">
                        {job.company}
                      </span>
                      {job.sector && (
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                          {job.sector}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-mono">
                        • {job.source || 'Direct Ingest'}
                      </span>
                      {isApplied && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>APPLIED • IN TRACKER</span>
                        </span>
                      )}
                    </div>

                    {/* Match Score Badge (Clickable for breakdown) */}
                    <button
                      onClick={() => onSelectJobForMatch && onSelectJobForMatch(job)}
                      title="Click to view detailed Match Score breakdown"
                      className={`score-pill ${scoreClass} cursor-pointer hover:scale-105 transition-transform flex items-center gap-1.5 text-xs font-bold py-1 px-2.5 rounded-full shrink-0 shadow-sm ${
                        score >= 90 ? 'ring-2 ring-emerald-400/80 bg-emerald-950/80 text-emerald-300 font-extrabold shadow-[0_0_15px_rgba(52,211,153,0.35)]' : ''
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{score >= 90 ? `⭐ ${score}% ATS MATCH` : `${score}% MATCH`}</span>
                    </button>
                  </div>

                  {/* Row 2: Prominent Full-Width Job Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                    {job.title}
                  </h3>

                  {/* Row 3: Meta Info (Location, Salary, Experience) */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{job.location || 'Remote / Worldwide'}</span>
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{job.salary || 'Competitive / Unspecified'}</span>
                    </span>
                    <span className="text-slate-600 hidden sm:inline">•</span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <span>{job.experience || '3-8 Years (Mid/Senior QA)'}</span>
                    </span>
                  </div>

                  {/* Row 4: Description Snippet */}
                  {job.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                  )}

                  {/* Row 5: Domain & Technical Skills Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {(job.fintechTags || []).map((tag, idx) => (
                      <span key={`ft-${idx}`} className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        #{tag}
                      </span>
                    ))}

                    {(job.requiredSkills || []).slice(0, 5).map((skill, idx) => (
                      <span key={`sk-${idx}`} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 border border-slate-700/60">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Row 6: Dedicated Direct Apply URL Bar with 1-Click Copy & Open */}
                  {directApplyUrl && (
                    <div className="p-2.5 rounded-xl bg-[#080d19] border border-cyan-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-cyan-300 shrink-0">Direct Apply URL:</span>
                        <a 
                          href={directApplyUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[11px] font-mono text-slate-300 hover:text-cyan-200 truncate underline hover:no-underline"
                          title={directApplyUrl}
                        >
                          {directApplyUrl}
                        </a>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleCopyUrl(directApplyUrl, job.id || job._id || directApplyUrl)}
                          className={`text-xs py-1 px-2.5 rounded-lg border font-medium flex items-center gap-1 transition-all ${
                            isCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white hover:border-slate-600'
                          }`}
                          title="Copy direct application URL to clipboard"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                          <span>{isCopied ? 'Copied!' : 'Copy URL'}</span>
                        </button>

                        <a
                          href={directApplyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs py-1 px-2.5 rounded-lg border font-medium flex items-center gap-1 bg-cyan-950/40 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900/60 hover:text-white transition-all"
                          title="Open application URL in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Link ↗</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Row 6.5: Direct Recruiter Bypass & 10-Day Call Fast-Track Strip */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-violet-950/30 to-slate-900 border border-blue-500/30 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                        <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div className="text-[11px] leading-tight">
                        <span className="font-bold text-blue-200">Target Recruiter: </span>
                        <span className="text-cyan-300 font-semibold">{cleanCompanyName(job.company)}</span>
                        <span className="text-slate-500 hidden sm:inline"> (Zero Bhopal/Local Bias)</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      {/* Option 1: Strict Quoted LinkedIn Search */}
                      <button
                        onClick={() => handleFindRecruiter(job)}
                        className="text-xs py-1 px-2.5 rounded-lg border font-semibold flex items-center gap-1 bg-[#0a66c2]/25 text-sky-300 border-sky-500/50 hover:bg-[#0a66c2]/50 hover:text-white transition-all shadow-sm"
                        title={`Strict LinkedIn search for verified recruiters at ${cleanCompanyName(job.company)}`}
                      >
                        <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                        <span>Find {cleanCompanyName(job.company)} HR ↗</span>
                      </button>

                      {/* Option 2: Direct Company Official Page on LinkedIn */}
                      <button
                        onClick={() => handleOpenCompanyPage(job)}
                        className="text-xs py-1 px-2 rounded-lg border font-medium flex items-center gap-1 bg-slate-900/90 text-slate-300 border-slate-700 hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
                        title={`Open official ${cleanCompanyName(job.company)} LinkedIn company page to view verified employees in People tab`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Company Page</span>
                      </button>

                      {/* Option 3: Google X-Ray Search (Zero Location Bias) */}
                      <button
                        onClick={() => handleGoogleXray(job)}
                        className="text-xs py-1 px-2 rounded-lg border font-medium flex items-center gap-1 bg-slate-900/90 text-amber-300/80 border-slate-700 hover:text-amber-200 hover:border-amber-500/40 transition-all"
                        title="Google X-Ray Search: indexes exact recruiter profiles directly by employer on LinkedIn"
                      >
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>Google X-Ray</span>
                      </button>

                      {/* Option 4: RocketReach Google X-Ray Search */}
                      <button
                        onClick={() => handleRocketReach(job)}
                        className="text-xs py-1 px-2.5 rounded-lg border font-medium flex items-center gap-1 bg-gradient-to-r from-orange-950/40 to-amber-950/30 text-orange-300 border-orange-500/40 hover:bg-orange-900/50 hover:text-white hover:border-orange-400 transition-all shadow-sm"
                        title={`RocketReach Search: Google X-Ray indexes direct recruiter contacts, verified emails & phone numbers for ${cleanCompanyName(job.company)} on RocketReach`}
                      >
                        <Rocket className="w-3.5 h-3.5 text-orange-400" />
                        <span>RocketReach</span>
                      </button>

                      {/* Option 4: 1-Click Tailored DM */}
                      <button
                        onClick={() => handleCopyRecruiterPitch(job)}
                        className={`text-xs py-1 px-2.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
                          copiedPitchJobId === (job.id || job._id || job.applicationUrl || job.title)
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-violet-950/40 text-violet-300 border-violet-500/40 hover:bg-violet-900/60 hover:text-white'
                        }`}
                        title="Copy personalized 60-day notice pitch to send to HR"
                      >
                        {copiedPitchJobId === (job.id || job._id || job.applicationUrl || job.title) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                        )}
                        <span>{copiedPitchJobId === (job.id || job._id || job.applicationUrl || job.title) ? 'Pitch Copied!' : 'Copy 1-Click DM'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Row 7: Bottom Action Bar & Status Management */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-2">
                      {isApplied ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                          <CheckCheck className="w-4 h-4 text-emerald-400" />
                          <span>Status: Applied (Tracked in Pipeline)</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                          <span>Ready for Apply & Tracking</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 justify-end">
                      {/* Dismiss / Remove Button */}
                      <button
                        onClick={() => handleDismissJob(job)}
                        className="btn btn-secondary text-xs py-2 px-2.5 flex items-center justify-center gap-1 text-slate-400 hover:text-rose-300 border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/20 transition-colors"
                        title="Dismiss / Remove this opening from Radar without tracking"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-rose-400" />
                        <span className="hidden sm:inline">Dismiss</span>
                      </button>

                      {/* Mark as Done (Applied) Button */}
                      <button
                        onClick={() => handleMarkDone(job, 'Applied')}
                        className="btn btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-emerald-300 border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/50 hover:text-white font-semibold shadow-sm transition-all"
                        title="Mark this job as Done / Applied and move to Application Tracker"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Mark as Done (Applied)</span>
                      </button>

                      {/* Form Filler Copilot Button */}
                      <button
                        onClick={() => onOpenFormFiller && onOpenFormFiller(job)}
                        className="btn btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-cyan-300 hover:text-white border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20"
                        title="Open 1-Click Form Filler Copilot with tailored answers & resume match"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>Form Filler</span>
                      </button>

                      {/* Primary Direct Apply Button */}
                      <button
                        onClick={() => handleDirectApplyClick(job)}
                        className="btn btn-primary text-xs py-2 px-3.5 sm:px-4 flex items-center justify-center gap-1.5 font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
                        title="Open direct job application form and track as Applied"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>Apply & Track ↗</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
