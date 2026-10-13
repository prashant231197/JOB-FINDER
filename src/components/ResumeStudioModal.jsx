import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileText,
  Upload,
  Sparkles,
  Download,
  Printer,
  Save,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  Edit3,
  Eye,
  Wand2,
  PlusCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  updateResumeWithPromptGroq,
  parseResumeTextWithGroq,
  DEFAULT_GROQ_MODEL
} from '../services/groqService';

const PRESET_PROMPTS = [
  'Add 1 line about experience in ISO 8583 payment gateways, bitmap field validation, and card switch testing under the recent role',
  'Add Playwright with TypeScript, CI/CD GitHub Actions, and Kafka test automation to skills and experience bullets',
  'Enhance all experience bullet points with quantifiable metrics (e.g. reduced regression time by 60%, 99.8% stability) using STAR format',
  'Add 1 line on 3DS 2.0 authentication, card tokenization, and transaction settlement testing',
  'Polish professional summary to position me as a Principal SDET / Lead Quality Architect for high-throughput fintech platforms'
];

export default function ResumeStudioModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) {
  if (!isOpen) return null;

  const [activeViewTab, setActiveViewTab] = useState('edit'); // 'edit' | 'preview'
  const [resumeText, setResumeText] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [changeSummary, setChangeSummary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize with profile resume text or structured data
  useEffect(() => {
    if (profile) {
      if (profile.resumeText && profile.resumeText.trim().length > 50) {
        setResumeText(profile.resumeText);
      } else {
        // Build initial markdown from profile
        const md = `# ${profile.fullName || 'Sushant Kumar'}
${profile.email || 'sushant.qa@example.com'} • ${profile.phone || '+91 98765 43210'} • ${profile.currentLocation || 'Bengaluru, India'} • ${profile.workPreference || 'Remote'}
LinkedIn: ${profile.linkedIn || 'https://linkedin.com/in/sushant-qa'} • GitHub: ${profile.github || 'https://github.com/sushant-qa'}

## Professional Summary
Senior QA Automation Engineer & SDET with 5+ years of quality engineering leadership specializing in Payment Gateways, ISO 8583 Transaction Switches, Card Processing, and Distributed Microservices. Proven expertise architecting high-coverage Playwright, RestAssured, and Python test frameworks.

## Core Technical Skills
- **Test Automation:** Playwright, Selenium, RestAssured, Postman, Appium, Cypress, k6, JMeter
- **Fintech & Protocols:** ISO 8583, ISO 20022, Payment Gateways, Card Switch Testing, 3DS 2.0, Tokenization, UPI Switches
- **Languages & Frameworks:** Python, TypeScript, Java, JavaScript, SQL, Shell Scripting
- **DevOps & Infrastructure:** Docker, GitHub Actions, Jenkins, Kafka, AWS, CI/CD

## Professional Experience

### Lead SDET / Senior QA Automation Engineer — Fintech Global Solutions
*2022 - Present | Remote*
- Architected enterprise Playwright and TypeScript test frameworks across 14 payment gateway microservices, cutting regression cycle time from 12 hours to 40 minutes.
- Validated end-to-end ISO 8583 (0100/0110, 0200/0210) message exchanges, identifying and resolving 40+ switch protocol edge cases prior to core banking deployment.
- Engineered automated REST API contract test suites with RestAssured, maintaining 99.7% test suite reliability across daily CI/CD deployments.
- Collaborated with payment compliance teams to automate PCI-DSS data masking and card tokenization test scenarios.

### Quality Assurance Engineer — PayTech Switch Systems
*2020 - 2022 | Bengaluru, India*
- Developed automated regression suites in Python and Selenium for merchant acquiring and POS authorization terminals.
- Executed high-throughput TPS load testing on transaction processing pipelines, identifying critical bottlenecks in transaction settlement.
- Mentored 4 junior QA engineers in modern API test automation and switch bitmap validation.

## Education & Certifications
- **Bachelor of Technology in Computer Science** — National Institute of Technology (2020)
- **Certified Software Test Automation Specialist** (Playwright & API Architecture)`;

        setResumeText(md);
      }
    }
  }, [profile]);

  // Handle local file upload (.txt, .md, .pdf, .json)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setResumeText(text);
        setChangeSummary(`Loaded file "${file.name}" into editor.`);
      }
    };
    reader.readAsText(file);
  };

  // Parse resume with Groq AI to extract and structure
  const handleParseWithGroq = async () => {
    if (!resumeText.trim()) return;
    setIsParsing(true);
    setChangeSummary(null);
    try {
      const parsed = await parseResumeTextWithGroq(resumeText);
      if (parsed.formattedMarkdown) {
        setResumeText(parsed.formattedMarkdown);
      }
      setChangeSummary(`✓ Groq AI parsed resume: Identified ${parsed.skills?.length || 0} skills, ${parsed.yearsOfExperience || 5} years experience for ${parsed.fullName || 'Candidate'}.`);
    } catch (err) {
      setChangeSummary(`Parse note: ${err.message}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Update resume with natural language prompt using Groq AI
  const handleApplyAiEdit = async () => {
    if (!promptInput.trim()) return;
    setIsProcessing(true);
    setChangeSummary(null);

    try {
      const result = await updateResumeWithPromptGroq(resumeText, promptInput, profile);
      if (result.updatedResumeMarkdown) {
        setResumeText(result.updatedResumeMarkdown);
        setChangeSummary(result.changeSummary || `✓ Updated resume based on: "${promptInput.slice(0, 70)}..."`);
        setPromptInput('');
      }
    } catch (err) {
      setChangeSummary(`AI Update error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Save to Profile & LocalStorage
  const handleSaveToProfile = async () => {
    try {
      const updated = {
        ...(profile || {}),
        resumeText: resumeText
      };

      if (onSaveProfile) {
        await onSaveProfile(updated);
      }

      // Persist in localStorage
      try {
        localStorage.setItem('candidate_resume_text', resumeText);
      } catch {}

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    }
  };

  // Download as text/markdown file
  const handleDownloadMarkdown = () => {
    const blob = new Blob([resumeText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = (profile?.fullName || 'Candidate')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const cleanRole = (profile?.targetRole || 'SDET')
      .replace(/\(.*?\)/g, '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 25) || 'SDET';

    link.download = `${cleanName}_${cleanRole}_Resume.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print / Save as PDF
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to generate printable PDF.');
      return;
    }

    const cleanName = (profile?.fullName || 'Candidate')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_');
    const cleanRole = (profile?.targetRole || 'SDET')
      .replace(/\(.*?\)/g, '')
      .trim()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .slice(0, 25) || 'SDET';

    // Convert markdown to clean HTML lines
    const htmlContent = resumeText
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) return `<h1 style="font-size:24px;margin-bottom:4px;color:#0f172a;">${line.replace('# ', '')}</h1>`;
        if (line.startsWith('## ')) return `<h2 style="font-size:16px;border-bottom:2px solid #0284c7;padding-bottom:3px;margin-top:16px;margin-bottom:8px;color:#0369a1;text-transform:uppercase;letter-spacing:0.5px;">${line.replace('## ', '')}</h2>`;
        if (line.startsWith('### ')) return `<h3 style="font-size:14px;margin-top:10px;margin-bottom:2px;color:#1e293b;">${line.replace('### ', '')}</h3>`;
        if (line.startsWith('- ') || line.startsWith('* ')) return `<li style="margin-bottom:4px;font-size:12px;line-height:1.5;color:#334155;">${line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`;
        if (line.trim().length === 0) return '<div style="height:6px;"></div>';
        return `<p style="margin:2px 0;font-size:12px;line-height:1.5;color:#334155;">${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`;
      })
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cleanName}_${cleanRole}_Resume</title>
          <style>
            @page { margin: 18mm 16mm; size: A4; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #0f172a;
              background: #fff;
              margin: 0;
              padding: 10px;
            }
            ul { margin: 4px 0 10px 18px; padding: 0; }
            strong { color: #0f172a; }
            @media print {
              body { padding: 0; }
              a { text-decoration: none; color: inherit; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy full resume text
  const handleCopyText = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0b101b] border border-cyan-500/40 w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 shrink-0 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> GROQ AI RESUME STUDIO
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Model: <strong className="text-cyan-400">{DEFAULT_GROQ_MODEL}</strong>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white mt-1 flex items-center gap-2">
              AI Resume Parser, Editor & Downloader
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload your resume or prompt Groq AI to inject specific experience sentences, roles, and skills, then download ATS-optimized PDF/Markdown.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Prompt Instruction Bar (Core Feature) */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/80 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              Prompt Groq to Edit Sentences, Add Experience or Skills:
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Instant LLM sentence enhancement & section rewrites
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !isProcessing) handleApplyAiEdit(); }}
              placeholder="e.g. Add 1 line about ISO 8583 payment switch testing, or add Playwright TypeScript skill..."
              className="input-field text-xs py-2.5 px-3 bg-slate-950 border-slate-700 flex-1 font-sans"
            />

            <button
              onClick={handleApplyAiEdit}
              disabled={isProcessing || !promptInput.trim()}
              className="btn btn-primary text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Updating...' : 'Update Resume with Groq AI'}</span>
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
            <span className="text-slate-500 font-mono text-[10px] shrink-0">Quick Add:</span>
            {PRESET_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPromptInput(preset)}
                className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-300 border border-slate-700/80 shrink-0 transition-colors"
              >
                {preset.slice(0, 38)}...
              </button>
            ))}
          </div>

          {/* Change Summary Alert */}
          {changeSummary && (
            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in duration-200">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                {changeSummary}
              </span>
              <button
                onClick={() => setChangeSummary(null)}
                className="text-slate-400 hover:text-white ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Toolbar & View Mode Switch */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center">
              <button
                onClick={() => setActiveViewTab('edit')}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                  activeViewTab === 'edit'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editable Text / Markdown</span>
              </button>
              <button
                onClick={() => setActiveViewTab('preview')}
                className={`text-xs px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                  activeViewTab === 'preview'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Executive Preview</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
              {resumeText.length} chars • ~{resumeText.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.pdf,.doc,.docx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 text-slate-300"
              title="Upload text or markdown resume file"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload File</span>
            </button>

            {/* Parse with Groq Button */}
            <button
              onClick={handleParseWithGroq}
              disabled={isParsing}
              className="btn btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 text-cyan-300 border-cyan-500/40 hover:bg-cyan-950/40"
              title="Parse raw resume into structured sections"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
              <span>{isParsing ? 'Parsing...' : 'Parse Sections'}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="btn btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1 text-slate-300"
              title="Copy entire resume text"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Main Resume Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-[#070b13]">
          {activeViewTab === 'edit' ? (
            <div className="h-full flex flex-col">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Enter or paste your resume content in Markdown format..."
                rows={18}
                className="w-full flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-mono text-xs leading-relaxed focus:border-cyan-500 focus:outline-none resize-none selection:bg-cyan-500/30 shadow-inner min-h-[380px]"
              />
            </div>
          ) : (
            /* Formatted Executive Preview */
            <div className="p-6 sm:p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 max-w-3xl mx-auto space-y-4 shadow-xl">
              <div className="border-b border-slate-800 pb-4">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profile?.fullName || 'Sushant Kumar'}
                </h1>
                <div className="text-xs text-cyan-400 font-mono mt-1 flex flex-wrap gap-2">
                  <span>{profile?.email || 'sushant.qa@example.com'}</span>
                  <span>•</span>
                  <span>{profile?.phone || '+91 98765 43210'}</span>
                  <span>•</span>
                  <span>{profile?.currentLocation || 'Bengaluru, India'}</span>
                  <span>•</span>
                  <span className="text-emerald-400">{profile?.workPreference || 'Remote'}</span>
                </div>
              </div>

              {/* Rendered Sections */}
              <div className="space-y-4 text-xs leading-relaxed">
                {resumeText.split('\n').map((line, idx) => {
                  if (line.startsWith('# ')) return null; // title already shown
                  if (line.startsWith('## ')) {
                    return (
                      <h2 key={idx} className="text-sm font-bold text-cyan-300 uppercase tracking-wider font-mono border-b border-cyan-500/30 pb-1 mt-4">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('### ')) {
                    return (
                      <h3 key={idx} className="text-xs font-bold text-white mt-2">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (line.startsWith('- ') || line.startsWith('* ')) {
                    return (
                      <li key={idx} className="ml-4 text-slate-300 list-disc">
                        <span dangerouslySetInnerHTML={{
                          __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        }} />
                      </li>
                    );
                  }
                  if (line.trim().length === 0) return null;
                  return (
                    <p key={idx} className="text-slate-300" dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                    }} />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Truthful Credentials • Ready for direct ATS submission
            </span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handleDownloadMarkdown}
              className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-slate-300 border-slate-700"
              title="Download clean Markdown / Text file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Download .MD</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="btn btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 text-slate-300 border-slate-700 hover:text-white"
              title="Open print dialog or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download / Print PDF</span>
            </button>

            <button
              onClick={handleSaveToProfile}
              className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg shadow-cyan-900/30"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savedSuccess ? 'Saved to Profile!' : 'Save & Sync to Profile'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
