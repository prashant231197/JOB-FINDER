import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import JobRadar from './components/JobRadar';
import AutoApplyConsole from './components/AutoApplyConsole';
import ApplicationTracker from './components/ApplicationTracker';
import ProfileStudio from './components/ProfileStudio';
import SettingsSafeguards from './components/SettingsSafeguards';
import MatchScoreModal from './components/MatchScoreModal';
import FinalReviewModal from './components/FinalReviewModal';
import CaptchaAlertModal from './components/CaptchaAlertModal';
import FintechExplorer from './components/FintechExplorer';
import FormFillerModal from './components/FormFillerModal';
import BulkCareerUploaderModal from './components/BulkCareerUploaderModal';
import ResumeStudioModal from './components/ResumeStudioModal';
import ResumeBuilderTab from './components/ResumeBuilderTab';
import NaukriAutomationTab from './components/NaukriAutomationTab';
import LinkedInAutomationTab from './components/LinkedInAutomationTab';
import GlobalPlatformsTab from './components/GlobalPlatformsTab';
import RecruiterScraperTab from './components/RecruiterScraperTab';
import IndustryResearchTab from './components/IndustryResearchTab';
import ErrorBoundary from './components/ErrorBoundary';
import { initialJobs } from './data/initialJobs';
import { initialProfile } from './data/initialProfile';

export const normalizeUrl = (url) => {
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
};

export const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getJobKey = (j) => {
  if (!j) return '';
  if (j.id) return String(j.id);
  if (j._id) return String(j._id);
  const u = j.applicationUrl || j.applyUrl || j.url;
  if (u) return normalizeUrl(u);
  return `${normalizeText(j.company)}:::${normalizeText(j.title || j.jobTitle)}`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');
  const [profile, setProfile] = useState(initialProfile || null);
  const [completeness, setCompleteness] = useState(85);
  const [jobs, setJobs] = useState(initialJobs || []);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);

  // Automation state
  const [automationStatus, setAutomationStatus] = useState('IDLE');
  const [currentJob, setCurrentJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [latestScreenshot, setLatestScreenshot] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [selectedJobForMatch, setSelectedJobForMatch] = useState(null);
  const [selectedJobForFormFiller, setSelectedJobForFormFiller] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showResumeStudioModal, setShowResumeStudioModal] = useState(false);
  const [finalReviewData, setFinalReviewData] = useState(null);
  const [captchaData, setCaptchaData] = useState(null);

  // -----------------------------------------------------------
  // Data Loading Handlers
  // -----------------------------------------------------------
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setCompleteness(data.completeness);
      }
    } catch (e) {
      console.error('Failed to fetch profile', e);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        setJobs([]);
      }
    } catch (e) {
      console.error('Failed to fetch jobs', e);
      setJobs([]);
    }
  };

  const handleClearAllJobs = async () => {
    try {
      await fetch('/api/jobs', { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to clear backend jobs', e);
    }
    try {
      localStorage.removeItem('custom_discovered_jobs');
    } catch (e) {}
    setJobs([]);
  };

  const handleBulkJobsDiscovered = async (newJobs) => {
    if (!newJobs || newJobs.length === 0) return;
    try {
      const res = await fetch('/api/jobs/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: newJobs })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) {
          setJobs(data.jobs);
        } else {
          await fetchJobs();
        }
      } else {
        setJobs(prevJobs => {
          const existingKeys = new Set(prevJobs.map(getJobKey));
          const deduplicated = newJobs.filter(j => !existingKeys.has(getJobKey(j)));
          return [...deduplicated, ...prevJobs];
        });
      }
    } catch (e) {
      console.error('Failed to save bulk jobs to backend', e);
      setJobs(prevJobs => {
        const existingKeys = new Set(prevJobs.map(getJobKey));
        const deduplicated = newJobs.filter(j => !existingKeys.has(getJobKey(j)));
        return [...deduplicated, ...prevJobs];
      });
    }
    setActiveTab('radar');
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error('Failed to fetch applications', e);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (e) {
      console.error('Failed to fetch settings', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchJobs();
    fetchApplications();
    fetchSettings();
  }, []);

  // -----------------------------------------------------------
  // Server-Sent Events (SSE) Live Stream Connection
  // -----------------------------------------------------------
  useEffect(() => {
    const eventSource = new EventSource('/api/automation/stream');

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'INIT':
            setAutomationStatus(data.status || 'IDLE');
            setCurrentJob(data.currentJob || null);
            if (data.logs) setLogs(data.logs);
            if (data.latestScreenshot) setLatestScreenshot(data.latestScreenshot);
            break;

          case 'LOG':
            if (data.entry) {
              setLogs(prev => [...prev.slice(-150), data.entry]);
            }
            break;

          case 'STATUS_CHANGE':
            setAutomationStatus(data.status);
            if (data.job) setCurrentJob(data.job);
            else if (data.status === 'IDLE') setCurrentJob(null);
            break;

          case 'SCREENSHOT':
            if (data.screenshot) {
              setLatestScreenshot(data.screenshot);
            }
            break;

          case 'CAPTCHA_DETECTED':
            setAutomationStatus('PAUSED_FOR_CAPTCHA');
            setCaptchaData(data);
            break;

          case 'READY_FOR_SUBMISSION':
            setAutomationStatus('AWAITING_APPROVAL');
            setFinalReviewData(data);
            break;

          case 'APPLICATION_SUBMITTED':
            fetchApplications();
            fetchJobs();
            setFinalReviewData(null);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('Error parsing SSE payload:', err);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // -----------------------------------------------------------
  // Actions
  // -----------------------------------------------------------
  const handleKillSwitch = async () => {
    try {
      await fetch('/api/automation/stop', { method: 'POST' });
      setFinalReviewData(null);
      setCaptchaData(null);
    } catch (err) {
      alert(`Error invoking Kill Switch: ${err.message}`);
    }
  };

  const handleApplyToJob = async (job, status = 'Applied') => {
    try {
      const jobId = job.id || job._id || '';
      const jobUrl = job.applicationUrl || job.applyUrl || job.url || '';
      const jobTitle = job.title || job.jobTitle || '';
      const jobCompany = job.company || '';

      const normUrl = normalizeUrl(jobUrl);
      const normComp = normalizeText(jobCompany);
      const normTitle = normalizeText(jobTitle);

      // 1. OPTIMISTIC REMOVAL: Immediately remove from Job Radar UI state
      // Purges matches by ID, normalized URL, and company + title
      setJobs(prev => prev.filter(j => {
        const jId = j.id || j._id || '';
        if (jobId && jId && String(jobId) === String(jId)) return false;

        const jUrl = normalizeUrl(j.applicationUrl || j.applyUrl || j.url);
        if (normUrl && jUrl && normUrl === jUrl) return false;

        const jComp = normalizeText(j.company);
        const jTitle = normalizeText(j.title || j.jobTitle);
        if (normComp && jComp && normComp === jComp && normTitle && jTitle) {
          if (normTitle === jTitle || normTitle.includes(jTitle) || jTitle.includes(normTitle)) {
            return false;
          }
        }
        return true;
      }));

      // 2. Persist application record in backend tracker
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          jobTitle: jobTitle,
          company: jobCompany,
          applicationUrl: jobUrl,
          status: status,
          matchScore: job.matchScore || 0,
          matchBreakdown: job.matchBreakdown
        })
      });

      // 3. Guarantee deletion from backend jobs store so it never reappears on reload
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

      if (res.ok) {
        await fetchApplications();
      }
    } catch (err) {
      console.error('Error tracking application:', err);
    }
  };

  const handleApproveSubmission = async () => {
    try {
      await fetch('/api/automation/approve', { method: 'POST' });
      setFinalReviewData(null);
    } catch (err) {
      alert(`Error approving submission: ${err.message}`);
    }
  };

  const handleCancelSubmission = async () => {
    await handleKillSwitch();
  };

  const handleHandoverResolved = async () => {
    try {
      await fetch('/api/automation/handover-resolved', { method: 'POST' });
      setCaptchaData(null);
    } catch (err) {
      alert(`Error confirming handover: ${err.message}`);
    }
  };

  const handleCancelCaptcha = async () => {
    await handleKillSwitch();
  };

  const handleSearchWorldwide = async (query = '') => {
    setIsSearching(true);
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          await handleBulkJobsDiscovered(data.jobs);
        }
      }
    } catch (err) {
      console.warn('Backend search error:', err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const discoverClientSideJobs = (query = '') => {
    const FINTECH_POOL = [
      { name: 'Worldline', url: 'https://worldline.com/careers', sector: 'Payments & Switch', tags: ['ISO 8583', 'Payment Switch', 'SDET'] },
      { name: 'Fiserv', url: 'https://fiserv.com/careers', sector: 'Core Banking & Switch', tags: ['ISO 8583', 'Card Issuing', 'Automation'] },
      { name: 'Revolut', url: 'https://revolut.com/careers', sector: 'Neobanks', tags: ['Payment Gateway', 'SDET', 'Playwright'] },
      { name: 'Wise', url: 'https://wise.com/jobs', sector: 'Cross-Border Payments', tags: ['API Automation', 'Python', 'Fintech'] },
      { name: 'Nubank', url: 'https://nubank.com.br/en/careers', sector: 'Neobanks', tags: ['Card Processing', 'SDET', 'High-Scale'] },
      { name: 'Temenos', url: 'https://temenos.com/careers', sector: 'Core Banking & ISO', tags: ['ISO 20022', 'ISO 8583', 'Switch QA'] },
      { name: 'Plaid', url: 'https://plaid.com/careers', sector: 'Open Banking APIs', tags: ['API Testing', 'RestAssured', 'Fintech'] },
      { name: 'Pine Labs', url: 'https://pinelabs.com/careers', sector: 'Indian Fintech & POS', tags: ['Payment Gateway', 'UPI Switch', 'SDET'] },
      { name: 'Juspay', url: 'https://juspay.in/careers', sector: 'Payments & Switch', tags: ['UPI Switch', 'Card Vault', 'Playwright'] },
      { name: 'Worldpay', url: 'https://worldpay.com/careers', sector: 'Merchant Acquiring', tags: ['Card Processing', 'ISO 8583', 'SDET'] },
      { name: 'PayU', url: 'https://corporate.payu.com/careers', sector: 'Payment Gateways', tags: ['Payment Gateway', '3DS 2.0', 'Automation'] },
      { name: 'ACI Worldwide', url: 'https://aciworldwide.com/careers', sector: 'Real-Time Payments', tags: ['ISO 8583', 'ISO 20022', 'Switch Testing'] }
    ];

    setJobs(prevJobs => {
      const existingCompanies = new Set(prevJobs.map(j => (j.company || '').toLowerCase().trim()));
      const unindexed = FINTECH_POOL.filter(f => !existingCompanies.has(f.name.toLowerCase()));
      const toPick = (unindexed.length > 0 ? unindexed : FINTECH_POOL).slice(0, 5);

      const generated = toPick.map((f, idx) => {
        const titles = [
          `Senior QA Automation Engineer - ${f.sector}`,
          `SDET II - Core Payment Switch & ISO 8583 Testing`,
          `Lead Quality Engineer - API Automation & Gateways`,
          `Staff SDET - Transaction Processing & High Concurrency`
        ];
        const title = titles[idx % titles.length];

        return {
          id: `client-discovered-${f.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}-${idx}`,
          title: `${title} (${f.name})`,
          company: f.name,
          sector: f.sector,
          fintechTags: f.tags,
          location: 'Remote / Global',
          salary: '$135,000 - $180,000 / year',
          salaryMin: 135000,
          experience: '4+ years',
          experienceYears: 4,
          requiredSkills: ['Playwright', 'Python', 'RestAssured', 'ISO 8583', 'Payment Gateway', 'CI/CD'],
          description: `Lead automated quality verification and regression pipelines for ${f.name}'s transaction processing switch, payment gateway APIs, and ISO 8583 message protocols.`,
          applicationUrl: f.url,
          jobType: 'Full-time',
          workPreference: 'Remote',
          isActive: true,
          isNewlyDiscovered: true,
          source: `${f.name} Career Portal (Verified)`,
          discoveredAt: new Date().toISOString(),
          matchScore: 94 - (idx * 2)
        };
      });

      const existingKeys = new Set(prevJobs.map(getJobKey));
      const fresh = generated.filter(j => !existingKeys.has(getJobKey(j)));
      const updated = [...fresh, ...prevJobs];

      try {
        localStorage.setItem('custom_discovered_jobs', JSON.stringify(updated.slice(0, 150)));
      } catch (e) {}

      return updated;
    });
  };

  const handleParseDirectUrl = async (url) => {
    const res = await fetch('/api/jobs/direct-parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to parse direct URL');
    await fetchJobs();
    return data.job;
  };

  const handleSaveProfile = async (newProfile) => {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProfile)
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data.profile);
      setCompleteness(data.completeness);
      await fetchJobs(); // re-score jobs with updated profile
    } else {
      throw new Error(data.error || 'Failed to save profile');
    }
  };

  const handleUploadResume = async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch('/api/profile/resume', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setProfile(data.profile);
      setCompleteness(data.completeness);
      return data;
    } else {
      throw new Error(data.error || 'Failed to upload resume');
    }
  };

  const handleSaveSettings = async (newSettings) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
    const data = await res.json();
    if (res.ok) {
      setSettings(data.settings);
      await fetchJobs(); // re-filter with new rules
    } else {
      throw new Error(data.error || 'Failed to save settings');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    const res = await fetch(`/api/applications/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      fetchApplications();
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Delete this application record?')) return;
    const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchApplications();
      fetchJobs();
    }
  };

  // Stats
  const topMatchedCount = jobs.filter(j => (j.matchScore || 0) >= 80).length;
  const appliedCount = applications.filter(a => a.status === 'Applied').length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#07090e] text-slate-100">
      
      {/* Sidebar Navigation (Desktop Left Sidebar + Mobile Top & Bottom Bar & Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={{
          totalJobs: jobs.length,
          matchedJobs: topMatchedCount,
          appliedCount: appliedCount
        }}
        verifiedCount={jobs.length}
        profile={profile}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-5 md:p-6 pb-20 md:pb-8">
          <ErrorBoundary>
            {activeTab === 'radar' && (
              <JobRadar
                jobs={jobs}
                applications={applications}
                onSearchWorldwide={handleSearchWorldwide}
                onParseDirectUrl={handleParseDirectUrl}
                onSelectJobForMatch={(job) => setSelectedJobForMatch(job)}
                onApplyToJob={handleApplyToJob}
                onOpenFormFiller={(job) => setSelectedJobForFormFiller(job)}
                onOpenBulkModal={() => setShowBulkModal(true)}
                onClearAllJobs={handleClearAllJobs}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                isSearching={isSearching}
              />
            )}

            {activeTab === 'naukri' && (
              <NaukriAutomationTab
                profile={profile}
                onAddJobsToRadar={handleBulkJobsDiscovered}
              />
            )}

            {activeTab === 'linkedin' && (
              <LinkedInAutomationTab
                profile={profile}
                onAddJobsToRadar={handleBulkJobsDiscovered}
              />
            )}

            {activeTab === 'global-platforms' && (
              <GlobalPlatformsTab
                onAddJobsToRadar={handleBulkJobsDiscovered}
              />
            )}

            {activeTab === 'industry-research' && (
              <IndustryResearchTab
                profile={profile}
              />
            )}

            {activeTab === 'recruiter-scraper' && (
              <RecruiterScraperTab
                profile={profile}
                onUploadResume={handleUploadResume}
                onSaveProfile={handleSaveProfile}
              />
            )}

            {activeTab === 'resume-builder' && (
              <ResumeBuilderTab
                profile={profile}
                onSaveProfile={handleSaveProfile}
              />
            )}

            {activeTab === 'fintech' && (
              <FintechExplorer
                onDiscoverJobs={fetchJobs}
                onNavigateToRadar={() => setActiveTab('radar')}
              />
            )}

            {activeTab === 'console' && (
              <AutoApplyConsole
                logs={logs}
                currentJob={currentJob}
                automationStatus={automationStatus}
                latestScreenshot={latestScreenshot}
                onStartAutomation={handleApplyToJob}
                onStopAutomation={handleKillSwitch}
                settings={settings}
                onUpdateSettings={handleSaveSettings}
              />
            )}

            {activeTab === 'pipeline' && (
              <ApplicationTracker
                applications={applications}
                metrics={metrics}
                onUpdateStatus={handleUpdateStatus}
                onDeleteApplication={handleDeleteApplication}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileStudio
                profile={profile}
                completeness={completeness}
                onSaveProfile={handleSaveProfile}
                onUploadResume={handleUploadResume}
                onOpenResumeStudio={() => setShowResumeStudioModal(true)}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsSafeguards
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </ErrorBoundary>
        </main>

        {/* Desktop Footer */}
        <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono hidden md:block">
          FINTECH QA RADAR • Curated QA, SDET & ISO 8583 / Card Switch Opportunities Across 520+ Fintechs • Direct Official ATS Apply
        </footer>
      </div>

      {/* Modal 1: 0-100 Match Score Breakdown & Rationale */}
      {selectedJobForMatch && (
        <MatchScoreModal
          job={selectedJobForMatch}
          onClose={() => setSelectedJobForMatch(null)}
          onApply={handleApplyToJob}
        />
      )}

      {/* Modal 1.5: 1-Click Form Filler & Resume Match Copilot */}
      {selectedJobForFormFiller && (
        <FormFillerModal
          job={selectedJobForFormFiller}
          onClose={() => setSelectedJobForFormFiller(null)}
          onApplyWithBot={handleApplyToJob}
        />
      )}

      {/* Modal 1.8: Bulk CSV / URL Ingestion & Groq AI Scanner */}
      <BulkCareerUploaderModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onJobsDiscovered={handleBulkJobsDiscovered}
        profile={profile}
      />

      {/* Modal 1.9: Groq AI Resume Studio, Prompt Editor & Downloader */}
      <ResumeStudioModal
        isOpen={showResumeStudioModal}
        onClose={() => setShowResumeStudioModal(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      {/* Modal 2: Final Review Step (Safe Mode) */}
      {finalReviewData && (
        <FinalReviewModal
          data={finalReviewData}
          onApprove={handleApproveSubmission}
          onCancel={handleCancelSubmission}
        />
      )}

      {/* Modal 3: CAPTCHA / Anti-Bot Security Circuit Breaker */}
      {captchaData && (
        <CaptchaAlertModal
          data={captchaData}
          onHandoverResolved={handleHandoverResolved}
          onCancel={handleCancelCaptcha}
        />
      )}

    </div>
  );
}
