import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  Check, 
  Copy, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Briefcase, 
  RefreshCw, 
  ArrowRight,
  TrendingUp,
  Award,
  CheckCheck,
  Target,
  Clock,
  Flame,
  ShieldCheck,
  CheckSquare,
  Square,
  KeyRound,
  Users,
  Terminal,
  Eye,
  EyeOff,
  X,
  Send,
  Play,
  Settings,
  Lock
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', name: 'All 34+ Specialized Platforms', shortName: 'All 34+', icon: Globe, count: '34 Hubs', color: '#0284c7' },
  { id: 'indian', name: 'Major Indian Portals', shortName: 'Indian (9)', icon: Building2, count: '9 Portals', color: '#2563eb' },
  { id: 'tech_startup', name: 'Tech & Startups', shortName: 'Startups (10)', icon: Sparkles, count: '10 Platforms', color: '#7c3aed' },
  { id: 'remote', name: 'Global & India Remote', shortName: 'Remote (7)', icon: Zap, count: '7 Hubs', color: '#059669' },
  { id: 'staffing', name: 'Staffing & Recruitment', shortName: 'Staffing (8)', icon: Users, count: '8 Agencies', color: '#d97706' }
];

const FRESHNESS_OPTIONS = [
  { value: 'under-3h', label: '🔥 Last 3 Hours (< 3h)', badge: 'Live Fresh' },
  { value: 'under-6h', label: '⚡ Last 6 Hours (< 6h)', badge: 'Ultra Fresh' },
  { value: 'under-12h', label: '🕒 Last 12 Hours (< 12h)', badge: 'Half Day' },
  { value: 'under-24h', label: '📅 Today (< 24 Hours)', badge: '1 Day' },
  { value: 'under-2d', label: '🗓️ Last 2 Days (< 48h)', badge: '2 Days' },
  { value: 'under-3d', label: '⏳ Last 3 Days (< 72h)', badge: '3 Days' },
  { value: 'past-week', label: '🗓️ Past Week (< 7 Days)', badge: '1 Week' },
  { value: 'anytime', label: '🌐 Anytime / All Openings', badge: 'All' }
];

export default function GlobalPlatformsTab({ onAddJobsToRadar }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePlatform, setActivePlatform] = useState('all');
  const [query, setQuery] = useState('SDET');
  const [location, setLocation] = useState('India / Worldwide');
  const [datePosted, setDatePosted] = useState('past-week');
  
  const [jobs, setJobs] = useState([]);
  const [platformsList, setPlatformsList] = useState([]);
  const [dailyStats, setDailyStats] = useState({
    dailyGoal: 500,
    appliedToday: 0,
    remainingToday: 500,
    progressPercentage: 0,
    daysRemaining: 20,
    currentDay: 1,
    totalTarget: 10000
  });

  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [isBatchApplying, setIsBatchApplying] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [hideApplied, setHideApplied] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [automationLogs, setAutomationLogs] = useState([]);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState({});
  const [toastMsg, setToastMsg] = useState('');

  const terminalEndRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 5000);
  };

  // Load platforms, daily target, and credentials on mount
  useEffect(() => {
    fetch('/api/platforms/list')
      .then(res => res.json())
      .then(data => setPlatformsList(data))
      .catch(() => {});

    fetch('/api/platforms/daily-target')
      .then(res => res.json())
      .then(data => setDailyStats(data))
      .catch(() => {});

    fetch('/api/platforms/credentials')
      .then(res => res.json())
      .then(data => setCredentials(data))
      .catch(() => {});

    fetchLogs();
  }, []);

  // Poll automation logs periodically
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/platforms/automation-logs');
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setAutomationLogs(data.logs);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (showTerminal && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [automationLogs, showTerminal]);

  const handleSearch = async (platformOverride, categoryOverride) => {
    const targetPlatform = platformOverride !== undefined ? platformOverride : activePlatform;
    const targetCategory = categoryOverride !== undefined ? categoryOverride : activeCategory;
    setLoading(true);
    try {
      const res = await fetch('/api/platforms/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: targetPlatform,
          category: targetCategory,
          query,
          location,
          datePosted,
          limit: 150
        })
      });
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
        if (data.dailyStats) setDailyStats(data.dailyStats);
        showToast(`✓ Scraped & verified ${data.jobs.length} fresh positions!`);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error('Error searching platforms:', err);
      showToast(`Search error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(activePlatform, activeCategory);
  }, [activeCategory, activePlatform, datePosted]);

  const copyToClipboard = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selection handlers
  const toggleSelectJob = (id) => {
    setSelectedJobIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    const visibleJobs = displayJobs;
    if (selectedJobIds.size === visibleJobs.length && visibleJobs.length > 0) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(visibleJobs.map(j => j.id)));
    }
  };

  // 1-Click Platform Auto-Apply (Single Job)
  const handleApplySingle = async (job) => {
    // Immediately open the exact direct job post application page in a new window so user never has to search
    if (job.applicationUrl && job.applicationUrl.startsWith('http')) {
      window.open(job.applicationUrl, '_blank', 'noopener,noreferrer');
    }

    setApplyingJobId(job.id);
    try {
      const res = await fetch('/api/platforms/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedIds(prev => new Set([...prev, job.id]));
        if (hideApplied) {
          setJobs(prev => prev.filter(j => j.id !== job.id));
          setSelectedJobIds(prev => {
            const next = new Set(prev);
            next.delete(job.id);
            return next;
          });
        }
        if (data.dailyStats) setDailyStats(data.dailyStats);
        showToast(`🎉 Applied & Opened ${job.company}! Resume: ${data.resumeUsed}`);
        fetchLogs();
      } else {
        showToast(`Submission note: ${data.error || 'Check details'}`);
      }
    } catch (err) {
      showToast(`Error applying: ${err.message}`);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Batch Auto-Apply (Multiple Selected Jobs)
  const handleBatchApply = async () => {
    const jobsToApply = jobs.filter(j => selectedJobIds.has(j.id) && !appliedIds.has(j.id));
    if (jobsToApply.length === 0) {
      showToast('⚠️ Please select at least 1 fresh unapplied job.');
      return;
    }

    if (!window.confirm(`Start automated submissions for ${jobsToApply.length} selected positions with custom JD-tailored ATS resumes?`)) {
      return;
    }

    setIsBatchApplying(true);
    setShowTerminal(true);

    try {
      const res = await fetch('/api/platforms/apply-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: jobsToApply })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const submittedIds = new Set(jobsToApply.map(j => j.id));
        setAppliedIds(prev => new Set([...prev, ...submittedIds]));
        if (hideApplied) {
          setJobs(prev => prev.filter(j => !submittedIds.has(j.id)));
          setSelectedJobIds(new Set());
        }
        if (data.dailyStats) setDailyStats(data.dailyStats);
        showToast(`🎉 Batch Auto-Apply Complete! Submitted ${data.successCount} of ${jobsToApply.length} applications.`);
        fetchLogs();
      } else {
        showToast(`Batch note: ${data.error || 'Completed with notes'}`);
      }
    } catch (err) {
      showToast(`Batch error: ${err.message}`);
    } finally {
      setIsBatchApplying(false);
    }
  };

  // Clear Terminal Logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/platforms/clear-logs', { method: 'POST' });
      setAutomationLogs([]);
    } catch (e) {}
  };

  // Batch Add All to Radar
  const handleAddAllToRadar = async () => {
    if (jobs.length === 0) return;
    try {
      const payloads = jobs.map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        experienceRequired: job.experienceRequired || '3-6 Years',
        skills: job.skills || ['QA Automation', 'SDET'],
        salary: job.salary || 'Competitive',
        applicationUrl: job.applicationUrl,
        portal: job.platformName || 'Multi-Platform Hub',
        postedTime: job.postedTime || 'Fresh',
        description: job.description || ''
      }));

      if (onAddJobsToRadar) {
        onAddJobsToRadar(payloads);
      } else {
        await fetch('/api/jobs/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobs: payloads })
        });
      }

      const allIds = new Set(jobs.map(j => j.id));
      setAddedIds(allIds);
      showToast(`🎉 Added all ${jobs.length} jobs to Jobs Radar!`);
    } catch (err) {
      showToast(`Error adding jobs: ${err.message}`);
    }
  };

  // 1-Click Push Single to Radar
  const handleAddToRadar = async (job) => {
    try {
      const payload = {
        title: job.title,
        company: job.company,
        location: job.location,
        experienceRequired: job.experienceRequired || '3-6 Years',
        skills: job.skills || ['QA Automation', 'SDET'],
        salary: job.salary || 'Competitive',
        applicationUrl: job.applicationUrl,
        portal: job.platformName || 'Multi-Platform Hub',
        postedTime: job.postedTime || 'Fresh',
        description: job.description || ''
      };

      if (onAddJobsToRadar) {
        onAddJobsToRadar([payload]);
      } else {
        await fetch('/api/jobs/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobs: [payload] })
        });
      }

      setAddedIds(prev => new Set([...prev, job.id]));
      showToast(`✓ "${job.title}" at ${job.company} added to Jobs Radar!`);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Filter visible jobs based on hideApplied toggle
  const displayJobs = hideApplied 
    ? jobs.filter(j => !appliedIds.has(j.id))
    : jobs;

  // Filter sub-platforms based on current category
  const filteredSubPlatforms = activeCategory === 'all'
    ? platformsList
    : platformsList.filter(p => p.category === activeCategory);

  const currentCategoryConfig = CATEGORIES.find(c => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-20">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-sky-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071322] via-[#0d223f] to-[#0a192f] border border-sky-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-bold tracking-wide uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>34+ Global, Indian, Startup & Remote Portals • Multi-Bot Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Multi-Platform Auto-Apply Bot Hub</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 font-mono font-semibold">
                Autonomous Bot
              </span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Autonomous application engine across <strong className="text-white">Wellfound, Indeed, Otta, WWR, Instahyre, Cutshort, Glassdoor, Turing, Randstad</strong> & 25+ more specialized portals. (Naukri & LinkedIn operate in their dedicated standalone tabs).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCredentialsModal(true)}
              className="btn btn-secondary text-xs font-bold px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Accounts & Sessions</span>
            </button>
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className={`btn text-xs font-bold px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl transition-all ${
                showTerminal 
                  ? 'bg-sky-500/20 border border-sky-400 text-sky-300' 
                  : 'btn-secondary text-slate-300'
              }`}
            >
              <Terminal className="w-4 h-4 text-sky-400" />
              <span>Live Console ({automationLogs.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 500 Daily Applications Target Mission Station */}
      <div className="bg-gradient-to-r from-[#0d1b2a] via-[#102a43] to-[#0f172a] border border-sky-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">500 Daily Applications Target Station</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  Day {dailyStats.currentDay} of 20
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Goal: Apply to 500+ jobs daily across Indian, Remote & Startup portals to secure top offers within 20 days.
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-2 text-center">
              <div className="text-lg font-black text-emerald-400 font-mono">{dailyStats.appliedToday}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Applied Today</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-2 text-center">
              <div className="text-lg font-black text-amber-400 font-mono">{dailyStats.remainingToday}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining</div>
            </div>
            <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl px-4 py-2 text-center">
              <div className="text-lg font-black text-sky-400 font-mono">{dailyStats.daysRemaining}</div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Days Left</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-semibold">
            <span>Daily Goal Progress: {dailyStats.appliedToday} / {dailyStats.dailyGoal} ({dailyStats.progressPercentage}%)</span>
            <span>Overall Mission: 10,000 Target Applications</span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-sky-400 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, dailyStats.progressPercentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Connected Authentication Badges */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            Configured Accounts:
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
            ✓ Otta (Logged In)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
            ✓ WWR (Logged In)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
            ✓ Wellfound (Logged In)
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono">
            ✓ Indeed (Chrome Session)
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-950/60 border border-sky-500/30 text-sky-300 font-mono">
            ✓ Glassdoor (Indeed Connected)
          </span>
        </div>
      </div>

      {/* 4 Main Sector Category Tabs */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-2.5 shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActivePlatform('all');
                }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                style={isActive ? { borderLeftColor: cat.color, borderLeftWidth: '3px' } : {}}
              >
                <Icon className="w-4 h-4" style={{ color: cat.color }} />
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-slate-900 text-sky-300' : 'bg-slate-800/80 text-slate-500'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Platform Quick Badges */}
      {filteredSubPlatforms.length > 0 && (
        <div className="bg-[#0a0f1d] border border-slate-800/60 rounded-2xl p-3 shadow-md">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setActivePlatform('all')}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activePlatform === 'all'
                  ? 'bg-sky-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All in {currentCategoryConfig.shortName}
            </button>
            {filteredSubPlatforms.map(p => {
              const isSelected = activePlatform === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-slate-800 text-white border border-slate-600 shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800/80'
                  }`}
                  style={isSelected ? { borderLeftColor: p.color, borderLeftWidth: '2.5px' } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span>{p.name}</span>
                  {p.badge && (
                    <span className="text-[9px] px-1 rounded bg-slate-900 text-slate-500 font-mono">
                      {p.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Granular Freshness & Search Controls */}
      <div className="bg-[#0e1726] border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentCategoryConfig.color }}></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">{currentCategoryConfig.name}</span>
            <span className="text-xs text-slate-400 hidden sm:inline">— {currentCategoryConfig.desc}</span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {loading ? 'Scanning live feeds...' : `${displayJobs.length} verified jobs ready`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Query */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Keywords / Title</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="input-field text-xs pl-9 py-2 bg-slate-900 border-slate-700 text-white w-full rounded-xl"
                placeholder="SDET, QA Automation, Lead..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Location / Target</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                className="input-field text-xs pl-9 py-2 bg-slate-900 border-slate-700 text-white w-full rounded-xl"
                placeholder="India, Remote, Bengaluru, Worldwide..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Granular Freshness Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center justify-between">
              <span>Freshness Filter</span>
              <span className="text-[10px] text-amber-400 font-mono">Sub-hour precision</span>
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                className="input-field text-xs pl-9 py-2 bg-slate-900 border-slate-700 text-white w-full rounded-xl font-medium"
                value={datePosted}
                onChange={(e) => setDatePosted(e.target.value)}
              >
                {FRESHNESS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleSearch(activePlatform, activeCategory)}
              disabled={loading}
              className="w-full btn btn-primary text-xs font-bold py-2.5 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Scanning 34+ Portals...' : 'Scrape & Fetch Fresh Jobs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Automation Control Toolbar */}
      <div className="bg-[#091122] border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Select All & Batch Apply */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition-colors"
          >
            {selectedJobIds.size === displayJobs.length && displayJobs.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-sky-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>Select All ({selectedJobIds.size} / {displayJobs.length})</span>
          </button>

          {/* Batch Auto Apply Button */}
          <button
            onClick={handleBatchApply}
            disabled={selectedJobIds.size === 0 || isBatchApplying}
            className={`btn text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all ${
              selectedJobIds.size > 0 && !isBatchApplying
                ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Zap className={`w-4 h-4 ${isBatchApplying ? 'animate-spin text-amber-400' : 'text-amber-300'}`} />
            <span>
              {isBatchApplying 
                ? 'Submitting Applications...' 
                : `⚡ Start Automated Submissions (${selectedJobIds.size} Selected)`}
            </span>
          </button>

          {/* Add All to Radar */}
          <button
            onClick={handleAddAllToRadar}
            disabled={jobs.length === 0}
            className="btn btn-secondary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
          >
            <PlusIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Add All {jobs.length} to Radar</span>
          </button>
        </div>

        {/* Right: Hide Applied & Terminal Switch */}
        <div className="flex items-center gap-3">
          {/* Hide Applied Toggle */}
          <button
            onClick={() => setHideApplied(!hideApplied)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
              hideApplied
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {hideApplied ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Hide Applied ({appliedIds.size})</span>
          </button>

          {/* Live Terminal Toggle */}
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${
              showTerminal
                ? 'bg-slate-800 border-sky-500/50 text-sky-300 shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>Terminal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1"></span>
          </button>
        </div>
      </div>

      {/* Live Automation Console / Drawer */}
      {showTerminal && (
        <div className="bg-[#060b14] border border-sky-500/40 rounded-2xl shadow-2xl p-4 space-y-3 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Multi-Platform Bot Execution Terminal
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono">
                Live Stream
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearLogs}
                className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              >
                Clear Console
              </button>
              <button
                onClick={() => setShowTerminal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-black/80 rounded-xl p-3 h-52 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 border border-slate-900">
            {automationLogs.length === 0 ? (
              <div className="text-slate-600 italic py-8 text-center">
                Terminal idle. Ready to process automated submissions...
              </div>
            ) : (
              automationLogs.map((log, idx) => {
                const colorClass = 
                  log.level === 'success' ? 'text-emerald-400' :
                  log.level === 'warning' ? 'text-amber-400' :
                  log.level === 'error' ? 'text-rose-400' : 'text-sky-300';
                return (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={colorClass}>{log.message}</span>
                  </div>
                );
              })
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="text-sm font-bold text-white">Scraping {currentCategoryConfig.name} for Real Jobs...</div>
            <div className="text-xs text-slate-400">Verifying apply URLs, calculating match scores, and filtering by {FRESHNESS_OPTIONS.find(f => f.value === datePosted)?.label}.</div>
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-12 text-center space-y-3">
            <Globe className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="text-base font-bold text-white">No unapplied jobs matched your current freshness filter</div>
            <div className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting the freshness filter to "Today" or "Past Week", or uncheck "Hide Applied" to see previous submissions.
            </div>
            <button
              onClick={() => { setHideApplied(false); setDatePosted('past-week'); handleSearch(activePlatform, activeCategory); }}
              className="btn btn-secondary text-xs px-4 py-2 mt-2"
            >
              Reset Filters & Show All
            </button>
          </div>
        ) : (
          displayJobs.map(job => {
            const isAdded = addedIds.has(job.id);
            const isApplied = appliedIds.has(job.id);
            const isSelected = selectedJobIds.has(job.id);
            const isCopied = copiedId === job.id;
            const isApplying = applyingJobId === job.id;

            return (
              <div 
                key={job.id} 
                className={`bg-[#0b101d] border rounded-2xl p-5 transition-all shadow-md hover:shadow-xl space-y-4 ${
                  isSelected 
                    ? 'border-sky-500/80 bg-[#0e1628]' 
                    : isApplied
                    ? 'border-emerald-500/30 opacity-80'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Job Selection Checkbox */}
                    <button
                      onClick={() => toggleSelectJob(job.id)}
                      className="mt-1 text-slate-400 hover:text-sky-300 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-sky-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider text-white"
                          style={{ backgroundColor: job.platformColor || '#0284c7' }}
                        >
                          {job.platformName}
                        </span>
                        {job.rating && (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
                            {job.rating}
                          </span>
                        )}
                        {job.isRemote && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                            Remote
                          </span>
                        )}
                        <span className="text-slate-400 text-[11px] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {job.postedTime}
                        </span>
                        {isApplied && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono">
                            ✓ Applied
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-white hover:text-sky-300 transition-colors">
                        {job.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                        <span className="font-semibold text-slate-200 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        {job.experienceRequired && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                            {job.experienceRequired}
                          </span>
                        )}
                        {job.salary && (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Match Score Badge */}
                  <div className="shrink-0 flex items-center sm:flex-col sm:items-end gap-2 pl-8 sm:pl-0">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono">
                      <Sparkles className="w-3 h-3 text-emerald-400" />
                      <span>{job.matchScore}% Match</span>
                    </div>
                  </div>
                </div>

                {/* Description snippet */}
                {job.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pl-8">
                    {job.description}
                  </p>
                )}

                {/* Skills tags */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-8">
                    {job.skills.map((skill, sIdx) => (
                      <span 
                        key={sIdx} 
                        className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* URL and Action Bar */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* Direct Link Preview Bar */}
                  <div className="flex-1 flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-400 min-w-0">
                    <span className="text-slate-500 shrink-0 font-sans font-semibold text-[10px] uppercase">Direct URL:</span>
                    <span className="truncate text-sky-300 select-all">{job.applicationUrl}</span>
                    <button
                      onClick={() => copyToClipboard(job.applicationUrl, job.id)}
                      className="ml-auto text-slate-400 hover:text-white shrink-0 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Copy direct application URL"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={job.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 hover:text-sky-300 font-semibold"
                      title="Direct link to this specific job post application page"
                    >
                      <span>Direct Apply Link</span>
                      <ExternalLink className="w-3 h-3 text-sky-400" />
                    </a>

                    <button
                      onClick={() => handleAddToRadar(job)}
                      disabled={isAdded}
                      className={`btn text-xs font-bold px-3 py-1.5 flex items-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-sky-500/10 border border-sky-400/30 text-sky-300 hover:bg-sky-500/20'
                      }`}
                    >
                      {isAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <PlusIcon className="w-3.5 h-3.5" />}
                      <span>{isAdded ? 'On Radar' : '+ Radar'}</span>
                    </button>

                    {/* 1-Click Platform Auto-Apply */}
                    <button
                      onClick={() => handleApplySingle(job)}
                      disabled={isApplied || isApplying}
                      className={`btn text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 transition-all shadow-md ${
                        isApplied
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : isApplying
                          ? 'bg-amber-600 text-white cursor-wait'
                          : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/20'
                      }`}
                    >
                      {isApplying ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Applying...</span>
                        </>
                      ) : isApplied ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Applied ✓</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>⚡ Auto-Apply</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Platform Accounts & Sessions Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1626] border border-sky-500/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Platform Credentials & Active Sessions</h3>
              </div>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Your authenticated login sessions and credentials configured for autonomous submissions:
              </p>

              {/* Accounts Cards */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Otta (Welcome to the Jungle)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">Logged In</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">User: prashantkumar231197@gmail.com</div>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>We Work Remotely</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">Logged In</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">User: prashantkumar231197@gmail.com</div>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Wellfound (AngelList)</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded font-mono">Logged In</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">User: prashantkumar231197@gmail.com</div>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Indeed India</span>
                      <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded font-mono">Chrome Session</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Active Chrome user data directory cookies</div>
                  </div>
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Glassdoor India</span>
                      <span className="text-[10px] text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded font-mono">Indeed SSO</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Linked with verified Indeed credentials</div>
                  </div>
                  <Lock className="w-4 h-4 text-sky-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="btn btn-primary text-xs px-5 py-2 rounded-xl"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function PlusIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
