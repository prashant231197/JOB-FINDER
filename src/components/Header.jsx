import React from 'react';
import { 
  Radar, 
  Building2, 
  Columns3, 
  UserCheck, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Shield
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  stats,
  verifiedCount = 0
}) {
  return (
    <header className="border-b border-slate-800 bg-[#080d1a] sticky top-0 z-50 shadow-xl px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 shrink-0">
            <Radar className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                FINTECH QA RADAR
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-mono font-medium">
                  VERIFIED ONLY
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Live QA, SDET & ISO 8583 / Card Switch Openings • Direct Official Apply
            </p>
          </div>
        </div>

        {/* Status Indicators & Direct Apply Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-400">Verified Openings:</span>
            <span className="font-mono font-bold text-emerald-400">{verifiedCount || stats.totalJobs || 0}</span>
          </div>

          <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 items-center gap-2 text-xs">
            <span className="text-amber-400">🏢</span>
            <span className="text-slate-400">Fintech Directory:</span>
            <span className="font-mono font-bold text-amber-300">520+</span>
          </div>

          <div className="hidden md:flex px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 items-center gap-2 text-xs">
            <span className="text-violet-400 font-mono font-semibold text-[11px]">Direct Tracked:</span>
            <span className="font-mono font-bold text-violet-300">{stats.appliedCount || 0}</span>
          </div>
        </div>

      </div>

      {/* Clean Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
            activeTab === 'radar'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Radar className="w-4 h-4" />
          <span>Verified Jobs Radar</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-cyan-300 font-mono">
            {verifiedCount || stats.totalJobs || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fintech')}
          className={`flex items-center gap-2 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
            activeTab === 'fintech'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>520+ Fintech Companies & Careers</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-900/60 text-amber-300 font-mono">
            520+
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
            activeTab === 'pipeline'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Columns3 className="w-4 h-4" />
          <span>Application Tracker</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {stats.appliedCount || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 text-xs font-semibold py-2 px-4 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Profile & Resume Match</span>
        </button>
      </div>
    </header>
  );
}
