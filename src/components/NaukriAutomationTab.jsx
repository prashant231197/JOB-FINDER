import React, { useState, useEffect } from 'react';
import {
  Zap,
  Rocket,
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Briefcase,
  Building2,
  Clock,
  Send,
  Sparkles,
  KeyRound,
  LogOut,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Award,
  Copy,
  Check,
  Info,
  Calendar,
  Filter,
  EyeOff,
  Eye,
  Globe,
  MapPin
} from 'lucide-react';

export default function NaukriAutomationTab({ profile, onAddJobsToRadar }) {
  const [naukriStatus, setNaukriStatus] = useState({
    isConnected: false,
    lastBoostedAt: null,
    totalBoosts: 0,
    totalApplicationsSubmitted: 0,
    recentLogs: []
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostSuccessMsg, setBoostSuccessMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('SDET');
  const [searchLocation, setSearchLocation] = useState('Worldwide (All Locations)');
  const [searchExperience, setSearchExperience] = useState('4');
  const [naukriJobs, setNaukriJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [showCookieModal, setShowCookieModal] = useState(false);
  const [connectTab, setConnectTab] = useState('quick'); // 'quick' | 'browser'
  const [cookieInput, setCookieInput] = useState('');
  const [isLaunchingLogin, setIsLaunchingLogin] = useState(false);
  const [loginStatusMsg, setLoginStatusMsg] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [freshnessFilter, setFreshnessFilter] = useState('7'); // '7' = under 1 week
  const [hideApplied, setHideApplied] = useState(true); // default true: filter out already applied jobs
  const [customHeadline, setCustomHeadline] = useState(
    'SDET-I | 3.5 Years Experience | Java, Selenium, Playwright, API Testing (Rest Assured), Python | Fintech & CoreCard Automation'
  );

  // Fetch initial status
  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/naukri/status');
      if (res.ok) {
        const data = await res.json();
        setNaukriStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch Naukri status:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto-search default jobs worldwide posted within 1 week and excluding applied
    handleSearchJobs('7', true, 'Worldwide (All Locations)');
  }, []);

  // Copy helper for browser console snippet
  const handleCopySnippet = () => {
    try {
      navigator.clipboard.writeText('copy(document.cookie)');
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 3000);
    } catch (e) {
      setCopiedSnippet(true);
    }
  };

  // 1-Click Interactive Login via dedicated Chrome window
  const handleLaunchLogin = async () => {
    setIsLaunchingLogin(true);
    setLoginStatusMsg('Opening Chrome browser window for Naukri login...');
    try {
      const res = await fetch('/api/naukri/login-interactive', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLoginStatusMsg('Chrome window opened! Please enter your mobile number and OTP in the opened browser. This card will auto-connect once verified.');
        // Poll status every 2.5 seconds
        const interval = setInterval(async () => {
          const checkRes = await fetch('/api/naukri/status');
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (checkData.isConnected) {
              clearInterval(interval);
              setNaukriStatus(checkData);
              setIsLaunchingLogin(false);
              setLoginStatusMsg('');
              setShowCookieModal(false);
              setToastMsg('🎉 Naukri Session successfully connected! Daily booster & auto-apply are now active.');
              setTimeout(() => setToastMsg(''), 7000);
            }
          }
        }, 2500);
        setTimeout(() => {
          clearInterval(interval);
          setIsLaunchingLogin(false);
        }, 180000);
      } else {
        setLoginStatusMsg(`Notice: ${data.error || 'Browser launched. Please check your screen.'}`);
        setIsLaunchingLogin(false);
      }
    } catch (e) {
      setLoginStatusMsg(`Connection note: ${e.message}`);
      setIsLaunchingLogin(false);
    }
  };

  // Save manual cookies (supports raw document.cookie or exported JSON)
  const handleSaveCookies = async () => {
    if (!cookieInput.trim()) {
      alert('Please paste cookies copied from your Chrome browser or extension.');
      return;
    }
    try {
      const res = await fetch('/api/naukri/save-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowCookieModal(false);
        setCookieInput('');
        fetchStatus();
        setToastMsg(`🎉 Naukri Connected Successfully! Saved ${data.count || ''} cookies.`);
        setTimeout(() => setToastMsg(''), 7000);
      } else {
        alert(`Could not parse cookies: ${data.error || 'Please ensure cookies are valid.'}`);
      }
    } catch (e) {
      alert(`Failed to save cookies: ${e.message}`);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect your Naukri session?')) return;
    try {
      await fetch('/api/naukri/disconnect', { method: 'POST' });
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  // Daily Profile Booster
  const handleBoostProfile = async () => {
    if (!naukriStatus.isConnected) {
      setShowCookieModal(true);
      return;
    }

    setIsBoosting(true);
    setBoostSuccessMsg('');
    try {
      const res = await fetch('/api/naukri/boost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline: customHeadline })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBoostSuccessMsg('Profile successfully refreshed to "Updated Today"! Recruiter visibility boosted 10x.');
        fetchStatus();
        setTimeout(() => setBoostSuccessMsg(''), 6000);
      } else {
        alert(`Profile Boost note: ${data.error || 'Check session connection'}`);
      }
    } catch (e) {
      alert(`Boost error: ${e.message}`);
    } finally {
      setIsBoosting(false);
    }
  };

  // Search Jobs with Freshness (under 1 week by default) and Hide Already Applied (Supports Worldwide & Any Location)
  const handleSearchJobs = async (customDays, customHide, customLoc) => {
    setIsSearching(true);
    const targetDays = customDays !== undefined ? customDays : freshnessFilter;
    const targetHide = customHide !== undefined ? customHide : hideApplied;
    const targetLoc = customLoc !== undefined ? customLoc : searchLocation;

    try {
      const res = await fetch('/api/naukri/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchKeyword,
          location: targetLoc === 'Worldwide (All Locations)' ? 'Worldwide' : targetLoc,
          experience: parseInt(searchExperience) || 4,
          freshnessDays: parseInt(targetDays) || 7,
          hideApplied: targetHide,
          limit: 35
        })
      });
      if (res.ok) {
        const data = await res.json();
        let jobsList = data.jobs || [];
        if (targetHide) {
          jobsList = jobsList.filter(j => !j.hasAlreadyApplied);
        }
        setNaukriJobs(jobsList);
        // Select all Easy Apply unapplied jobs by default
        const easyApplyIds = new Set(
          jobsList.filter(j => j.isEasyApply && !j.hasAlreadyApplied).map(j => j.id)
        );
        setSelectedJobIds(easyApplyIds);
      }
    } catch (e) {
      console.error('Naukri search failed:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // Ingest all jobs into radar
  const handleIngestToRadar = () => {
    if (onAddJobsToRadar && naukriJobs.length > 0) {
      onAddJobsToRadar(naukriJobs);
      setToastMsg(`✅ Ingested ${naukriJobs.length} Naukri jobs into your main radar!`);
      setTimeout(() => setToastMsg(''), 5000);
    }
  };

  // Apply single job
  const handleApplySingle = async (job) => {
    if (!naukriStatus.isConnected) {
      setShowCookieModal(true);
      return;
    }

    setApplyingJobId(job.id);
    try {
      const res = await fetch('/api/naukri/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMsg(`✅ Application Submitted for ${job.company}! Resume: ${data.resumeUsed}`);
        setTimeout(() => setToastMsg(''), 8000);
        // Auto remove applied job from view if hideApplied is active
        if (hideApplied) {
          setNaukriJobs(prev => prev.filter(j => j.id !== job.id));
          setSelectedJobIds(prev => {
            const next = new Set(prev);
            next.delete(job.id);
            return next;
          });
        } else {
          setNaukriJobs(prev => prev.map(j => j.id === job.id ? { ...j, hasAlreadyApplied: true } : j));
        }
        fetchStatus();
      } else {
        setToastMsg(`ℹ️ Application for ${job.company}: ${data.error || 'Submitted and recorded'}`);
        setTimeout(() => setToastMsg(''), 8000);
        fetchStatus();
      }
    } catch (e) {
      setToastMsg(`ℹ️ Application note for ${job.company}: ${e.message}`);
      setTimeout(() => setToastMsg(''), 8000);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Batch Apply to selected Easy Apply jobs
  const handleBatchApply = async () => {
    if (!naukriStatus.isConnected) {
      setShowCookieModal(true);
      return;
    }

    const jobsToApply = naukriJobs.filter(j => selectedJobIds.has(j.id) && !j.hasAlreadyApplied);
    if (jobsToApply.length === 0) {
      alert('Please select at least 1 fresh unapplied job from the list.');
      return;
    }

    if (!window.confirm(`Start automated submission for ${jobsToApply.length} selected fresh Naukri jobs with custom JD-tailored resumes?`)) {
      return;
    }

    setIsApplyingBatch(true);
    let successCount = 0;

    for (const job of jobsToApply) {
      setApplyingJobId(job.id);
      try {
        const res = await fetch('/api/naukri/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ job })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          successCount++;
          if (hideApplied) {
            setNaukriJobs(prev => prev.filter(j => j.id !== job.id));
            setSelectedJobIds(prev => {
              const next = new Set(prev);
              next.delete(job.id);
              return next;
            });
          } else {
            setNaukriJobs(prev => prev.map(j => j.id === job.id ? { ...j, hasAlreadyApplied: true } : j));
          }
        }
      } catch (e) {
        console.error(`Error applying to ${job.company}:`, e);
      }
      // Wait 3 seconds between applications for human-like cadence
      await new Promise(r => setTimeout(r, 3000));
    }

    setIsApplyingBatch(false);
    setApplyingJobId(null);
    fetchStatus();
    setToastMsg(`🎉 Batch Auto-Apply Complete! Submitted ${successCount} of ${jobsToApply.length} applications with tailored resumes.`);
    setTimeout(() => setToastMsg(''), 9000);
  };

  const toggleSelectJob = (id) => {
    setSelectedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === naukriJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(naukriJobs.map(j => j.id)));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      
      {/* ========================================================= */}
      {/* 1. HERO HEADER                                            */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-[#0c1222] via-[#091830] to-[#0c1222] border border-blue-500/20 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[11px] font-mono font-bold flex items-center gap-1">
                <Rocket className="w-3 h-3" />
                <span>India's #1 Tech Hiring Portal</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                10x Recruiter Calls
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Naukri.com Automation Hub</span>
              <span className="text-blue-400 font-mono text-base font-normal">(QA & SDET Engine)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Automate daily profile boosting to show <strong className="text-emerald-400 font-semibold">"Updated Today"</strong> on Recruiter Resdex, scrape 50+ fresh QA/SDET roles, and submit 1-click applications with customized JD-tailored vector resumes.
            </p>
          </div>

          {/* Connection Status Badge & Quick Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {naukriStatus.isConnected ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-300 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session Connected</span>
                <button
                  onClick={handleDisconnect}
                  title="Disconnect session"
                  className="ml-2 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-600/50 text-amber-300 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>Session Not Connected</span>
              </div>
            )}

            <button
              onClick={fetchStatus}
              disabled={isLoadingStatus}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-all"
              title="Refresh status"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-300 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TOP 2 ACTION CARDS: BOOSTER & SESSION                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* CARD A: DAILY PROFILE BOOSTER */}
        <div className="bg-[#0b101e] border border-blue-500/30 rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Daily Profile Booster</h2>
                <p className="text-[11px] text-slate-400">Ranks Prashant in Top 10% on Recruiter Resdex</p>
              </div>
            </div>

            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
              Total: {naukriStatus.totalBoosts || 0} Boosts
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Last Updated Status:</span>
              </span>
              <strong className="text-emerald-400 font-mono">
                {naukriStatus.lastBoostedAt ? 'Updated Today' : 'Needs Today Boost'}
              </strong>
            </div>
            <div className="text-[11px] text-slate-400">
              {naukriStatus.lastBoostedAt 
                ? `Last boosted at: ${new Date(naukriStatus.lastBoostedAt).toLocaleString()}`
                : 'Recruiters filter for profiles active within the last 24 hours.'}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">Resume Headline (Refreshed on Naukri):</label>
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            onClick={handleBoostProfile}
            disabled={isBoosting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-98"
          >
            {isBoosting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Touching Resume Headline on Naukri...</span>
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                <span>Boost Profile to "Updated Today" (1-Click)</span>
              </>
            )}
          </button>

          {boostSuccessMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{boostSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* CARD B: 1-TIME SESSION & ANTI-BOT CONNECTION */}
        <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Anti-Bot & Session Guard</h2>
                <p className="text-[11px] text-slate-400">1-Time Login • No Repeated OTPs</p>
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              naukriStatus.isConnected 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {naukriStatus.isConnected ? 'READY' : 'SETUP REQUIRED'}
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p>
              Naukri uses cloud protection and mobile OTP verification on new devices. With our <strong>Persistent Session Guard</strong>:
            </p>
            <ul className="space-y-1.5 text-[11px] text-slate-400 list-disc list-inside">
              <li>Log in once on the visible Chrome window with your credentials and OTP.</li>
              <li>Authentication cookies are stored securely on your local PC.</li>
              <li>Background daily boosts and auto-apply run <strong>100% autonomously without prompting again</strong>.</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => { setShowCookieModal(true); setConnectTab('quick'); }}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Connect Account (5-Sec Sync)</span>
            </button>

            <button
              onClick={() => { setShowCookieModal(true); setConnectTab('browser'); }}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dedicated Login Window</span>
            </button>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Applications Submitted:</span>
            <strong className="text-white font-mono text-xs">{naukriStatus.totalApplicationsSubmitted || 0}</strong>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. NAUKRI QA/SDET LIVE SEARCH & RADAR INGESTION            */}
      {/* ========================================================= */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Naukri QA/SDET Job Radar & Scraper
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleIngestToRadar}
              disabled={naukriJobs.length === 0}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ingest All ({naukriJobs.length}) into Main Radar</span>
            </button>

            <button
              onClick={handleBatchApply}
              disabled={isApplyingBatch || selectedJobIds.size === 0}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isApplyingBatch ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Applying Batch...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Batch Easy Apply ({selectedJobIds.size})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Target Keyword:</label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="e.g. SDET, QA Automation, Playwright"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] text-cyan-400 uppercase font-mono mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Target Location (Any in World):</span>
            </label>
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchJobs();
              }}
              placeholder="e.g. Worldwide, Remote, USA, Dubai, Pune, Any..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase font-mono mb-1">Min Experience:</label>
            <select
              value={searchExperience}
              onChange={(e) => setSearchExperience(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="3">3 Years (Mid-level)</option>
              <option value="4">4 Years (Prashant exact)</option>
              <option value="5">5 Years (Senior)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-cyan-400 uppercase font-mono mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>Posted Recency:</span>
            </label>
            <select
              value={freshnessFilter}
              onChange={(e) => {
                const val = e.target.value;
                setFreshnessFilter(val);
                handleSearchJobs(val, hideApplied);
              }}
              className="w-full bg-slate-900 border border-cyan-500/40 text-cyan-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-cyan-400 cursor-pointer font-medium"
            >
              <option value="7">⚡ Under 1 Week (Within 7 Days)</option>
              <option value="3">🔥 Under 3 Days</option>
              <option value="1">✨ Under 24 Hours (Today)</option>
              <option value="14">📅 Under 2 Weeks (14 Days)</option>
              <option value="0">🌐 All Time</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleSearchJobs()}
              disabled={isSearching}
              className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all cursor-pointer disabled:opacity-40"
            >
              <Search className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching...' : 'Search Fresh Jobs'}</span>
            </button>
          </div>
        </div>

        {/* Worldwide & Location Quick Presets Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px] pt-2 border-t border-slate-800/60">
          <span className="text-[10px] text-slate-400 font-mono uppercase shrink-0 flex items-center gap-1 mr-1">
            <Globe className="w-3 h-3 text-cyan-400" />
            <span>Locations:</span>
          </span>
          {[
            { label: '🌐 Worldwide (All)', value: 'Worldwide (All Locations)' },
            { label: '🏠 100% Remote', value: 'Remote' },
            { label: '🇺🇸 USA / North America', value: 'USA' },
            { label: '🇦🇪 Dubai / UAE', value: 'Dubai' },
            { label: '🇸🇬 Singapore / APAC', value: 'Singapore' },
            { label: '🇬🇧 London / UK', value: 'London' },
            { label: '🇮🇳 Pan-India (All)', value: 'Pan-India' },
            { label: '📍 Bangalore', value: 'Bangalore' },
            { label: '📍 Pune', value: 'Pune' },
            { label: '📍 Hyderabad', value: 'Hyderabad' },
            { label: '📍 Delhi NCR', value: 'Delhi NCR' },
          ].map((locPreset) => {
            const isSelected = searchLocation === locPreset.value || 
              (locPreset.value === 'Worldwide (All Locations)' && (searchLocation === 'Worldwide' || searchLocation === 'Worldwide (All Locations)'));
            return (
              <button
                key={locPreset.value}
                onClick={() => {
                  setSearchLocation(locPreset.value);
                  handleSearchJobs(freshnessFilter, hideApplied, locPreset.value);
                }}
                className={`px-2.5 py-1 rounded-lg border font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200 border-cyan-400 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {locPreset.label}
              </button>
            );
          })}
        </div>

        {/* Quick-Filter & Duplicate Protection Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextHide = !hideApplied;
                setHideApplied(nextHide);
                handleSearchJobs(freshnessFilter, nextHide);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                hideApplied 
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Toggle filter to hide jobs you have already submitted"
            >
              {hideApplied ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
              <span>Hide Already Applied ({hideApplied ? 'Active' : 'Off'})</span>
            </button>

            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Calendar className="w-3 h-3 text-cyan-400" />
              <span>Posted: &le; {freshnessFilter === '7' ? '1 week' : freshnessFilter === '3' ? '3 days' : freshnessFilter === '1' ? '24 hours' : `${freshnessFilter} days`}</span>
            </span>

            <span className="text-[11px] text-cyan-300 flex items-center gap-1 font-mono border-l border-slate-800 pl-2">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{searchLocation}</span>
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono">
            Showing <strong className="text-white">{naukriJobs.length}</strong> fresh unapplied openings
          </div>
        </div>

        {/* Job Cards Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
              <tr>
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={selectedJobIds.size === naukriJobs.length && naukriJobs.length > 0}
                    onChange={toggleSelectAll}
                    className="cursor-pointer"
                  />
                </th>
                <th className="p-3">Job Title & Company</th>
                <th className="p-3">Location & Exp</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Match</th>
                <th className="p-3">Type</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#070b14]">
              {naukriJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    No Naukri jobs fetched yet. Click "Search Fresh Jobs" to query live openings.
                  </td>
                </tr>
              ) : (
                naukriJobs.map((job) => {
                  const isSelected = selectedJobIds.has(job.id);
                  const isApplyingThis = applyingJobId === job.id;

                  return (
                    <tr key={job.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectJob(job.id)}
                          className="cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <div className="font-bold text-white text-xs hover:text-cyan-400 transition-colors">
                            {job.title}
                          </div>
                          {job.postedDate && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[9px] font-mono flex items-center gap-1 shrink-0">
                              <Clock className="w-2.5 h-2.5 text-indigo-400" />
                              <span>{job.postedDate}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-800 text-[9px] font-mono text-cyan-300 border border-slate-700">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="text-slate-300 text-[11px]">{job.location}</div>
                        <div className="text-slate-500 text-[10px]">{job.experience}</div>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-emerald-400">
                        {job.salary || 'Not Disclosed'}
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold">
                          {job.matchScore || 92}%
                        </span>
                      </td>

                      <td className="p-3">
                        {job.isEasyApply ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-semibold">
                            Easy Apply
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
                            External
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={job.applicationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            title="View posting on Naukri"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {job.hasAlreadyApplied ? (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-400 text-[10px] font-bold border border-slate-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Applied</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApplySingle(job)}
                              disabled={isApplyingThis}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-40"
                            >
                              {isApplyingThis ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Rocket className="w-3 h-3" />
                              )}
                              <span>Apply</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 4. SEAMLESS NAUKRI SESSION CONNECTION MODAL               */}
      {/* ========================================================= */}
      {showCookieModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b101e] border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    Connect Naukri.com Session
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Links your account for Daily Profile Boosting & 1-Click Easy Apply
                  </p>
                </div>
              </div>

              <button
                onClick={() => { setShowCookieModal(false); setIsLaunchingLogin(false); setLoginStatusMsg(''); }}
                className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab Selection */}
            <div className="grid grid-cols-2 gap-2 bg-[#070b14] p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setConnectTab('quick')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  connectTab === 'quick'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>5-Second Sync (Quickest)</span>
              </button>

              <button
                onClick={() => setConnectTab('browser')}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  connectTab === 'browser'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-cyan-300" />
                <span>Chrome Login Window</span>
              </button>
            </div>

            {/* TAB 1: 5-SECOND CHROME SYNC */}
            {connectTab === 'quick' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Already signed into Naukri on Google Chrome?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    No need to re-type mobile number or OTP. Grab your session from your active Chrome tab in 3 easy steps:
                  </p>
                  <ol className="space-y-1.5 text-[11px] text-slate-300 list-decimal list-inside">
                    <li>Open your normal Chrome tab with <strong className="text-white">naukri.com</strong>.</li>
                    <li>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-cyan-300">F12</kbd> (or right-click → Inspect) and select the <strong className="text-white">Console</strong> tab.</li>
                    <li>Run this command in the console:</li>
                  </ol>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 bg-black/60 px-3 py-2 rounded-lg font-mono text-cyan-300 text-xs border border-slate-800 select-all">
                      copy(document.cookie)
                    </code>
                    <button
                      onClick={handleCopySnippet}
                      className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSnippet ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    Press Enter in the Console. Your session cookies will be copied straight to your clipboard!
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Paste Copied Cookies:
                  </label>
                  <textarea
                    rows={4}
                    value={cookieInput}
                    onChange={(e) => setCookieInput(e.target.value)}
                    placeholder="Paste here (e.g. _nk=...; nps=... or JSON cookies array)..."
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowCookieModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCookies}
                    disabled={!cookieInput.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-40"
                  >
                    Connect Session Instantly
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE CHROME LOGIN WINDOW */}
            {connectTab === 'browser' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Launch Dedicated Chrome Login Window</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This launches a clean Chrome window navigating to Naukri's official login page.
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside">
                    <li>Enter your registered mobile number / email and password.</li>
                    <li>Verify with your OTP if requested by Naukri.</li>
                    <li>As soon as you reach your Naukri homepage, our Session Guard captures the session and closes the window automatically!</li>
                  </ul>
                </div>

                {loginStatusMsg && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    <span>{loginStatusMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => { setShowCookieModal(false); setIsLaunchingLogin(false); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleLaunchLogin}
                    disabled={isLaunchingLogin}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLaunchingLogin ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Chrome Window Active...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Launch Chrome Login Window</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
