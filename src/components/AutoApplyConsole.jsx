import React, { useRef, useEffect } from 'react';
import { 
  Terminal, 
  Bot, 
  Play, 
  Square, 
  AlertOctagon, 
  Eye, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Laptop,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function AutoApplyConsole({ 
  logs, 
  currentJob, 
  automationStatus, 
  latestScreenshot, 
  onStartAutomation, 
  onStopAutomation, 
  settings, 
  onUpdateSettings 
}) {
  const terminalEndRef = useRef(null);

  // Auto-scroll terminal to bottom when new logs arrive
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Control Strip */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Browser Automation Engine</h2>
              <span className={`badge text-xs font-mono ${
                automationStatus === 'RUNNING' 
                  ? 'badge-cyan animate-pulse' 
                  : automationStatus === 'PAUSED_FOR_CAPTCHA'
                  ? 'badge-rose'
                  : automationStatus === 'AWAITING_APPROVAL'
                  ? 'badge-amber'
                  : 'badge-emerald'
              }`}>
                {automationStatus}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Playwright browser automation with semantic form filling & human-in-the-loop safeguards.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* Review Mode Toggle */}
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer bg-slate-900/70 py-2 px-3 rounded-lg border border-[var(--border-subtle)]">
            <input
              type="checkbox"
              checked={settings?.autoSubmitTrusted || false}
              onChange={(e) => onUpdateSettings({ autoSubmitTrusted: e.target.checked })}
              className="accent-cyan-500 rounded"
            />
            <span>Auto-Submit (Bypass Review)</span>
          </label>

          {/* Headless / Headed Toggle */}
          <button
            onClick={() => onUpdateSettings({ headless: !settings?.headless })}
            className="btn btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Toggle visible browser window vs background headless execution"
          >
            <Laptop className="w-3.5 h-3.5 text-cyan-400" />
            <span>{settings?.headless ? 'Background Mode' : 'Visible Window Mode'}</span>
          </button>

          {/* Kill Switch */}
          <button
            onClick={onStopAutomation}
            className="btn btn-danger text-xs font-semibold py-2 px-4 flex items-center gap-1.5"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Halt / Kill Switch</span>
          </button>
        </div>
      </div>

      {/* Target Job Pill (if active) */}
      {currentJob && (
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <span className="radar-dot"></span>
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">
                Active Job Application Target
              </span>
              <span className="text-sm font-bold text-white">
                {currentJob.company} — {currentJob.title}
              </span>
            </div>
          </div>
          <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-xs">
            {currentJob.applicationUrl}
          </span>
        </div>
      )}

      {/* Main Grid: Terminal on Left, Screen Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Real-time Telemetry Terminal */}
        <div className="lg:col-span-7 terminal-window flex flex-col h-[520px]">
          <div className="terminal-header">
            <div className="flex items-center gap-2 text-xs">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-slate-300 font-semibold">AUTOMATION STREAM CONSOLE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
            </div>
          </div>

          <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-1.5">
            {logs && logs.length > 0 ? (
              logs.map((log, index) => {
                let color = 'text-slate-300';
                if (log.level === 'warning') color = 'text-amber-400';
                if (log.level === 'error') color = 'text-rose-400 font-semibold';
                if (log.message?.includes('APPLIED!')) color = 'text-emerald-400 font-bold';
                if (log.message?.includes('Starting Application')) color = 'text-cyan-400 font-bold';

                return (
                  <div key={index} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={color}>{log.message}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500 italic py-8 text-center">
                Console ready. Select a job in Radar and click "Auto-Apply with Bot" to stream live execution.
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Live Browser Snapshot Monitor */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
                <Eye className="w-4 h-4" />
                <span>LIVE BROWSER TELEMETRY</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {latestScreenshot ? '1280x800 Frame' : 'Standby'}
              </span>
            </div>

            {latestScreenshot ? (
              <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-slate-950 max-h-[420px] overflow-y-auto shadow-inner">
                <img 
                  src={latestScreenshot} 
                  alt="Browser Telemetry" 
                  className="w-full object-contain"
                />
              </div>
            ) : (
              <div className="h-80 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40">
                <Bot className="w-12 h-12 text-slate-700 mb-3" />
                <span className="text-xs text-slate-400 font-semibold">No Active Browser Viewport</span>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  When auto-apply launches, real-time snapshot frames of form detection and field filling will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="text-[11px] text-[var(--text-muted)] font-mono flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Human-in-the-loop Active
            </span>
            <span>Local Google Chrome Engine</span>
          </div>
        </div>

      </div>

    </div>
  );
}
