import { useState, useEffect, useMemo } from 'react';
import { 
  COMPANY_TIERS, 
  TIMEFRAMES, 
  fetchMultipleCompaniesQuestions,
  useCompanyCatalog
} from '../data/companyService';
import { useProgress } from '../context/ProgressContext';
import SpiderLogo from './SpiderLogo';

export default function CompanyWise({ onOpenNotes }) {
  const { solved, toggleSolved, notes } = useProgress();
  const {
    companies,
    topCompanies,
    sha,
    updatedAt,
    loading: catalogLoading,
    error: catalogError,
    refresh
  } = useCompanyCatalog();

  // Multi-Company selection state
  const [selectedCompanies, setSelectedCompanies] = useState(['google']);
  const [isMultiMode, setIsMultiMode] = useState(false);

  // Timeframe and filter state
  const [selectedTimeframe, setSelectedTimeframe] = useState('thirty-days');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 660+ Company Explorer Modal state
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  // Fetch questions whenever selected companies or timeframe changes
  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    if (selectedCompanies.length === 0) {
      setQuestions([]);
      setIsLoading(false);
      return;
    }

    fetchMultipleCompaniesQuestions(selectedCompanies, selectedTimeframe)
      .then(data => {
        if (isCurrent) {
          setQuestions(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching company questions:', err);
        if (isCurrent) {
          setQuestions([]);
          setIsLoading(false);
        }
      });

    return () => { isCurrent = false; };
  }, [selectedCompanies, selectedTimeframe, sha]);

  // Filter & sort questions
  const filteredQuestions = useMemo(() => {
    if (!Array.isArray(questions)) return [];

    return questions.filter(q => {
      if (!q) return false;
      if (difficultyFilter !== 'all') {
        const diff = (q.difficulty || '').toLowerCase();
        if (diff !== difficultyFilter.toLowerCase()) return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const title = (q.name || q.title || '').toLowerCase();
        const matchTitle = title.includes(query);
        const matchNum = q.num != null ? String(q.num).includes(query) : false;
        if (!matchTitle && !matchNum) return false;
      }
      return true;
      // Higher interview frequency first (stable order so checking done doesn't jump)
      return (b?.frequency || 0) - (a?.frequency || 0);
    });
  }, [questions, difficultyFilter, search]);

  // Real-time Company Readiness Index for current selection
  const compTotalCount = questions.length;
  const compSolvedCount = useMemo(() => {
    return questions.filter(q => q?.slug && solved[q.slug]?.done).length;
  }, [questions, solved]);

  const compReadinessPercent = compTotalCount > 0
    ? (compSolvedCount > 0
        ? Math.max(0.1, Math.round((compSolvedCount / compTotalCount) * 1000) / 10)
        : 0)
    : 0;

  const compEasy = useMemo(() => questions.filter(q => (q.difficulty || '').toLowerCase() === 'easy'), [questions]);
  const compMed = useMemo(() => questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium'), [questions]);
  const compHard = useMemo(() => questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard'), [questions]);

  const compEasySolved = useMemo(() => compEasy.filter(q => q?.slug && solved[q.slug]?.done).length, [compEasy, solved]);
  const compMedSolved = useMemo(() => compMed.filter(q => q?.slug && solved[q.slug]?.done).length, [compMed, solved]);
  const compHardSolved = useMemo(() => compHard.filter(q => q?.slug && solved[q.slug]?.done).length, [compHard, solved]);

  const compReadinessLevel = useMemo(() => {
    if (compReadinessPercent >= 65) return { label: 'Interview Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    if (compReadinessPercent >= 35) return { label: 'Competitive', color: 'text-[#2B7A78] bg-[#DEF2F1] border-[#3AAFA9]/40' };
    if (compReadinessPercent >= 15) return { label: 'Gaining Momentum', color: 'text-amber-800 bg-amber-50 border-amber-300' };
    return { label: 'Early Focus', color: 'text-slate-700 bg-slate-100 border-slate-300' };
  }, [compReadinessPercent]);

  // Company selection handlers
  const handleSelectCompany = (companyId) => {
    if (isMultiMode) {
      if (selectedCompanies.includes(companyId)) {
        if (selectedCompanies.length > 1) {
          setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
        }
      } else {
        setSelectedCompanies([...selectedCompanies, companyId]);
      }
    } else {
      setSelectedCompanies([companyId]);
      setIsExplorerOpen(false);
    }
  };

  const removeCompany = (companyId) => {
    if (selectedCompanies.length > 1) {
      setSelectedCompanies(selectedCompanies.filter(id => id !== companyId));
    }
  };

  // Quick bundle presets
  const applyPreset = (presetIds) => {
    setSelectedCompanies(presetIds);
    setIsMultiMode(true);
  };

  // Filter 660 companies in explorer modal
  const filteredAllCompanies = useMemo(() => {
    return companies.filter(comp => {
      if (selectedTier !== 'All' && comp.tier !== selectedTier) return false;
      if (companySearch.trim()) {
        const query = companySearch.toLowerCase().trim();
        return comp.name.toLowerCase().includes(query) || comp.id.toLowerCase().includes(query);
      }
      return true;
    });
  }, [companySearch, selectedTier, companies]);

  const activeCompanyNames = useMemo(() => {
    return selectedCompanies
      .map(id => companies.find(c => c.id === id)?.name || id)
      .join(', ');
  }, [selectedCompanies, companies]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <section className="text-center pt-6 pb-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md shadow-sm border border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9]/50 transition-all cursor-default">
            <SpiderLogo size={16} variant="icon-only" className="text-[#2B7A78] dark:text-[#3AAFA9]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
              SPYDEX RADAR · {selectedCompanies.length === 1 ? activeCompanyNames : `${selectedCompanies.length} COMPANIES MERGED`}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B7A78]"></span>
            </span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl mb-3 tracking-tight font-bold text-[#17252A] dark:text-[#F8FAFC] transition-colors">
          Company Interview Radar
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-3 font-normal transition-colors">
          Live interview questions pulled from GitHub. The list refreshes automatically when the source repository updates.
        </p>
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#2B7A78] dark:text-[#3AAFA9] mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {catalogLoading && !companies.length
              ? 'Syncing company list from GitHub...'
              : `${companies.length} companies · ${updatedAt ? new Date(updatedAt).toLocaleDateString() : 'live'}`}
          </span>
          <button
            type="button"
            onClick={() => refresh()}
            className="underline hover:no-underline cursor-pointer"
          >
            Refresh
          </button>
        </div>
        {catalogError && (
          <p className="text-xs text-rose-600 mb-4">{catalogError}</p>
        )}

        {/* Mode Toggle: Single vs Multi-Company */}
        <div className="inline-flex items-center p-1 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-sm mb-2">
          <button
            onClick={() => {
              setIsMultiMode(false);
              if (selectedCompanies.length > 1) setSelectedCompanies([selectedCompanies[0]]);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              !isMultiMode
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
            }`}
          >
            Single Target
          </button>
          <button
            onClick={() => setIsMultiMode(true)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isMultiMode
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-sm">checklist</span>
            <span>Multi-Company Merge</span>
          </button>
        </div>
      </section>

      {/* Selected Company Tags (in Multi-mode) */}
      {isMultiMode && (
        <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-[#FEFFFF]/85 dark:bg-[#182226]/90 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#17252A] dark:text-[#F8FAFC] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-[#2B7A78] dark:text-[#3AAFA9]">layers</span>
              <span>Active Target Companies ({selectedCompanies.length}):</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => applyPreset(['google', 'meta', 'amazon', 'apple', 'netflix', 'microsoft'])}
                className="text-[11px] font-semibold text-[#2B7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer"
              >
                + FAANG
              </button>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <button
                onClick={() => applyPreset(['openai', 'anthropic', 'nvidia', 'databricks'])}
                className="text-[11px] font-semibold text-[#2B7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer"
              >
                + AI Giants
              </button>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <button
                onClick={() => applyPreset(['bloomberg', 'goldman-sachs', 'citadel', 'jane-street', 'stripe'])}
                className="text-[11px] font-semibold text-[#2B7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer"
              >
                + Quant/Fintech
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 items-center">
            {selectedCompanies.map(id => {
              const comp = companies.find(c => c.id === id) || { name: id };
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20"
                >
                  <span>{comp.name}</span>
                  {selectedCompanies.length > 1 && (
                    <button
                      onClick={() => removeCompany(id)}
                      className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-[#2B7A78] hover:text-white transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              );
            })}

            <button
              onClick={() => setIsExplorerOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-[#202C32] border border-dashed border-[#3AAFA9] text-[#2B7A78] dark:text-[#3AAFA9] hover:bg-[#DEF2F1]/50 dark:hover:bg-[#26353D] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Company</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Company Selection Chips + "Browse All 660+" Button */}
      <div className="max-w-4xl mx-auto w-full space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="font-bold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
            {isMultiMode ? 'Toggle Companies' : 'Select Target Company'}
          </span>
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="flex items-center gap-1 text-[#2B7A78] dark:text-[#3AAFA9] font-bold hover:underline cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">search</span>
            <span>Search &amp; Browse All Companies</span>
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {/* Browse All Button in row */}
          <button
            onClick={() => setIsExplorerOpen(true)}
            className="px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-[#17252A] dark:bg-[#26353D] text-white shadow-sm hover:bg-[#2B7A78] dark:hover:bg-[#3AAFA9] shrink-0"
          >
            <span className="material-symbols-outlined text-sm">travel_explore</span>
            <span>All {companies.length || '…'}</span>
          </button>

          {topCompanies.map(company => {
            const isSelected = selectedCompanies.includes(company.id);
            return (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] border-transparent text-white shadow-md shadow-[#3AAFA9]/25 font-bold'
                    : 'bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-md border-[#DEF2F1] dark:border-[#2D3E47] text-gray-600 dark:text-gray-300 hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9] hover:text-[#2B7A78] dark:hover:text-[#3AAFA9]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{company.logo}</span>
                <span>{company.name}</span>
                {isMultiMode && isSelected && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeframe & Filter Controls */}
      <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] max-w-4xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Timeframe Pills */}
          <div className="flex items-center p-1 bg-[#DEF2F1]/50 dark:bg-[#202C32]/60 border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full w-full sm:w-auto overflow-x-auto no-scrollbar">
            {TIMEFRAMES.map(tf => {
              const isSelected = selectedTimeframe === tf.id;
              return (
                <button
                  key={tf.id}
                  onClick={() => setSelectedTimeframe(tf.id)}
                  className={`px-2.5 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
                  }`}
                >
                  {tf.label}
                </button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center justify-center p-1 bg-[#DEF2F1]/50 dark:bg-[#202C32]/60 border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full self-center sm:self-auto">
            {['all', 'Easy', 'Medium', 'Hard'].map(d => {
              const isSelected = difficultyFilter === d;
              return (
                <button
                  key={d}
                  onClick={() => setDifficultyFilter(d)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#17252A] dark:bg-[#3AAFA9] text-white dark:text-[#12181C] shadow-sm font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
                  }`}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${isMultiMode ? 'merged' : activeCompanyNames} questions by name, #ID...`}
            className="w-full h-11 pl-11 pr-10 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-full text-xs font-medium focus:outline-none focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-time Company Readiness Index Card */}
      <div className="bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] max-w-4xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#2B7A78] to-[#3AAFA9] text-white flex items-center justify-center shadow-md shadow-[#3AAFA9]/20 shrink-0">
              <span className="material-symbols-outlined text-2xl">psychology</span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">
                  {activeCompanyNames} Readiness Index
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${compReadinessLevel.color}`}>
                  {compReadinessLevel.label}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Live interview readiness based on your solved problem telemetry
              </p>
            </div>
          </div>

          <div className="flex items-baseline gap-2 self-start sm:self-auto">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#17252A] dark:text-[#F8FAFC] font-body tracking-tight">
              {compReadinessPercent}%
            </span>
            <span className="text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9]">
              ({compSolvedCount} / {compTotalCount} Solved)
            </span>
          </div>
        </div>

        {/* Dynamic Animated Progress Bar */}
        <div className="w-full h-2.5 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, compReadinessPercent)}%` }}
          />
        </div>

        {/* Difficulty Breakdown Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-0.5">
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Easy: {compEasySolved} / {compEasy.length}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Medium: {compMedSolved} / {compMed.length}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            <span>Hard: {compHardSolved} / {compHard.length}</span>
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-4xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2 font-medium">
          <span>
            {filteredQuestions.length} Questions for {isMultiMode ? `${selectedCompanies.length} Companies` : activeCompanyNames}
          </span>
          <span>Sorted by Frequency · Sinks Solved</span>
        </div>

        {isLoading || (catalogLoading && questions.length === 0) ? (
          <div className="p-16 text-center bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-3">
            <span className="material-symbols-outlined text-4xl text-[#3AAFA9] animate-spin">
              progress_activity
            </span>
            <p className="text-sm font-semibold text-[#17252A] dark:text-[#F8FAFC]">Loading questions from GitHub...</p>
          </div>
        ) : catalogError && questions.length === 0 ? (
          <div className="p-16 text-center bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-3">
            <span className="material-symbols-outlined text-4xl text-rose-300">cloud_off</span>
            <h3 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC]">Could not reach GitHub</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{catalogError}</p>
            <button type="button" onClick={() => refresh()} className="btn-brand text-xs !py-2 !px-4 cursor-pointer">
              Retry sync
            </button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-16 text-center bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-3">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
            <h3 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC]">No questions match filters</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Try choosing a different timeframe, company, or clearing search.</p>
          </div>
        ) : (
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] divide-y divide-[#DEF2F1]/50 dark:divide-[#2D3E47]/60">
            {filteredQuestions.map((q, idx) => {
              const slug = q.slug || `problem-${q.id || idx}`;
              const isDone = Boolean(solved[slug]?.done);
              const hasNote = Boolean(notes[slug]);

              const diffBadge = q.difficulty === 'Easy'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                : q.difficulty === 'Medium'
                ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';

              return (
                <div
                  key={`${q.id || idx}_${slug}`}
                  className={`py-3 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-3 group transition-opacity ${
                    isDone ? 'opacity-50 bg-gray-50/40 dark:bg-[#151D22]/40 rounded-xl px-2' : ''
                  }`}
                >
                  {/* Checkbox & Name */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none py-0.5">
                      <input
                        type="checkbox"
                        checked={!!isDone}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleSolved(slug);
                        }}
                        className="w-4 h-4 rounded text-[#3AAFA9] focus:ring-[#3AAFA9] border-gray-300 dark:border-gray-600 cursor-pointer shrink-0 accent-[#3AAFA9]"
                      />
                      <span className="font-mono text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        #{String(q.num || q.id || idx + 1).padStart(4, '0')}
                      </span>
                    </label>
                    <div className="min-w-0 flex-1">
                      <a
                        href={q.url || `https://leetcode.com/problems/${q.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs sm:text-sm font-semibold truncate hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors block ${
                          isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#17252A] dark:text-[#F8FAFC]'
                        }`}
                      >
                        {q.title || q.name}
                      </a>
                      {/* Company Tags for multi-mode */}
                      {q.companies && q.companies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {q.companies.map((cName, cIdx) => (
                            <span key={cIdx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#202C32] text-slate-600 dark:text-slate-300 font-medium">
                              {cName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Badges & Metrics */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Frequency Pill */}
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-[10px] font-bold border border-[#DEF2F1] dark:border-[#2D3E47]">
                      <span className="material-symbols-outlined text-xs">trending_up</span>
                      <span>{q.frequency}%</span>
                    </span>

                    {/* ZeroTrac Rating Badge */}
                    <span className="hidden xs:inline-flex px-2 sm:px-2.5 py-0.5 rounded-full bg-[#DEF2F1]/80 dark:bg-[#202C32]/80 text-[#2B7A78] dark:text-[#3AAFA9] text-[10px] font-bold font-mono border border-[#DEF2F1] dark:border-[#2D3E47]">
                      ★ {q.rating}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${diffBadge}`}>
                      {q.difficulty}
                    </span>

                    {/* Acceptance */}
                    {q.acceptance && (
                      <span className="hidden md:inline-flex text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {q.acceptance}
                      </span>
                    )}

                    {/* Note Button */}
                    <button
                      onClick={() => onOpenNotes && onOpenNotes(q)}
                      className={`p-1.5 rounded-full hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-colors cursor-pointer ${hasNote ? 'text-[#3AAFA9] dark:text-[#3AAFA9]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                      title={hasNote ? 'View Note' : 'Add Note'}
                    >
                      <span className="material-symbols-outlined text-base">sticky_note_2</span>
                    </button>

                    {/* LeetCode solve link */}
                    <a
                      href={q.url || `https://leetcode.com/problems/${q.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-colors"
                      title="Solve on LeetCode"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= 660+ COMPANY EXPLORER MODAL ================= */}
      {isExplorerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsExplorerOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#FEFFFF] dark:bg-[#182226] rounded-3xl shadow-[0_25px_60px_rgba(23,37,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#DEF2F1] dark:border-[#2D3E47] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEF2F1] dark:border-[#2D3E47] bg-[#DEF2F1]/30 dark:bg-[#202C32]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#2B7A78] dark:text-[#3AAFA9] text-2xl">travel_explore</span>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#17252A] dark:text-[#F8FAFC]">
                    Select Tech Companies
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {companies.length} companies from GitHub{sha ? ` · ${sha.slice(0, 7)}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExplorerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#17252A] dark:hover:text-[#F8FAFC] hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Modal Controls: Search & Category Filter */}
            <div className="p-4 border-b border-[#DEF2F1] dark:border-[#2D3E47] space-y-3 bg-[#FEFFFF] dark:bg-[#182226]">
              {/* Search Bar */}
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg">
                  search
                </span>
                <input
                  type="text"
                  autoFocus
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  placeholder="Search companies from GitHub... (e.g. OpenAI, Nvidia, Citadel, Tesla)"
                  className="w-full h-10 pl-10 pr-9 bg-slate-50 dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-xl text-xs font-medium focus:outline-none focus:border-[#3AAFA9] focus:bg-white dark:focus:bg-[#202C32] transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                {companySearch && (
                  <button
                    onClick={() => setCompanySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {COMPANY_TIERS.map(tier => {
                  const isSelected = selectedTier === tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-[#2B7A78] text-white shadow-sm font-bold'
                          : 'bg-slate-100 dark:bg-[#202C32] text-gray-600 dark:text-gray-300 hover:bg-[#DEF2F1] dark:hover:bg-[#2D3E47] hover:text-[#2B7A78] dark:hover:text-[#3AAFA9]'
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-2 bg-slate-50 dark:bg-[#151D22] border-b border-[#DEF2F1] dark:border-[#2D3E47] text-[11px] text-gray-500 dark:text-gray-400 font-mono">
              <span>Showing <strong className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold">{filteredAllCompanies.length}</strong> of {companies.length} companies</span>
              {selectedTier !== 'All' && <span className="text-[#2B7A78] dark:text-[#3AAFA9]">Tier: <strong>{selectedTier}</strong></span>}
            </div>

            {/* Companies Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredAllCompanies.map(comp => {
                  const isSelected = selectedCompanies.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectCompany(comp.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#DEF2F1] dark:bg-[#202C32] border-[#2B7A78] dark:border-[#3AAFA9] shadow-sm ring-1 ring-[#2B7A78] dark:ring-[#3AAFA9]'
                          : 'bg-white dark:bg-[#202C32]/60 border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="material-symbols-outlined text-sm text-[#2B7A78] dark:text-[#3AAFA9]">{comp.logo}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-[#2B7A78] text-white' : 'bg-slate-100 dark:bg-[#151D22] text-slate-500 dark:text-slate-400'
                        }`}>
                          {comp.tier}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#17252A] dark:text-[#F8FAFC] truncate">
                        {comp.name}
                      </div>
                      {isMultiMode && (
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
                          <span>{isSelected ? 'Selected' : 'Click to add'}</span>
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
                            isSelected ? 'bg-[#2B7A78] border-[#2B7A78] text-white' : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredAllCompanies.length === 0 && (
                <div className="p-12 text-center text-gray-400 dark:text-gray-500 text-xs">
                  No companies found matching "{companySearch}".
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DEF2F1] dark:border-[#2D3E47] bg-[#DEF2F1]/20 dark:bg-[#202C32]/40 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedCompanies.length} compan{selectedCompanies.length === 1 ? 'y' : 'ies'} selected
              </span>
              <button
                onClick={() => setIsExplorerOpen(false)}
                className="btn-brand text-xs !py-2 !px-5 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
