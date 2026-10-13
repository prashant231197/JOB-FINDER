import React, { useState, useEffect } from 'react';
import {
  Rocket,
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
  MapPin,
  Linkedin
} from 'lucide-react';

export default function LinkedInAutomationTab({ profile, onAddJobsToRadar }) {
  const [linkedinStatus, setLinkedinStatus] = useState({
    isConnected: false,
    totalApplicationsSubmitted: 0,
    recentLogs: []
  });

  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('SDET');
  const [searchLocation, setSearchLocation] = useState('Worldwide');
  const [datePostedFilter, setDatePostedFilter] = useState('past-week'); // 'past-24h' | 'past-week' | 'past-month' | 'all'
  const [easyApplyOnly, setEasyApplyOnly] = useState(true);

  const [linkedinJobs, setLinkedinJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState(new Set());
  const [isApplyingBatch, setIsApplyingBatch] = useState(false);
  const [applyingJobId, setApplyingJobId] = useState(null);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectTab, setConnectTab] = useState('interactive'); // 'interactive' | 'cookie'
  const [cookieInput, setCookieInput] = useState('');
  const [isLaunchingLogin, setIsLaunchingLogin] = useState(false);
  const [loginStatusMsg, setLoginStatusMsg] = useState('');

  const [toastMsg, setToastMsg] = useState('');
  const [copiedJobId, setCopiedJobId] = useState(null);

  // Fetch connection status
  const fetchStatus = async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/linkedin/status');
      if (res.ok) {
        const data = await res.json();
        setLinkedinStatus(data);
      }
    } catch (e) {
      console.warn('Could not fetch LinkedIn status:', e);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    handleSearchJobs('past-week', 'Worldwide');
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // 1-Click Interactive Login via dedicated visible browser window
  const handleLaunchInteractiveLogin = async () => {
    setIsLaunchingLogin(true);
    setLoginStatusMsg('Opening browser window... Please log in to LinkedIn & complete 2FA if prompted.');

    try {
      const res = await fetch('/api/linkedin/login-interactive', { method: 'POST' });
      const data = await res.json();
      if (data.isConnected) {
        setLoginStatusMsg('✓ Successfully connected! Session cookies saved.');
        showToast('✓ LinkedIn account connected successfully!');
        fetchStatus();
        setTimeout(() => setShowConnectModal(false), 2000);
      } else {
        setLoginStatusMsg('Login window closed or session not detected.');
      }
    } catch (err) {
      setLoginStatusMsg(`Login status: ${err.message}`);
    } finally {
      setIsLaunchingLogin(false);
    }
  };

  const handleCancelLogin = async () => {
    try {
      await fetch('/api/linkedin/cancel-login', { method: 'POST' });
    } catch (e) {}
    setIsLaunchingLogin(false);
    setLoginStatusMsg('Login cancelled.');
  };

  const handleCheckStatus = async () => {
    try {
      const res = await fetch('/api/linkedin/status');
      const data = await res.json();
      if (data.isConnected || data.hasSession) {
        showToast('✓ Verified! LinkedIn account is connected.');
        setShowConnectModal(false);
        fetchStatus();
      } else {
        showToast('No active session cookie found yet. Please log in or paste cookie.');
      }
    } catch (e) {
      showToast('Error checking status');
    }
  };

  // Manual cookie save (li_at)
  const handleSaveCookie = async (e) => {
    e.preventDefault();
    if (!cookieInput.trim()) return;

    try {
      const res = await fetch('/api/linkedin/save-cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies: cookieInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ LinkedIn connected with ${data.count} cookie(s)!`);
        setCookieInput('');
        setShowConnectModal(false);
        fetchStatus();
      } else {
        alert(data.error || 'Failed to save cookies');
      }
    } catch (err) {
      alert(`Error saving cookie: ${err.message}`);
    }
  };

  // Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect LinkedIn account and clear local session cookies?')) return;
    try {
      await fetch('/api/linkedin/disconnect', { method: 'POST' });
      fetchStatus();
      showToast('LinkedIn account disconnected.');
    } catch (err) {
      alert(err.message);
    }
  };

  // Search LinkedIn Jobs
  const handleSearchJobs = async (filter = datePostedFilter, loc = searchLocation) => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/linkedin/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchKeyword || 'SDET',
          location: loc || 'Worldwide',
          datePosted: filter,
          easyApplyOnly: easyApplyOnly,
          limit: 30
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLinkedinJobs(data.jobs || []);
        setSelectedJobIds(new Set((data.jobs || []).map(j => j.id)));
      } else {
        const err = await res.json();
        showToast(`Search notice: ${err.error || 'No jobs returned'}`);
      }
    } catch (e) {
      console.warn('LinkedIn search error:', e);
    } finally {
      setIsSearching(false);
    }
  };

  // 1-Click Easy Apply
  const handleApplySingleJob = async (job) => {
    if (!linkedinStatus.isConnected) {
      setShowConnectModal(true);
      return;
    }

    setApplyingJobId(job.id);
    showToast(`Starting automated Easy Apply for ${job.company}...`);

    try {
      const res = await fetch('/api/linkedin/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Successfully applied to ${job.company}! Added to Application Tracker.`);
        // Remove applied job from view
        setLinkedinJobs(prev => prev.filter(j => j.id !== job.id));
        fetchStatus();
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (e) {
      alert(`Error applying: ${e.message}`);
    } finally {
      setApplyingJobId(null);
    }
  };

  // Batch Easy Apply to selected jobs
  const handleBatchApply = async () => {
    if (!linkedinStatus.isConnected) {
      setShowConnectModal(true);
      return;
    }

    const selectedJobs = linkedinJobs.filter(j => selectedJobIds.has(j.id));
    if (selectedJobs.length === 0) {
      alert('Please select at least 1 job to apply.');
      return;
    }

    if (!window.confirm(`Start automated batch apply for ${selectedJobs.length} LinkedIn jobs using your tailored ATS resume and Groq AI?`)) {
      return;
    }

    setIsApplyingBatch(true);
    showToast(`Starting batch apply for ${selectedJobs.length} openings...`);

    try {
      const res = await fetch('/api/linkedin/apply-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: selectedJobs })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✓ Batch apply completed! ${data.successful?.length || 0} applied.`);
        // Remove successfully applied
        const successfulIds = new Set((data.successful || []).map(s => s.job?.id));
        setLinkedinJobs(prev => prev.filter(j => !successfulIds.has(j.id)));
        fetchStatus();
      } else {
        alert(data.error || 'Batch apply error');
      }
    } catch (e) {
      alert(`Batch apply error: ${e.message}`);
    } finally {
      setIsApplyingBatch(false);
    }
  };

  // Add all or selected to Radar
  const handlePushToRadar = (jobsToPush) => {
    if (!jobsToPush || jobsToPush.length === 0) return;
    if (onAddJobsToRadar) {
      onAddJobsToRadar(jobsToPush);
      showToast(`✓ Added ${jobsToPush.length} LinkedIn job(s) to Jobs Radar!`);
    }
  };

  const handleCopyUrl = (url, id) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedJobId(id);
    setTimeout(() => setCopiedJobId(null), 2500);
  };

  const toggleSelectJob = (id) => {
    const next = new Set(selectedJobIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedJobIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedJobIds.size === linkedinJobs.length) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(linkedinJobs.map(j => j.id)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl border border-sky-500/50 bg-sky-950/90 text-sky-200 text-xs font-semibold shadow-xl shadow-sky-950/50 flex items-center justify-between gap-3 animate-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* Top Banner / Account Connection Hub */}
      <div className="bg-[#0b1329] border border-sky-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#0a66c2] text-white flex items-center justify-center font-bold shadow-lg shadow-sky-500/20">
                <Linkedin className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">LinkedIn Automation Hub</h1>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                    EASY APPLY BOT
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Scan fresh 1-week SDET & QA jobs, tailor ATS resumes with Groq AI, and automate Easy Apply submissions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {linkedinStatus.isConnected ? (
              <div className="flex items-center gap-3 bg-[#081126] border border-emerald-500/30 rounded-2xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <div className="text-left">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                      <span>LinkedIn Connected</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {linkedinStatus.totalApplicationsSubmitted || 0} applied via bot
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="text-xs text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                  title="Disconnect LinkedIn account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowConnectModal(true)}
                className="btn btn-primary text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 bg-gradient-to-r from-[#0a66c2] to-cyan-600 hover:from-blue-600 hover:to-cyan-500 text-white shadow-lg shadow-sky-900/30"
              >
                <KeyRound className="w-4 h-4" />
                <span>Connect LinkedIn Account</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Hub */}
      <div className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Keyword */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role / Keyword</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                className="input-field input-with-icon text-xs py-2 bg-slate-900 border-slate-700 w-full"
                placeholder="e.g. SDET, QA Automation, Test Lead"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                className="input-field input-with-icon text-xs py-2 bg-slate-900 border-slate-700 w-full"
                placeholder="Worldwide, Remote, Bangalore, Pune..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Date Posted Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Posted (Freshness)</label>
            <select
              className="input-field text-xs py-2 bg-slate-900 border-slate-700 w-full text-slate-200"
              value={datePostedFilter}
              onChange={(e) => {
                setDatePostedFilter(e.target.value);
                handleSearchJobs(e.target.value);
              }}
            >
              <option value="past-24h">⚡ Past 24 Hours (Urgent)</option>
              <option value="past-week">🔥 Past Week (&lt;= 7 Days)</option>
              <option value="past-month">Past Month</option>
              <option value="all">Any Time</option>
            </select>
          </div>

          {/* Search Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleSearchJobs()}
              disabled={isSearching}
              className="w-full btn btn-primary text-xs font-bold py-2.5 flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-blue-600 text-white"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? 'Searching...' : 'Scan Fresh Jobs'}</span>
            </button>
          </div>

        </div>

        {/* Preset Location Chips & Easy Apply Toggle */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] text-slate-400 mr-1 font-mono">Location Presets:</span>
            {['Worldwide', 'Remote', 'Bangalore', 'Pune', 'Hyderabad', 'United States', 'London'].map(loc => (
              <button
                key={loc}
                onClick={() => {
                  setSearchLocation(loc);
                  handleSearchJobs(datePostedFilter, loc);
                }}
                className={`text-[11px] py-1 px-2.5 rounded-lg border font-medium transition-all ${
                  searchLocation === loc 
                    ? 'bg-sky-500/20 text-sky-200 border-sky-400 font-bold' 
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={easyApplyOnly}
                onChange={(e) => {
                  setEasyApplyOnly(e.target.checked);
                  handleSearchJobs(datePostedFilter, searchLocation);
                }}
                className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
              />
              <span>Easy Apply Only</span>
            </label>
          </div>
        </div>

      </div>

      {/* Discovered Jobs List & Batch Actions */}
      <div className="space-y-4">
        
        {/* Results Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0b101d] border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={linkedinJobs.length > 0 && selectedJobIds.size === linkedinJobs.length}
                onChange={toggleSelectAll}
                className="rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
              />
              <span>Select All</span>
            </label>

            <span className="text-slate-600">|</span>

            <div className="text-xs font-mono text-slate-400">
              Found <strong className="text-white font-bold">{linkedinJobs.length}</strong> fresh opening(s)
              {selectedJobIds.size > 0 && (
                <span className="text-sky-400 font-semibold ml-1.5">• {selectedJobIds.size} selected</span>
              )}
            </div>
          </div>

          {linkedinJobs.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePushToRadar(linkedinJobs.filter(j => selectedJobIds.has(j.id)))}
                disabled={selectedJobIds.size === 0}
                className="btn btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1.5 text-cyan-300 border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 font-semibold"
                title="Push selected LinkedIn jobs into main Jobs Radar"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                <span>Add to Radar ({selectedJobIds.size})</span>
              </button>

              <button
                onClick={handleBatchApply}
                disabled={isApplyingBatch || selectedJobIds.size === 0}
                className="btn btn-primary text-xs py-1.5 px-3.5 flex items-center justify-center gap-1.5 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/50"
              >
                <Rocket className={`w-3.5 h-3.5 ${isApplyingBatch ? 'animate-spin' : ''}`} />
                <span>{isApplyingBatch ? 'Applying...' : `Easy Apply to ${selectedJobIds.size}`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Jobs Feed */}
        {linkedinJobs.length === 0 ? (
          <div className="bg-[#0f172a]/70 border border-dashed border-slate-800 p-12 text-center rounded-2xl">
            <Briefcase className="w-9 h-9 text-slate-500 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-300">No active LinkedIn openings found for current filter</div>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting the role keyword, expanding the date filter to "Past Week", or changing location to Worldwide.
            </p>
            <button
              onClick={() => handleSearchJobs('past-week', 'Worldwide')}
              className="mt-3.5 text-xs text-sky-400 hover:text-sky-300 underline font-semibold"
            >
              Search Worldwide SDET Openings
            </button>
          </div>
        ) : (
          linkedinJobs.map(job => {
            const isSelected = selectedJobIds.has(job.id);
            const isApplyingThis = applyingJobId === job.id;
            const score = job.matchScore || 85;
            const isCopied = copiedJobId === job.id;

            return (
              <div
                key={job.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-3 shadow-lg ${
                  isSelected 
                    ? 'bg-[#0b1224] border-sky-500/40' 
                    : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectJob(job.id)}
                      className="mt-1 rounded border-slate-700 text-sky-500 focus:ring-sky-500 bg-slate-900"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-sky-400 uppercase tracking-wider font-mono">
                          {job.company}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1 font-mono">
                          <Linkedin className="w-3 h-3" /> Easy Apply
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          • {job.postedDate || 'Recent'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white leading-snug mt-1">
                        {job.title}
                      </h3>
                    </div>
                  </div>

                  <div className="score-pill score-high py-1 px-2.5 rounded-full text-xs font-bold shrink-0 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{score}% MATCH</span>
                  </div>
                </div>

                {/* Meta Details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>{job.location}</span>
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                    <span>{job.experience || '3-6 Years'}</span>
                  </span>
                </div>

                {/* Direct Link Row */}
                {job.applicationUrl && (
                  <div className="p-2.5 rounded-xl bg-[#070b14] border border-sky-500/25 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[11px] font-semibold text-sky-300 shrink-0">Official LinkedIn Post:</span>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-slate-300 hover:text-sky-200 truncate underline"
                      >
                        {job.applicationUrl}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopyUrl(job.applicationUrl, job.id)}
                        className="text-xs py-1 px-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                        <span>{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <a
                        href={job.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs py-1 px-2 rounded-lg border border-sky-500/40 bg-sky-950/40 text-sky-300 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open ↗</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Action Footer */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Ready for AI-Tailored Easy Apply</span>
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => handlePushToRadar([job])}
                      className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 font-semibold"
                      title="Add this job to main Jobs Radar"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                      <span>Add to Radar</span>
                    </button>

                    <button
                      onClick={() => handleApplySingleJob(job)}
                      disabled={isApplyingThis}
                      className="btn btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 font-bold bg-[#0a66c2] hover:bg-blue-600 text-white shadow-md shadow-sky-900/40"
                    >
                      <Rocket className={`w-3.5 h-3.5 ${isApplyingThis ? 'animate-spin' : ''}`} />
                      <span>{isApplyingThis ? 'Applying...' : 'Easy Apply with AI ↗'}</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}

      </div>

      {/* Live Activity Logs Drawer */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            LinkedIn Automation Activity Logs
          </span>
          <button
            onClick={fetchStatus}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="bg-[#060a14] rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300 border border-slate-800/60">
          {(linkedinStatus.recentLogs || []).length === 0 ? (
            <div className="text-slate-500 text-center py-4">No recent activity. Launch search or Easy Apply to see live logs.</div>
          ) : (
            linkedinStatus.recentLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className={log.type === 'error' ? 'text-rose-400' : log.type === 'success' ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Connect Account Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-sky-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Linkedin className="w-4 h-4 text-sky-400" />
                <span>Connect LinkedIn Account</span>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setConnectTab('interactive')}
                className={`pb-2 px-3 border-b-2 transition-all ${connectTab === 'interactive' ? 'border-sky-400 text-sky-300 font-bold' : 'border-transparent text-slate-400'}`}
              >
                1. 1-Click Interactive Login (Recommended)
              </button>
              <button
                onClick={() => setConnectTab('cookie')}
                className={`pb-2 px-3 border-b-2 transition-all ${connectTab === 'cookie' ? 'border-sky-400 text-sky-300 font-bold' : 'border-transparent text-slate-400'}`}
              >
                2. Paste Cookie (li_at)
              </button>
            </div>

            {connectTab === 'interactive' ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p>
                  Click the button below to launch a visible Chrome window. Log in to your LinkedIn account normally and complete 2FA if prompted.
                </p>
                <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/30 text-sky-200">
                  ⚡ Once you reach your LinkedIn home feed, the bot will automatically detect your session, extract the auth cookie, and close the window!
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleLaunchInteractiveLogin}
                    disabled={isLaunchingLogin}
                    className="flex-1 btn btn-primary text-xs font-bold py-3 flex items-center justify-center gap-2 bg-[#0a66c2] hover:bg-blue-600 text-white disabled:opacity-50"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{isLaunchingLogin ? 'Waiting for Login...' : 'Launch LinkedIn Login Window'}</span>
                  </button>

                  {isLaunchingLogin && (
                    <button
                      onClick={handleCancelLogin}
                      className="px-3 py-3 rounded-xl border border-rose-500/40 text-rose-300 hover:bg-rose-950/40 font-bold text-xs"
                      title="Cancel wait"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <button
                    onClick={handleCheckStatus}
                    className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Already logged in? Check status now →</span>
                  </button>
                </div>

                {loginStatusMsg && (
                  <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center font-mono">
                    {loginStatusMsg}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveCookie} className="space-y-3">
                <div className="text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-300">
                  <span className="font-bold text-sky-400 block mb-1">How to copy your <code>li_at</code> cookie:</span>
                  <div>1. Open <strong className="text-white">linkedin.com</strong> in Chrome where you are already logged in.</div>
                  <div>2. Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">F12</kbd> &rarr; Click <strong className="text-white">Application</strong> tab.</div>
                  <div>3. In left sidebar: Click <strong className="text-white">Cookies</strong> &rarr; <code className="text-sky-300">https://www.linkedin.com</code>.</div>
                  <div>4. Find the row named <strong className="text-sky-300">li_at</strong> &rarr; Double click its <strong className="text-white">Value</strong> &rarr; Copy and paste below!</div>
                </div>

                <textarea
                  className="input-field text-xs py-2 bg-slate-950 border-slate-700 w-full font-mono text-sky-200 min-h-[90px]"
                  placeholder="Paste li_at cookie value here (e.g. AQED...)"
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="w-full btn btn-primary text-xs font-bold py-2.5 bg-[#0a66c2] hover:bg-blue-600 text-white"
                >
                  Save & Connect
                </button>
              </form>
            )}

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
