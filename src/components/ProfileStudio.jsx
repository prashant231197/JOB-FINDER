import React, { useState, useRef } from 'react';
import { 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  Plus, 
  X, 
  Save, 
  Briefcase, 
  GraduationCap, 
  DollarSign, 
  Clock, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin, 
  HelpCircle,
  Sparkles,
  Wand2,
  Download,
  Edit3
} from 'lucide-react';
import { updateResumeWithPromptGroq } from '../services/groqService';

const COMMON_QA_SKILLS = [
  'Playwright', 'Selenium', 'Cypress', 'Appium', 'Postman', 'RestAssured',
  'Python', 'TypeScript', 'JavaScript', 'Java', 'SQL', 'Docker',
  'GitHub Actions', 'Jenkins', 'JMeter', 'k6', 'JIRA', 'TestRail', 'Zephyr',
  'BDD/Cucumber', 'API Automation', 'Regression Testing'
];

const COMMON_FINTECH_SKILLS = [
  'ISO 8583', 'ISO 8989', 'ISO 20022', 'Payment Gateway', 'Card Processing',
  'Card Issuing', 'Merchant Acquiring', 'Payment Switch Testing', '3DS / 3D Secure',
  'Card Tokenization', 'EMV', 'UPI Switch', 'Settlement & Clearing', 'PCI-DSS Compliance'
];

export default function ProfileStudio({ profile, completeness, onSaveProfile, onUploadResume, onOpenResumeStudio }) {
  const [formData, setFormData] = useState(profile || {});
  const [newSkill, setNewSkill] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [inlinePrompt, setInlinePrompt] = useState('');
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineMessage, setInlineMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Sync if profile prop changes
  React.useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] || {}),
        [field]: value
      }
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...(formData.education || [])];
    if (!updated[index]) updated[index] = {};
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, education: updated }));
  };

  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s) return;
    const current = formData.skills || [];
    if (!current.includes(s)) {
      setFormData(prev => ({ ...prev, skills: [...current, s] }));
    }
    setNewSkill('');
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill)
    }));
  };

  const addLocation = (loc) => {
    const l = loc.trim();
    if (!l) return;
    const current = formData.preferredLocations || [];
    if (!current.includes(l)) {
      setFormData(prev => ({ ...prev, preferredLocations: [...current, l] }));
    }
    setNewLocation('');
  };

  const removeLocation = (loc) => {
    setFormData(prev => ({
      ...prev,
      preferredLocations: (prev.preferredLocations || []).filter(l => l !== loc)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveProfile(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      await onUploadResume(file);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error uploading resume: ${err.message}`);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleQuickGroqEdit = async () => {
    if (!inlinePrompt.trim() || isInlineEditing) return;
    setIsInlineEditing(true);
    setInlineMessage(null);
    try {
      const currentText = formData.resumeText || '';
      const result = await updateResumeWithPromptGroq(currentText, inlinePrompt, formData);
      if (result.updatedResumeMarkdown) {
        const updated = {
          ...formData,
          resumeText: result.updatedResumeMarkdown
        };
        setFormData(updated);
        if (onSaveProfile) {
          await onSaveProfile(updated);
        }
        setInlineMessage(result.changeSummary || '✓ Groq AI updated resume content successfully!');
        setInlinePrompt('');
        setTimeout(() => setInlineMessage(null), 5000);
      }
    } catch (err) {
      alert(`Error updating with Groq: ${err.message}`);
    } finally {
      setIsInlineEditing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Completeness Gauge & Resume Studio Trigger */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-cyan-500/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl">
            {formData.firstName?.[0] || 'Q'}{formData.lastName?.[0] || 'A'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{formData.fullName || 'Candidate Profile'}</h2>
              <span className="badge badge-cyan font-mono text-xs">{formData.workPreference || 'Remote'}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Senior QA / SDET Candidate Credentials • Auto-Populates Verified Applications
            </p>
          </div>
        </div>

        {/* Top Banner Actions & Completeness */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {onOpenResumeStudio && (
            <button
              type="button"
              onClick={onOpenResumeStudio}
              className="btn btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-2 shadow-lg shadow-cyan-500/25 border border-cyan-400/50 w-full sm:w-auto justify-center"
            >
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
              <span>AI Resume Studio & Downloader</span>
            </button>
          )}

          {/* Completeness Bar */}
          <div className="w-full sm:w-64 bg-slate-900/80 p-3.5 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[var(--text-muted)] font-mono">Profile Completeness</span>
              <span className="font-mono font-bold text-cyan-400">{completeness || 85}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-700" 
                style={{ width: `${completeness || 85}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Personal & Contact Information */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <span>1. Candidate Identification & Contact</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Sushant Kumar"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. sushant.qa@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Phone / Mobile</label>
              <input
                type="text"
                className="input-field"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Current Location (City, State, Country)</label>
              <input
                type="text"
                className="input-field"
                value={formData.currentLocation || ''}
                onChange={(e) => handleChange('currentLocation', e.target.value)}
                placeholder="e.g. Bengaluru, Karnataka, India"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Primary Work Preference</label>
              <select
                className="input-field"
                value={formData.workPreference || 'Remote'}
                onChange={(e) => handleChange('workPreference', e.target.value)}
              >
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid / Flexible</option>
                <option value="On-site">On-site</option>
              </select>
            </div>
          </div>

          {/* Preferred Locations Tags */}
          <div className="pt-2">
            <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Preferred Locations</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(formData.preferredLocations || []).map((loc, idx) => (
                <span key={idx} className="badge badge-cyan flex items-center gap-1.5 py-1 px-2.5">
                  <span>{loc}</span>
                  <button type="button" onClick={() => removeLocation(loc)} className="hover:text-rose-400">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                className="input-field text-xs py-1.5"
                placeholder="Add location (e.g. London, San Francisco)..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation(newLocation); }}}
              />
              <button
                type="button"
                onClick={() => addLocation(newLocation)}
                className="btn btn-secondary text-xs px-3"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Resume / CV File & Online Profiles */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>2. Resume Attachment & Online Profiles</span>
            </h3>
            {onOpenResumeStudio && (
              <button
                type="button"
                onClick={onOpenResumeStudio}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-mono"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Full AI Studio & Downloader →</span>
              </button>
            )}
          </div>

          {/* Quick AI Resume Edit Instruction Bar (Groq Powered) */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
                Prompt Groq AI to Edit Sentences, Add Experience or Skills:
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Powered by Groq AI
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="input-field text-xs py-2 bg-slate-950 border-slate-700 flex-1"
                placeholder="e.g. Add 1 line about experience in ISO 8583 payment gateways and switch testing..."
                value={inlinePrompt}
                onChange={(e) => setInlinePrompt(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !isInlineEditing && inlinePrompt.trim()) {
                    e.preventDefault();
                    await handleQuickGroqEdit();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleQuickGroqEdit}
                disabled={isInlineEditing || !inlinePrompt.trim()}
                className="btn btn-primary text-xs px-4 py-2 font-bold flex items-center justify-center gap-1.5 shrink-0"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isInlineEditing ? 'animate-spin' : ''}`} />
                <span>{isInlineEditing ? 'Updating...' : 'Update with Groq'}</span>
              </button>
            </div>

            {inlineMessage && (
              <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 p-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{inlineMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resume Upload Dropzone */}
            <div className="p-4 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-950/10 flex flex-col items-center justify-center text-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.docx,.doc,.txt,.md" 
                className="hidden" 
              />
              <FileText className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-xs font-semibold text-white">
                {formData.resumeOriginalName || 'No resume uploaded yet'}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Current file attached for automated browser uploads (.pdf, .docx, .md, .txt)
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingResume}
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingResume ? 'Uploading...' : 'Upload File'}</span>
                </button>
                {onOpenResumeStudio && (
                  <button
                    type="button"
                    onClick={onOpenResumeStudio}
                    className="btn btn-secondary text-xs flex items-center gap-1.5 border-cyan-500/40 text-cyan-300"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Editor</span>
                  </button>
                )}
              </div>
            </div>

            {/* Social / Portfolio Links */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1 mb-1">
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.linkedIn || ''}
                  onChange={(e) => handleChange('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1 mb-1">
                  <Github className="w-3.5 h-3.5 text-violet-400" /> GitHub Profile URL
                </label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.github || ''}
                  onChange={(e) => handleChange('github', e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1 mb-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" /> Portfolio / Website URL
                </label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.portfolio || ''}
                  onChange={(e) => handleChange('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Skills & Competencies */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>3. QA & SDET Technical Skills (Used in 0-100 Matching)</span>
          </h3>

          <div className="flex flex-wrap gap-2">
            {(formData.skills || []).map((skill, idx) => (
              <span key={idx} className="badge badge-violet py-1 px-3 flex items-center gap-2 text-xs font-mono">
                <span>{skill}</span>
                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Quick preset chips */}
          <div className="pt-2 space-y-2">
            <div>
              <span className="text-xs text-[var(--text-muted)] font-mono block mb-1.5">Quick add QA Automation skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_QA_SKILLS.filter(s => !(formData.skills || []).includes(s)).map((skill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/5 text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5 transition-all"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-amber-400 font-mono block mb-1.5">Quick add Fintech & ISO 8583 skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_FINTECH_SKILLS.filter(s => !(formData.skills || []).includes(s)).map((skill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
                  >
                    + {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 max-w-md pt-2">
            <input
              type="text"
              className="input-field text-xs py-1.5 font-mono"
              placeholder="Custom skill (e.g. k6, Robot Framework)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(newSkill); }}}
            />
            <button
              type="button"
              onClick={() => addSkill(newSkill)}
              className="btn btn-secondary text-xs px-3"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 4: Experience, Education & Compensation */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>4. Experience, Education & Compensation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Years Experience</label>
              <input
                type="number"
                className="input-field"
                value={formData.yearsOfExperience || 5}
                onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value, 10))}
                min="0"
                max="30"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Current Salary / CTC</label>
              <input
                type="text"
                className="input-field"
                value={formData.currentSalary || ''}
                onChange={(e) => handleChange('currentSalary', e.target.value)}
                placeholder="e.g. $65,000 / ₹18 LPA"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Expected Salary / CTC</label>
              <input
                type="text"
                className="input-field"
                value={formData.expectedSalary || ''}
                onChange={(e) => handleChange('expectedSalary', e.target.value)}
                placeholder="e.g. $85,000 / ₹24 LPA"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Notice Period</label>
              <input
                type="text"
                className="input-field"
                value={formData.noticePeriod || ''}
                onChange={(e) => handleChange('noticePeriod', e.target.value)}
                placeholder="e.g. 60 days / Immediate"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">Degree / Field</label>
              <input
                type="text"
                className="input-field"
                value={formData.education?.[0]?.degree || ''}
                onChange={(e) => handleEducationChange(0, 'degree', e.target.value)}
                placeholder="e.g. B.Tech in Computer Science"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] font-mono block mb-1">University / Institute</label>
              <input
                type="text"
                className="input-field"
                value={formData.education?.[0]?.university || ''}
                onChange={(e) => handleEducationChange(0, 'university', e.target.value)}
                placeholder="e.g. National Institute of Technology"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Truthful QA Answers Bank (Requirement 7) */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border-cyan-500/20">
          <div className="border-b border-[var(--border-subtle)] pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>5. Truthful QA Application Answers (Zero False Claims)</span>
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              STRICT: Fills actual verified candidate information only
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                "What is your experience with Selenium?"
              </label>
              <textarea
                className="input-field text-xs h-20"
                value={formData.customAnswers?.seleniumExperience || ''}
                onChange={(e) => handleNestedChange('customAnswers', 'seleniumExperience', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                "What is your experience with Playwright / Modern Test Automation?"
              </label>
              <textarea
                className="input-field text-xs h-20"
                value={formData.customAnswers?.playwrightExperience || ''}
                onChange={(e) => handleNestedChange('customAnswers', 'playwrightExperience', e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs text-amber-400 font-medium block mb-1">
                "What is your experience with ISO 8583 / ISO 8989 / Financial Messaging & Switch Testing?"
              </label>
              <textarea
                className="input-field text-xs h-20 border-amber-500/30"
                value={formData.customAnswers?.iso8583Experience || ''}
                onChange={(e) => handleNestedChange('customAnswers', 'iso8583Experience', e.target.value)}
                placeholder="Details on ISO 8583 message formats, bitmap fields, switch testing, and settlement..."
              />
            </div>

            <div>
              <label className="text-xs text-cyan-300 font-medium block mb-1">
                "What is your experience with Payment Gateways, Card Lifecycle, 3DS & Tokenization?"
              </label>
              <textarea
                className="input-field text-xs h-20 border-cyan-500/30"
                value={formData.customAnswers?.paymentDomainExperience || ''}
                onChange={(e) => handleNestedChange('customAnswers', 'paymentDomainExperience', e.target.value)}
                placeholder="Details on dual-message transactions, acquiring/issuing, 3DS 2.0, tokenization..."
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">
                "Why are you interested in this role?" (Synthesized with target company name during apply)
              </label>
              <textarea
                className="input-field text-xs h-20"
                value={formData.customAnswers?.whyInterested || ''}
                onChange={(e) => handleNestedChange('customAnswers', 'whyInterested', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-30 flex items-center justify-between p-4 rounded-xl bg-[#0b101b]/90 backdrop-blur-md border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-2 text-xs">
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
                <CheckCircle className="w-4 h-4" /> Profile credentials saved successfully!
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">
                All updates persist instantly to local database.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary text-xs font-semibold py-2.5 px-6 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>

      </form>
    </div>
  );
}
