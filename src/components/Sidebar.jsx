import React, { useState } from 'react';
import { 
  Radar, 
  Building2, 
  Columns3, 
  UserCheck, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  Menu, 
  X, 
  SlidersHorizontal,
  Briefcase,
  Layers,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  FileText,
  Zap,
  Linkedin,
  Globe,
  PhoneCall,
  TrendingUp
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  stats = {},
  verifiedCount = 20,
  profile = null
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const navItems = [
    {
      id: 'radar',
      label: 'Verified Jobs Radar',
      shortLabel: 'Radar',
      icon: Radar,
      badge: verifiedCount || stats.totalJobs || 20,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      description: 'Strict QA & SDET openings'
    },
    {
      id: 'naukri',
      label: 'Naukri Automation Hub',
      shortLabel: 'Naukri Bot',
      icon: Zap,
      badge: 'AUTO',
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      description: 'Daily booster & Easy Apply'
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Automation Hub',
      shortLabel: 'LinkedIn Bot',
      icon: Linkedin,
      badge: 'EASY APPLY',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      description: '1-Week scan & Easy Apply'
    },
    {
      id: 'global-platforms',
      label: 'Global Platforms Hub',
      shortLabel: '5 Platforms',
      icon: Globe,
      badge: '5 NETWORKS',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'WWR, Otta, Wellfound, YC, Glassdoor'
    },
    {
      id: 'industry-research',
      label: '10-Day Call Fast-Track & Research',
      shortLabel: '10-Day Calls',
      icon: TrendingUp,
      badge: '90%+ ACCURACY',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Top 60+ Employers & ATS Booster'
    },
    {
      id: 'recruiter-scraper',
      label: 'Recruiter Contact Scraper',
      shortLabel: 'HR Contacts',
      icon: PhoneCall,
      badge: 'PHONE & EMAIL',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      description: 'Scrape emails, mobile nos & direct DMs'
    },
    {
      id: 'resume-builder',
      label: 'AI Resume Builder (PDF)',
      shortLabel: 'Resume AI',
      icon: FileText,
      badge: 'SDET PDF',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      description: 'SDET-PRASHANT format & JD matcher'
    },
    {
      id: 'fintech',
      label: '520+ Fintech Directory',
      shortLabel: '520+ Fintech',
      icon: Building2,
      badge: '520+',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Career portals & ATS crawlers'
    },
    {
      id: 'pipeline',
      label: 'Application Tracker',
      shortLabel: 'Tracker',
      icon: Columns3,
      badge: stats.appliedCount || 0,
      badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      description: 'Direct ATS submission log'
    },
    {
      id: 'profile',
      label: 'Profile & Resume Studio',
      shortLabel: 'Profile',
      icon: UserCheck,
      badge: '85%',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      description: 'Domain matching & auto-filler'
    },
    {
      id: 'settings',
      label: 'Safeguards & Settings',
      shortLabel: 'Settings',
      icon: Shield,
      badge: 'Safe',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Safe mode & domain rules'
    }
  ];

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setMobileDrawerOpen(false);
  };

  const candidateName = profile?.fullName 
    || (profile?.firstName ? `${profile.firstName} ${profile.lastName || ''}`.trim() : 'Sushant Kumar');

  return (
    <>
      {/* ========================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible on md: screens and above)    */}
      {/* ========================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-[#080d1a] border-r border-slate-800/80 min-h-screen sticky top-0 h-screen z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 shrink-0">
            <Radar className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-wider text-white uppercase font-mono truncate">
                FINTECH QA RADAR
              </h1>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="text-[10px] text-cyan-300 font-mono tracking-tight font-semibold uppercase">
                VERIFIED ATS ONLY
              </span>
            </div>
          </div>
        </div>

        {/* Live Pulse Widget Banner */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40">
          <div className="bg-gradient-to-r from-[#0d1629] to-[#0c1322] border border-cyan-500/25 rounded-xl p-3 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Verified Openings
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {verifiedCount || stats.totalJobs || 20} Active
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/80">
              <span className="text-slate-500">Fintech Directory</span>
              <span className="text-amber-300 font-bold">520+ Portals</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
            Workspace Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-white border border-cyan-500/50 shadow-md shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/50' 
                      : 'bg-slate-800/80 text-slate-400 group-hover:text-white group-hover:bg-slate-700'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className={`truncate ${isActive ? 'text-cyan-200 font-bold' : 'text-slate-300'}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Candidate Profile Widget at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
          <div 
            onClick={() => handleSelectTab('profile')}
            className="p-3 rounded-xl bg-[#0d1527] border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white font-mono shadow-md">
                SK
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                  {candidateName}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Senior QA / SDET • ISO 8583
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-500">Match Readiness:</span>
              <span className="text-emerald-400 font-bold">85% Complete</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* 2. MOBILE TOP APP BAR (Visible on screens < md)           */}
      {/* ========================================================= */}
      <div className="flex md:hidden items-center justify-between px-4 py-2.5 bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/30 shrink-0">
              <Radar className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-xs font-black text-white font-mono tracking-tight leading-tight">
                FINTECH QA RADAR
              </div>
              <div className="text-[10px] text-cyan-300 font-mono tracking-tight leading-tight">
                SDET & ISO 8583
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Active Badge */}
        <button
          onClick={() => setActiveTab('radar')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold shrink-0"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{verifiedCount || 20} LIVE</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3. MOBILE SLIDE-OUT DRAWER OVERLAY                        */}
      {/* ========================================================= */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#080d1a] border-r border-slate-800 flex flex-col z-50 shadow-2xl overflow-hidden animate-in slide-in-from-left duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Radar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-white font-mono uppercase">FINTECH QA RADAR</h2>
                  <span className="text-[10px] text-emerald-400 font-mono font-medium">100% Official ATS Links</span>
                </div>
              </div>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live stats inside mobile drawer */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800/80">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Verified Jobs</div>
                  <div className="text-sm font-bold text-emerald-400">{verifiedCount || 20} Active</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Directory</div>
                  <div className="text-sm font-bold text-amber-300">520+ Portals</div>
                </div>
              </div>
            </div>

            {/* Drawer Navigation List */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-white border border-cyan-500/50 shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={isActive ? 'text-cyan-200 font-bold' : ''}>
                        {item.label}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer / Candidate Info */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80">
              <div 
                onClick={() => handleSelectTab('profile')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-white">
                  SK
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-200 truncate">{candidateName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Senior QA Automation</div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                  85%
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MOBILE BOTTOM DOCK (Fixed at bottom on phones)        */}
      {/* ========================================================= */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d1a]/95 backdrop-blur-md border-t border-slate-800/90 px-2 py-1 justify-around items-center shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-cyan-400' : ''}`} />
                {item.id === 'radar' && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-cyan-500 text-slate-950 font-mono text-[9px] font-black leading-none shadow-sm">
                    {verifiedCount || 20}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.shortLabel}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-cyan-400 rounded-full mt-0.5"></span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
