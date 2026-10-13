import React from 'react';
import { CheckCircle2, XCircle, ShieldCheck, Eye, Sparkles } from 'lucide-react';

export default function FinalReviewModal({ data, onApprove, onCancel }) {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-3xl bg-[#0b101c] border-2 border-cyan-500/40 p-6 rounded-2xl shadow-2xl relative max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Banner */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 mb-5">
          <ShieldCheck className="w-6 h-6 shrink-0 text-cyan-400" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider block font-mono">Safe Review Mode • Awaiting User Submission Approval</span>
            The browser has completed filling the candidate profile and uploaded your resume. Review the details below before authorizing final submission.
          </div>
        </div>

        {/* Job Info */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase">{data.job?.company || 'Company'}</span>
            <h2 className="text-xl font-bold text-white">{data.job?.title || 'Job Application'}</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">{data.job?.location} • Match Score: {data.matchScore || 90}%</p>
          </div>
          <span className="badge badge-emerald">
            {data.filledFieldsCount || 12} Fields Filled
          </span>
        </div>

        {/* Snapshot Screenshot */}
        <div className="my-4">
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono mb-2">
            <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-cyan-400" /> Live Browser Form Snapshot</span>
            <span>Real-time Screen Capture</span>
          </div>

          {data.screenshot ? (
            <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-slate-950 max-h-[380px] overflow-y-auto">
              <img 
                src={data.screenshot} 
                alt="Form Snapshot" 
                className="w-full object-contain"
              />
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-500 rounded-xl border border-dashed border-slate-800">
              Form snapshot rendering in progress...
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={onCancel}
            className="btn btn-secondary text-xs flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Cancel & Skip Submission</span>
          </button>

          <button
            onClick={onApprove}
            className="btn btn-emerald text-xs font-semibold py-2.5 px-5 flex items-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve & Submit Application</span>
          </button>
        </div>
      </div>
    </div>
  );
}
