import React from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle, ExternalLink, X } from 'lucide-react';

export default function CaptchaAlertModal({ data, onHandoverResolved, onCancel }) {
  if (!data) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-xl bg-[#140b10] border-2 border-rose-500/50 p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95">
        
        {/* Urgent Warning Header */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 mb-5">
          <ShieldAlert className="w-8 h-8 shrink-0 text-rose-400 animate-pulse" />
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider font-mono text-white">
              STOPPED: Verification / CAPTCHA Challenge Detected
            </h3>
            <p className="text-xs text-rose-200/80 mt-1">
              An anti-bot mechanism or security challenge was encountered: 
              <span className="font-mono font-semibold text-rose-300 ml-1">
                {data.challengeType || 'CAPTCHA / Cloudflare Gateway'}
              </span>
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3 text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono flex items-center justify-center shrink-0">1</span>
            <span>Automation has been <strong>immediately halted</strong> per safety rules. We never attempt automated CAPTCHA bypassing.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono flex items-center justify-center shrink-0">2</span>
            <span>Switch to the open browser window on your desktop (or open the link directly) to solve the verification challenge manually.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono flex items-center justify-center shrink-0">3</span>
            <span>Once solved, click <strong>"Handover Resolved / Continue"</strong> below to let the bot resume or complete the submission.</span>
          </div>
        </div>

        {/* Snapshot if available */}
        {data.screenshot && (
          <div className="my-4 rounded-lg overflow-hidden border border-slate-800 max-h-48">
            <img src={data.screenshot} alt="CAPTCHA View" className="w-full object-contain" />
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={onCancel}
            className="btn btn-secondary text-xs"
          >
            Cancel & Skip Job
          </button>

          <button
            onClick={onHandoverResolved}
            className="btn btn-primary text-xs font-semibold py-2.5 px-5 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Handover Resolved / Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
