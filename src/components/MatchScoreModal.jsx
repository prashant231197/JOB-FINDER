import React from 'react';
import { X, CheckCircle2, AlertTriangle, Briefcase, MapPin, DollarSign, GraduationCap, Zap, ExternalLink } from 'lucide-react';

export default function MatchScoreModal({ job, onClose, onApply }) {
  if (!job) return null;

  const score = job.matchScore || 0;
  const breakdown = job.matchBreakdown || {
    skills: 80,
    jobTitle: 75,
    experience: 85,
    location: 90,
    education: 85,
    salary: 80
  };

  const getScoreColor = (val) => {
    if (val >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (val >= 70) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="modal-overlay p-3 sm:p-5" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl bg-[#0b0f19] border border-[rgba(255,255,255,0.15)] p-4 sm:p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{job.company}</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{job.title}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)] mt-2">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-400" /> {job.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-400" /> {job.salary}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-violet-400" /> {job.experience}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Overall Match Score Gauge */}
        <div className="my-5 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">Candidate Match Score</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1 flex items-baseline gap-2">
              <span className={score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-cyan-400' : 'text-amber-400'}>
                {score}%
              </span>
              <span className="text-xs text-[var(--text-muted)] font-normal">Weighted Index (0-100)</span>
            </div>
          </div>
          <div className={`px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border ${getScoreColor(score)}`}>
            {score >= 85 ? 'HIGH PRIORITY MATCH' : score >= 70 ? 'STRONG MATCH' : 'MODERATE MATCH'}
          </div>
        </div>

        {/* 6 Category Breakdown Progress Bars */}
        <div className="space-y-3.5 my-5">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono">Evaluation Breakdown</h3>
          
          {/* Skills */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Skills Alignment (Weight 30%)</span>
              <span className="font-mono text-cyan-400 font-semibold">{breakdown.skills}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.skills}%` }}></div>
            </div>
          </div>

          {/* Job Title */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Target Role & Title (Weight 20%)</span>
              <span className="font-mono text-emerald-400 font-semibold">{breakdown.jobTitle}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.jobTitle}%` }}></div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Years of Experience (Weight 15%)</span>
              <span className="font-mono text-violet-400 font-semibold">{breakdown.experience}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-violet-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.experience}%` }}></div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Location & Work Preference (Weight 15%)</span>
              <span className="font-mono text-blue-400 font-semibold">{breakdown.location}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.location}%` }}></div>
            </div>
          </div>

          {/* Education */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Education & Degrees (Weight 10%)</span>
              <span className="font-mono text-indigo-400 font-semibold">{breakdown.education}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.education}%` }}></div>
            </div>
          </div>

          {/* Salary */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">Salary Requirements (Weight 10%)</span>
              <span className="font-mono text-amber-400 font-semibold">{breakdown.salary}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${breakdown.salary}%` }}></div>
            </div>
          </div>
        </div>

        {/* Detailed Reasons List */}
        <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider font-mono mb-3">Scoring Rationale & Notes</h3>
          <div className="space-y-2">
            {(job.matchReasons || []).map((reason, idx) => (
              <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-[rgba(255,255,255,0.02)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary text-xs flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Application Page</span>
          </a>

          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn btn-secondary text-xs py-2"
            >
              Close
            </button>
            <button
              onClick={() => {
                onApply(job);
                onClose();
              }}
              className="btn btn-primary text-xs py-2 flex items-center justify-center gap-1.5 font-semibold"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="truncate">Auto-Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
