import React, { useState } from 'react';
import { 
  Columns3, 
  Table, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  FileText, 
  Sparkles, 
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  XCircle,
  HelpCircle
} from 'lucide-react';

const STATUS_COLUMNS = [
  { key: 'Discovered', title: 'Discovered', color: 'border-slate-700 text-slate-300' },
  { key: 'Matched', title: 'Matched (70%+)', color: 'border-cyan-500/40 text-cyan-400' },
  { key: 'Ready to Apply', title: 'Ready to Apply', color: 'border-blue-500/40 text-blue-400' },
  { key: 'Applied', title: 'Applied', color: 'border-violet-500/40 text-violet-400' },
  { key: 'Interview', title: 'Interview', color: 'border-emerald-500/40 text-emerald-400' },
  { key: 'Offer', title: 'Offer', color: 'border-amber-500/40 text-amber-400' },
  { key: 'Rejected', title: 'Rejected', color: 'border-rose-500/40 text-rose-400' }
];

export default function ApplicationTracker({ 
  applications, 
  metrics, 
  onUpdateStatus, 
  onDeleteApplication 
}) {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-xs text-[var(--text-muted)] font-mono">Total Tracked</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {metrics?.total || applications?.length || 0}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-violet-500/20">
          <div className="text-xs text-violet-400 font-mono">Applications Submitted</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {metrics?.counts?.['Applied'] || 0}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-emerald-500/20">
          <div className="text-xs text-emerald-400 font-mono">Interviews Scheduled</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {metrics?.counts?.['Interview'] || 0}
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-amber-500/20">
          <div className="text-xs text-amber-400 font-mono">Offers Received</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {metrics?.counts?.['Offer'] || 0}
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)] font-mono">
          Manage QA application statuses throughout the hiring pipeline
        </div>

        <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-[var(--border-subtle)]">
          <button
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'kanban' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Columns3 className="w-3.5 h-3.5 inline mr-1" /> Kanban
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs rounded font-medium transition-all ${
              viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5 inline mr-1" /> Table
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-6">
          {STATUS_COLUMNS.map((col) => {
            const colApps = (applications || []).filter(a => a.status === col.key);

            return (
              <div key={col.key} className="kanban-col shrink-0 w-72 min-w-[280px]">
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-2.5 border-b ${col.color}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono">
                    {col.title}
                  </h3>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5">
                    {colApps.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 min-h-[350px]">
                  {colApps.length === 0 ? (
                    <div className="p-6 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div 
                        key={app.id} 
                        className="glass-panel p-4 rounded-xl space-y-2.5 hover:border-[rgba(255,255,255,0.18)] transition-all bg-[#0e1320]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                            {app.company}
                          </span>
                          <span className="score-pill text-[10px] py-0.5 px-1.5 score-mid">
                            {app.matchScore || 85}%
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white line-clamp-2">
                          {app.jobTitle}
                        </h4>

                        <div className="text-[11px] text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3 h-3 text-slate-500" />
                            <span className="truncate">{app.resumeUsed}</span>
                          </div>
                        </div>

                        {/* Status Mover & Actions */}
                        <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                            className="bg-slate-900 text-[11px] text-slate-300 rounded border border-slate-700 px-2 py-1 outline-none"
                          >
                            {STATUS_COLUMNS.map(c => (
                              <option key={c.key} value={c.key}>{c.title}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <a
                              href={app.applicationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-slate-400 hover:text-cyan-400"
                              title="Open original job posting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => onDeleteApplication(app.id)}
                              className="p-1 text-slate-400 hover:text-rose-400"
                              title="Delete tracking record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-[var(--text-muted)] uppercase font-mono text-[11px] border-b border-[var(--border-subtle)]">
              <tr>
                <th className="p-4">Company & Job Title</th>
                <th className="p-4">Applied Date</th>
                <th className="p-4">Resume Version</th>
                <th className="p-4">Match Score</th>
                <th className="p-4">Stage</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {(applications || []).map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-semibold text-white">
                    <div className="text-cyan-400 font-mono text-[11px] uppercase">{app.company}</div>
                    {app.jobTitle}
                  </td>
                  <td className="p-4 font-mono text-[var(--text-secondary)]">
                    {new Date(app.dateApplied).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {app.resumeUsed}
                  </td>
                  <td className="p-4">
                    <span className="score-pill text-xs score-mid font-mono">
                      {app.matchScore || 85}%
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      className="bg-slate-900 text-xs text-slate-300 rounded border border-slate-700 px-2 py-1 outline-none"
                    >
                      {STATUS_COLUMNS.map(c => (
                        <option key={c.key} value={c.key}>{c.title}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
