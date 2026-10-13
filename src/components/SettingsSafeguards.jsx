import React, { useState } from 'react';
import { ShieldCheck, Sliders, AlertTriangle, Plus, X, Save, CheckCircle } from 'lucide-react';

export default function SettingsSafeguards({ settings, onSaveSettings }) {
  const [formData, setFormData] = useState(settings || {});
  const [newExcludedCompany, setNewExcludedCompany] = useState('');
  const [newExcludedTitle, setNewExcludedTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    if (settings) setFormData(settings);
  }, [settings]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addExcludedCompany = (company) => {
    const c = company.trim();
    if (!c) return;
    const current = formData.excludedCompanies || [];
    if (!current.includes(c)) {
      setFormData(prev => ({ ...prev, excludedCompanies: [...current, c] }));
    }
    setNewExcludedCompany('');
  };

  const removeExcludedCompany = (company) => {
    setFormData(prev => ({
      ...prev,
      excludedCompanies: (prev.excludedCompanies || []).filter(c => c !== company)
    }));
  };

  const addExcludedTitle = (title) => {
    const t = title.trim();
    if (!t) return;
    const current = formData.excludedJobTitles || [];
    if (!current.includes(t)) {
      setFormData(prev => ({ ...prev, excludedJobTitles: [...current, t] }));
    }
    setNewExcludedTitle('');
  };

  const removeExcludedTitle = (title) => {
    setFormData(prev => ({
      ...prev,
      excludedJobTitles: (prev.excludedJobTitles || []).filter(t => t !== title)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Automation Controls & Hard Safeguards</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Control match score cutoffs, salary thresholds, and company/title exclusion blacklists.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Match Score & Session Safeguards */}
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[var(--border-subtle)] pb-3">
            Thresholds & Session Limits
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Minimum Match Score */}
            <div>
              <div className="flex justify-between text-xs mb-2">
                <label className="text-slate-300 font-medium">Minimum Match Score Required</label>
                <span className="font-mono text-cyan-400 font-bold">{formData.minMatchScore || 70}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={formData.minMatchScore || 70}
                onChange={(e) => handleChange('minMatchScore', parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Jobs scoring below this threshold will be flagged and excluded from auto-apply runs.
              </p>
            </div>

            {/* Max Applications per Session */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Maximum Applications Per Session
              </label>
              <input
                type="number"
                min="1"
                max="50"
                className="input-field font-mono"
                value={formData.maxApplicationsPerSession || 10}
                onChange={(e) => handleChange('maxApplicationsPerSession', parseInt(e.target.value, 10))}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Session safety ceiling to prevent excessive submission volume.
              </p>
            </div>

            {/* Minimum Salary Threshold */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Minimum Annual Salary Floor ($ USD)
              </label>
              <input
                type="number"
                step="5000"
                className="input-field font-mono"
                value={formData.minSalary || 75000}
                onChange={(e) => handleChange('minSalary', parseInt(e.target.value, 10))}
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                Exclude listings offering base compensation beneath this floor.
              </p>
            </div>

            {/* Auto-Submit Mode */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoSubmitTrusted || false}
                  onChange={(e) => handleChange('autoSubmitTrusted', e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded"
                />
                <span className="font-semibold">Auto-Submit Mode (Skip Final User Approval)</span>
              </label>
              <p className="text-[11px] text-[var(--text-muted)] mt-1 ml-6">
                When disabled (recommended), the bot halts at the final submit step for 1-click human inspection.
              </p>
            </div>

          </div>
        </div>

        {/* Exclusions Blacklists */}
        <div className="glass-panel p-6 rounded-2xl space-y-5">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono border-b border-[var(--border-subtle)] pb-3">
            Exclusion Blacklists (Requirement 11)
          </h3>

          <div className="space-y-4">
            {/* Excluded Companies */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Excluded Companies (Never Apply)
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.excludedCompanies || []).map((comp, idx) => (
                  <span key={idx} className="badge badge-rose py-1 px-3 flex items-center gap-2 text-xs font-mono">
                    <span>{comp}</span>
                    <button type="button" onClick={() => removeExcludedCompany(comp)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  className="input-field text-xs py-1.5 font-mono"
                  placeholder="Company name to exclude..."
                  value={newExcludedCompany}
                  onChange={(e) => setNewExcludedCompany(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExcludedCompany(newExcludedCompany); }}}
                />
                <button
                  type="button"
                  onClick={() => addExcludedCompany(newExcludedCompany)}
                  className="btn btn-secondary text-xs px-3"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Excluded Job Titles */}
            <div className="pt-3 border-t border-[var(--border-subtle)]">
              <label className="text-xs text-slate-300 font-medium block mb-1.5">
                Excluded Job Title Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(formData.excludedJobTitles || []).map((title, idx) => (
                  <span key={idx} className="badge badge-amber py-1 px-3 flex items-center gap-2 text-xs font-mono">
                    <span>{title}</span>
                    <button type="button" onClick={() => removeExcludedTitle(title)} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  className="input-field text-xs py-1.5 font-mono"
                  placeholder="Keyword to filter out (e.g. Intern, VP)..."
                  value={newExcludedTitle}
                  onChange={(e) => setNewExcludedTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExcludedTitle(newExcludedTitle); }}}
                />
                <button
                  type="button"
                  onClick={() => addExcludedTitle(newExcludedTitle)}
                  className="btn btn-secondary text-xs px-3"
                >
                  Add
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-[var(--border-subtle)]">
          <div className="text-xs">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Controls and rules updated!
              </span>
            ) : (
              <span className="text-[var(--text-muted)]">
                Safeguards are applied immediately to all subsequent matching and automation tasks.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary text-xs font-semibold py-2.5 px-6 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Safeguards'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
