import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Bot, 
  Copy, 
  Check, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Globe, 
  ShieldCheck, 
  HelpCircle, 
  Code2, 
  Bookmark, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Brain,
  MessageSquare
} from 'lucide-react';
import { initialProfile } from '../data/initialProfile';
import { 
  generateResumeTailoringPrompt, 
  generateTailoredResumeContent, 
  matchResumeWithJobAI, 
  DEFAULT_GROQ_MODEL 
} from '../services/groqService';

const generateFallbackCopilot = (job) => {
  return {
    jobId: job?.id,
    matchScore: job?.matchScore || 85,
    matchReasons: job?.matchReasons || [
      'Strict QA/SDET role aligned with Playwright & Python automation experience.',
      'Fintech and ISO 8583 / Card domain matches candidate core competencies.'
    ],
    applicantData: {
      fullName: initialProfile.fullName || 'Sushant Kumar',
      firstName: initialProfile.firstName || 'Sushant',
      lastName: initialProfile.lastName || 'Kumar',
      email: initialProfile.email || 'prashantkumar231197@gmail.com',
      phone: initialProfile.phone || '+91 6204507166',
      currentLocation: initialProfile.currentLocation || 'Bengaluru, India',
      yearsOfExperience: initialProfile.yearsOfExperience || 4,
      noticePeriod: initialProfile.noticePeriod || '60 days',
      expectedSalary: initialProfile.expectedSalary || '$85,000 / ₹24,00,000',
      workAuthorization: initialProfile.authorizedToWork || 'Yes',
      requireSponsorship: initialProfile.requireSponsorship || 'No'
    },
    tailoredAnswers: [
      {
        question: "Describe your experience with ISO 8583, Card Processing, or Payment Gateways",
        answer: initialProfile.customAnswers?.iso8583Experience || "5+ years testing payment switches and card engines using ISO 8583 (1987/1993) message formats, bitmap field validations (MTI 0100/0110, 0200/0210), network switch simulators, and settlement reconciliation engines."
      },
      {
        question: "Why are you interested in this Fintech QA / SDET position?",
        answer: initialProfile.customAnswers?.whyInterested || "I am passionate about building resilient quality engineering systems and automated test architectures for mission-critical financial transaction infrastructure and payments."
      },
      {
        question: "Test Automation Architecture & CI/CD Frameworks",
        answer: "Extensive experience designing scalable Playwright & TypeScript test suites with auto-waiting, API contract testing using RestAssured, and GitHub Actions parallel CI/CD runners."
      }
    ]
  };
};

export default function FormFillerModal({ job, onClose, onApplyWithBot }) {
  const [copilotData, setCopilotData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'answers' | 'bookmarklet' | 'ai_resume'

  // Groq AI Resume Generator States
  const [tailoredPrompt, setTailoredPrompt] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiEval, setAiEval] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  useEffect(() => {
    if (!job) return;
    setLoading(true);

    fetch(`/api/fintech/copilot/${job.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Copilot endpoint not found');
        return res.json();
      })
      .then(data => {
        setCopilotData(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Using bundled copilot data fallback:', err);
        setCopilotData(generateFallbackCopilot(job));
        setLoading(false);
      });
  }, [job]);

  const applicant = copilotData?.applicantData || initialProfile;

  // Pre-generate prompt once job & applicant are ready
  useEffect(() => {
    if (job && applicant) {
      const prompt = generateResumeTailoringPrompt(applicant, job);
      setTailoredPrompt(prompt);
    }
  }, [job, applicant]);

  if (!job) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(tailoredPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCopyResume = () => {
    navigator.clipboard.writeText(tailoredResume);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2500);
  };

  const handleGenerateAiResume = async () => {
    setIsGeneratingAi(true);
    try {
      const content = await generateTailoredResumeContent(applicant, job);
      setTailoredResume(content);

      const evaluation = await matchResumeWithJobAI(applicant, job);
      setAiEval(evaluation);
    } catch (err) {
      console.warn('Error generating AI resume with Groq:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const score = aiEval?.matchScore || copilotData?.matchScore || job.matchScore || 0;
  const scoreClass = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-cyan-400' : 'text-amber-400';
  const scoreBg = score >= 85 ? 'bg-emerald-500/10 border-emerald-500/30' : score >= 70 ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-amber-500/10 border-amber-500/30';

  return (
    <div className="modal-overlay p-3 sm:p-5" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-3xl bg-[#0b0f19] border border-[rgba(255,255,255,0.15)] p-4 sm:p-6 rounded-2xl shadow-2xl relative max-h-[92vh] flex flex-col mx-auto animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                {job.company}
              </span>
              <span className="text-xs font-mono text-violet-400 px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
                {job.sector || 'Fintech'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
              {job.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-1">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {job.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salary}</span>
            </div>
          </div>

          <button 
            id="close-form-filler-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close Copilot"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resume Match % Banner */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-[#101b33] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-mono ${scoreBg}`}>
              <span className={`text-xl font-black ${scoreClass}`}>{score}%</span>
              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-tighter">MATCH</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Resume vs. JD Match Analysis</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {aiEval?.executiveSummary || copilotData?.matchReasons?.[0] || 'Technical skills & payment domain mapped to profile.'}
              </p>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto justify-end">
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs py-2 px-3 flex items-center justify-center gap-1.5 text-cyan-300 border-cyan-500/30"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Apply URL ↗</span>
            </a>

            <button
              onClick={() => onApplyWithBot && onApplyWithBot(job)}
              className="btn btn-primary text-xs py-2 px-3.5 flex items-center justify-center gap-1.5 font-bold shadow-md shadow-cyan-500/20"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Auto-Fill</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5 shrink-0 overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('fields')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'fields'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1-Click Personal Fields</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_resume')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai_resume'
                ? 'bg-gradient-to-r from-cyan-500/25 to-violet-500/25 text-cyan-200 border border-cyan-400 font-bold shadow-sm'
                : 'text-violet-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>🤖 AI Resume & Prompt (Groq)</span>
          </button>

          <button
            onClick={() => setActiveTab('answers')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'answers'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Fintech QA Answers</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarklet')}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'bookmarklet'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
                : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Autofill Bookmarklet</span>
          </button>
        </div>

        {/* Tab Body - Scrollable */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* TAB 1: 1-Click Personal Fields */}
          {activeTab === 'fields' && (
            <div className="space-y-3">
              <div className="text-xs text-[var(--text-muted)] flex items-center justify-between">
                <span>Click any field to copy instantly into the company's application form:</span>
                <span className="font-mono text-cyan-400">Profile: {applicant.fullName || 'Sushant Kumar'}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {[
                  { label: 'Full Name', val: applicant.fullName, icon: User, key: 'name' },
                  { label: 'Email Address', val: applicant.email, icon: Mail, key: 'email' },
                  { label: 'Phone Number', val: applicant.phone, icon: Phone, key: 'phone' },
                  { label: 'Current Location', val: applicant.currentLocation, icon: MapPin, key: 'loc' },
                  { label: 'LinkedIn Profile', val: applicant.linkedIn, icon: Globe, key: 'linkedin' },
                  { label: 'GitHub Profile', val: applicant.github, icon: Code2, key: 'github' },
                  { label: 'Portfolio URL', val: applicant.portfolio, icon: Globe, key: 'portfolio' },
                  { label: 'Notice Period', val: applicant.noticePeriod, icon: Calendar, key: 'notice' },
                  { label: 'Expected Salary', val: applicant.expectedSalary, icon: DollarSign, key: 'salary' },
                  { label: 'Attached Resume', val: applicant.resumeOriginalName || 'default_resume.pdf', icon: FileText, key: 'resume' },
                ].map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                        {item.label}
                      </div>
                      <div className="text-xs font-semibold text-white truncate mt-1 select-all">
                        {item.val || 'Not Specified'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(item.val || '', item.key)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1 shrink-0 transition-colors ${
                        copiedKey === item.key 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {copiedKey === item.key ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === item.key ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AI RESUME & PROMPT GENERATOR (GROQ) */}
          {activeTab === 'ai_resume' && (
            <div className="space-y-4">
              
              {/* Trigger Banner */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span>Groq AI Resume Engine ({DEFAULT_GROQ_MODEL})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Generates copy-paste prompt for Grok/ChatGPT and writes targeted STAR resume bullet points for {job.company}.
                  </p>
                </div>

                <button
                  onClick={handleGenerateAiResume}
                  disabled={isGeneratingAi}
                  className="btn btn-primary text-xs py-2 px-4 font-bold flex items-center gap-1.5 shrink-0 shadow-lg shadow-cyan-500/20"
                >
                  <Zap className={`w-3.5 h-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                  <span>{isGeneratingAi ? 'Analyzing with Groq...' : '⚡ Generate with Groq AI'}</span>
                </button>
              </div>

              {/* CARD 1: Copyable AI Prompt for Grok / ChatGPT / Claude */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-violet-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                    Copyable Prompt for Grok / ChatGPT / Claude
                  </span>

                  <button
                    onClick={handleCopyPrompt}
                    className={`btn text-xs py-1 px-3 flex items-center gap-1 font-semibold ${
                      copiedPrompt ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'btn-secondary text-slate-200'
                    }`}
                  >
                    {copiedPrompt ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={tailoredPrompt}
                  className="input-field font-mono text-[11px] p-2.5 bg-[#070b14] border-slate-800 text-slate-300 w-full leading-relaxed select-all"
                />
              </div>

              {/* CARD 2: Instant Tailored Experience Bullets Generated by Groq */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    AI-Tailored Experience Bullets (Matching {job.company}'s JD)
                  </span>

                  {tailoredResume && (
                    <button
                      onClick={handleCopyResume}
                      className={`btn text-xs py-1 px-3 flex items-center gap-1 font-semibold ${
                        copiedResume ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'btn-secondary text-slate-200'
                      }`}
                    >
                      {copiedResume ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedResume ? 'Bullets Copied!' : 'Copy Bullets'}</span>
                    </button>
                  )}
                </div>

                {isGeneratingAi ? (
                  <div className="p-8 text-center text-xs text-cyan-300 font-mono flex flex-col items-center justify-center gap-2">
                    <Zap className="w-6 h-6 animate-spin text-cyan-400" />
                    <span>Groq AI is crafting tailored experience bullet points for {job.title}...</span>
                  </div>
                ) : tailoredResume ? (
                  <div className="p-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 font-sans space-y-2 leading-relaxed whitespace-pre-wrap select-all">
                    {tailoredResume}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
                    Click <strong>"⚡ Generate with Groq AI"</strong> above to produce targeted bullet points tailored to this job description.
                  </div>
                )}
              </div>

              {/* CARD 3: Groq AI Strengths & Gaps Analysis */}
              {aiEval && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matching Strengths:
                    </span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                      {(aiEval.matchingStrengths || []).map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
                    <span className="font-mono font-bold text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Domain Fit & Gaps:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {aiEval.fintechDomainFit || 'Solid fintech payment gateway alignment.'}
                    </p>
                    {(aiEval.skillGaps || []).length > 0 && (
                      <div className="text-[10px] text-amber-300 pt-1 border-t border-amber-500/20">
                        Gap note: {aiEval.skillGaps.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: Tailored Fintech QA Answers */}
          {activeTab === 'answers' && (
            <div className="space-y-3">
              <div className="text-xs text-[var(--text-muted)]">
                AI-crafted, truthful responses tailored to {job.company}'s specific job description and ISO 8583 / payment domain requirements:
              </div>

              {(copilotData?.tailoredAnswers || []).map((ans, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-cyan-300">
                      Q: {ans.question}
                    </span>
                    <button
                      onClick={() => handleCopy(ans.answer, `ans-${idx}`)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 shrink-0 transition-colors ${
                        copiedKey === `ans-${idx}` 
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {copiedKey === `ans-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === `ans-${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 font-sans leading-relaxed select-all">
                    {ans.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: 1-Click Browser Autofill Bookmarklet */}
          {activeTab === 'bookmarklet' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-white">Universal 1-Click Browser Autofill Bookmarklet</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Drag this button directly to your browser's Bookmarks bar. When you navigate to {job.company}'s career portal or any application form, click the bookmark to auto-fill all your fields in 1 second!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Bookmarklet JavaScript Payload:</span>
                  <button
                    onClick={() => handleCopy(copilotData?.bookmarkletScript || '', 'script')}
                    className="btn btn-primary text-[10px] py-1 px-2.5 flex items-center gap-1"
                  >
                    {copiedKey === 'script' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'script' ? 'Copied Script' : 'Copy Script'}</span>
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto select-all text-cyan-300">
                  {copilotData?.bookmarkletScript || 'Loading bookmarklet script...'}
                </div>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <span className="font-semibold text-white">How to install in 10 seconds:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Click "Copy Script" above.</li>
                  <li>In your browser, press <kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono">Ctrl+D</kbd> or right click your Bookmarks Bar &rarr; <em>Add Page</em>.</li>
                  <li>Name it: <strong className="text-cyan-400">⚡ AutoFill QA Hunter</strong></li>
                  <li>Paste the copied script into the <em>URL</em> box and save.</li>
                  <li>Now open any job application and click the bookmark!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Truthful Profile Data • No False Credentials
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-secondary text-xs py-1.5 px-3.5"
            >
              Close
            </button>
            <a
              href={job.applicationUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Go to Application Page</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
