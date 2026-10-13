import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ExternalLink, 
  Globe, 
  Zap, 
  Filter, 
  CheckCircle2, 
  Sparkles,
  CreditCard,
  Landmark,
  ShieldAlert,
  Coins,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { initialCompanies } from '../data/initialCompanies';

export default function FintechExplorer({ onScanFintechRole, onDiscoverJobs, onNavigateToRadar }) {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(520);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [sectorsList, setSectorsList] = useState([]);
  const [countriesList, setCountriesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanningCompany, setScanningCompany] = useState(null);
  const [batchScanning, setBatchScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState(null);

  // Fallback filtering function for Cloudflare Pages static hosting
  const applyStaticFallback = () => {
    let list = [...(initialCompanies || [])];

    if (selectedSector !== 'All') {
      list = list.filter(c => c.sector === selectedSector);
    }
    if (selectedCountry !== 'All') {
      list = list.filter(c => c.country === selectedCountry);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => 
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.domainTags || []).some(t => t.toLowerCase().includes(q)) ||
        (c.headquarters || '').toLowerCase().includes(q)
      );
    }

    setTotal(list.length);
    const start = (page - 1) * 24;
    setCompanies(list.slice(start, start + 24));

    // Derive sectors & countries if not set
    if (sectorsList.length === 0) {
      const secs = Array.from(new Set(initialCompanies.map(c => c.sector))).filter(Boolean);
      setSectorsList(secs);
    }
    if (countriesList.length === 0) {
      const cnts = Array.from(new Set(initialCompanies.map(c => c.country))).filter(Boolean);
      setCountriesList(cnts);
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
        search: search.trim(),
        sector: selectedSector,
        country: selectedCountry
      });

      const res = await fetch(`/api/fintech/companies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setTotal(data.total || 0);
        if (data.sectors?.length) setSectorsList(data.sectors);
        if (data.countries?.length) setCountriesList(data.countries);
      } else {
        applyStaticFallback();
      }
    } catch (err) {
      console.warn('Backend unavailable, using bundled static fintech directory:', err);
      applyStaticFallback();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, selectedSector, selectedCountry]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleQuickScan = async (company) => {
    setScanningCompany(company.id);
    setScanMessage(null);
    try {
      const res = await fetch('/api/fintech/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company })
      });
      const data = await res.json();
      if (data.found && data.count > 0) {
        setScanMessage({
          type: 'success',
          text: `✓ ${data.message} Updating Verified Jobs Radar...`
        });
        if (onDiscoverJobs) await onDiscoverJobs();
        setTimeout(() => {
          if (onNavigateToRadar) onNavigateToRadar();
        }, 1200);
      } else {
        setScanMessage({
          type: 'info',
          text: data.message || `No active QA/SDET/Tester opening found on ${company.name}'s career page right now.`
        });
      }
      setTimeout(() => setScanMessage(null), 6000);
    } catch (err) {
      setScanMessage({ type: 'error', text: `Failed to scan ${company.name}: ${err.message}` });
    } finally {
      setScanningCompany(null);
    }
  };

  const handleBatchScanAll = async () => {
    setBatchScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch('/api/fintech/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: selectedSector !== 'All' ? selectedSector : '',
          query: 'SDET QA ISO 8583 Payment Card Domain',
          limit: 30
        })
      });
      const data = await res.json();
      const newCount = data.newJobsDiscovered || 0;
      const totalCount = data.totalJobs || 0;

      // Update jobs in main state
      if (onDiscoverJobs) {
        await onDiscoverJobs();
      }

      setScanMessage({
        type: 'success',
        text: `✓ Batch Scan Complete! Indexed ${newCount} new verified QA roles (${totalCount} total). Updating Verified Jobs Radar...`
      });

      // Automatically transition to Verified Jobs Radar
      setTimeout(() => {
        if (onNavigateToRadar) onNavigateToRadar();
      }, 1200);

      setTimeout(() => setScanMessage(null), 6000);
    } catch (err) {
      setScanMessage({ type: 'error', text: `Batch scan error: ${err.message}` });
    } finally {
      setBatchScanning(false);
    }
  };

  const sectorIcons = {
    'Payments & Gateways': CreditCard,
    'Card Issuing & Switch': Cpu,
    'Core Banking & ISO': Landmark,
    'Indian Fintech': Zap,
    'Neobanks': Globe,
    'Lending & BNPL': TrendingUp,
    'WealthTech': TrendingUp,
    'Crypto & Web3': Coins,
    'RegTech & Risk': ShieldAlert
  };

  const totalPages = Math.ceil(total / 24) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner & Batch Scanner Hero */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-[#0d1527] via-[#091122] to-[#121b36] border border-cyan-500/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> 520+ VERIFIED FINTECH DIRECTORY
              </span>
              <span className="text-xs font-mono text-emerald-400">Global & Indian Ecosystems</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Fintech Career Portals & SDET Search Engine
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated crawling directory covering top Payment Gateways (Stripe, Adyen, Razorpay), Card Switches & Issuers (Visa, Mastercard, Marqeta, M2P), Core Banking (Temenos, Finastra), and Neobanks. Filter by ISO 8583, 8989, Card Domain, and SDET.
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={handleBatchScanAll}
              disabled={batchScanning}
              className="btn btn-primary text-xs font-bold py-3 px-5 flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Zap className={`w-4 h-4 ${batchScanning ? 'animate-spin' : ''}`} />
              <span>{batchScanning ? 'Scanning 500+ Career Portals...' : 'Batch Scan 500+ Fintech Portals'}</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[rgba(255,255,255,0.06)] font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--text-muted)]">Tracked Companies:</span>
            <span className="text-cyan-400 font-bold">{total}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--text-muted)]">Key Domains:</span>
            <span className="text-emerald-400 font-bold">ISO 8583 / Cards / Switch</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--text-muted)]">Target Roles:</span>
            <span className="text-violet-400 font-bold">SDET / QA Automation</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[var(--text-muted)]">Direct Apply:</span>
            <span className="text-amber-400 font-bold">100% Verified URLs</span>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {scanMessage && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150 ${
          scanMessage.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : scanMessage.type === 'info'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {scanMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{scanMessage.text}</span>
        </div>
      )}

      {/* Search & Filtering Controls */}
      <div className="glass-panel p-4 rounded-xl space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-3" />
            <input
              type="text"
              className="input-field input-with-icon text-xs py-2.5 bg-slate-900 border-slate-700"
              placeholder="Search by company name, tag (ISO 8583, Switch, UPI, Card), or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Country Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setPage(1);
              }}
              className="input-field text-xs py-2.5 bg-slate-900 text-slate-200"
            >
              <option value="All">All Regions / Countries</option>
              {countriesList.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sector Quick Filter Chips (Horizontal swipe on phones) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs whitespace-nowrap">
          <button
            onClick={() => { setSelectedSector('All'); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-colors ${
              selectedSector === 'All'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'btn-secondary text-[var(--text-secondary)]'
            }`}
          >
            All Sectors ({total})
          </button>

          {sectorsList.map((sec, idx) => {
            const Icon = sectorIcons[sec] || Building2;
            const isSelected = selectedSector === sec;
            return (
              <button
                key={idx}
                onClick={() => { setSelectedSector(sec); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg shrink-0 font-medium flex items-center gap-1.5 transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'btn-secondary text-[var(--text-secondary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sec}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[var(--text-muted)] font-mono glass-panel rounded-2xl">
          <Zap className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
          Loading 500+ Fintech Company Directory...
        </div>
      ) : companies.length === 0 ? (
        <div className="p-16 text-center text-xs text-[var(--text-muted)] font-mono glass-panel rounded-2xl">
          No fintech companies match your search. Try resetting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((comp) => {
            const SectorIcon = sectorIcons[comp.sector] || Building2;
            const isScanning = scanningCompany === comp.id;

            return (
              <div 
                key={comp.id}
                className="glass-panel p-4 rounded-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between group bg-[#0b101d]/90 hover:bg-[#0f172a]"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                      <SectorIcon className="w-3 h-3 text-cyan-400" />
                      {comp.sector}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {comp.country}
                    </span>
                  </div>

                  {/* Company Name */}
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {comp.name}
                  </h3>

                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">
                    {comp.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(comp.domainTags || []).slice(0, 4).map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[var(--border-subtle)]">
                  <a
                    href={comp.careerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[var(--text-secondary)] hover:text-white flex items-center gap-1 font-mono transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Career Page</span>
                  </a>

                  <button
                    onClick={() => handleQuickScan(comp)}
                    disabled={isScanning}
                    className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Zap className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    <span>{isScanning ? 'Scanning...' : 'Scan Jobs'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        <div className="text-[var(--text-muted)] text-center sm:text-left">
          Showing page <span className="text-cyan-400 font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span> ({total} companies)
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 disabled:opacity-30"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1 disabled:opacity-30"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
