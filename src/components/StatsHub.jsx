import { useState, useMemo, useEffect } from 'react';
import { PROBLEMS } from '../data/problems';
import { 
  ALL_COMPANIES, 
  TOP_COMPANIES, 
  COMPANY_TIERS, 
  TIMEFRAMES, 
  fetchCompanyQuestions 
} from '../data/companyService';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import SpiderLogo from './SpiderLogo';
import COMPANY_QUESTION_MAP from '../data/companyQuestionMap.json';

export default function StatsHub() {
  const { solved, streak, bestStreak, syncCloud, toggleSolved } = useProgress();
  const { cloudSyncStatus } = useAuth();

  // Mode switcher: 'guardians' | 'company'
  const [scope, setScope] = useState('guardians');

  const [isSyncing, setIsSyncing] = useState(false);

  // Company mode state
  const [selectedCompany, setSelectedCompany] = useState('google');
  const [companyTimeframe, setCompanyTimeframe] = useState('thirty-days');
  const [companyQuestions, setCompanyQuestions] = useState([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);

  // 660+ Company Explorer Modal in StatsHub
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  // Matrix category filter
  const [matrixFilter, setMatrixFilter] = useState('All');
  const [matrixSearch, setMatrixSearch] = useState('');

  // Load company questions when in company mode
  useEffect(() => {
    if (scope !== 'company') return;
    let isCurrent = true;
    setIsCompanyLoading(true);

    fetchCompanyQuestions(selectedCompany, companyTimeframe)
      .then(data => {
        if (isCurrent) {
          setCompanyQuestions(Array.isArray(data) ? data : []);
          setIsCompanyLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching company telemetry questions:', err);
        if (isCurrent) {
          const fallback = PROBLEMS.filter(p =>
            p.company && p.company.toLowerCase().includes(selectedCompany.toLowerCase())
          );
          setCompanyQuestions(fallback);
          setIsCompanyLoading(false);
        }
      });

    return () => { isCurrent = false; };
  }, [scope, selectedCompany, companyTimeframe]);

  // --- 100% REAL-TIME GUARDIANS STATS ---
  const guardiansTotal = PROBLEMS.length;
  const guardiansSolved = useMemo(() => {
    return PROBLEMS.filter(p => Boolean(solved[p.slug]?.done)).length;
  }, [solved]);

  const allSolvedCount = useMemo(() => {
    return Object.values(solved).filter(s => s?.done).length;
  }, [solved]);

  const easyTotal = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Easy').length, []);
  const medTotal = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Medium').length, []);
  const hardTotal = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Hard').length, []);

  const easySolved = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Easy' && solved[p.slug]?.done).length, [solved]);
  const medSolved = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Medium' && solved[p.slug]?.done).length, [solved]);
  const hardSolved = useMemo(() => PROBLEMS.filter(p => p.difficulty === 'Hard' && solved[p.slug]?.done).length, [solved]);

  const easyRatio = guardiansSolved > 0 ? (easySolved / guardiansSolved) : 0;
  const medRatio = guardiansSolved > 0 ? (medSolved / guardiansSolved) : 0;
  const hardRatio = guardiansSolved > 0 ? (hardSolved / guardiansSolved) : 0;

  // Real-time Solved This Week
  const solvedThisWeek = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000;
    return Object.values(solved).filter(s => {
      if (!s?.done || !s?.solvedAt) return false;
      const t = new Date(s.solvedAt).getTime();
      return !isNaN(t) && t >= weekAgo;
    }).length;
  }, [solved]);

  // Real-time Solved Today
  const solvedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return Object.values(solved).filter(s => {
      if (!s?.done || !s?.solvedAt) return false;
      return s.solvedAt.startsWith(todayStr);
    }).length;
  }, [solved]);

  // Real-time Unique Active Study Days
  const totalActiveDays = useMemo(() => {
    const dateSet = new Set();
    Object.values(solved).forEach(s => {
      if (s?.done && s?.solvedAt) {
        dateSet.add(s.solvedAt.split('T')[0]);
      }
    });
    return dateSet.size;
  }, [solved]);

  const completionPercent = guardiansTotal > 0
    ? (guardiansSolved > 0
        ? Math.max(0.1, Math.round((guardiansSolved / guardiansTotal) * 1000) / 10)
        : 0)
    : 0;

  // Real-time 12-Week Activity Heatmap (Calculated from genuine solvedAt dates)
  const { heatmapWeeks, totalHeatmapCount } = useMemo(() => {
    const today = new Date();
    const countsByDate = {};
    let totalCount = 0;

    Object.values(solved).forEach(s => {
      if (s?.done && s?.solvedAt) {
        const dStr = s.solvedAt.split('T')[0];
        countsByDate[dStr] = (countsByDate[dStr] || 0) + 1;
      }
    });

    const weeks = [];
    for (let w = 11; w >= 0; w--) {
      const days = [];
      for (let d = 6; d >= 0; d--) {
        const dayOffset = w * 7 + d;
        const dayDate = new Date(today.getTime() - dayOffset * 86400000);
        const dateStr = dayDate.toISOString().split('T')[0];
        const count = countsByDate[dateStr] || 0;
        totalCount += count;
        const level = count >= 6 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0;
        days.push({
          dateStr,
          formattedDate: dayDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
          count,
          level
        });
      }
      weeks.push(days);
    }
    return { heatmapWeeks: weeks, totalHeatmapCount: totalCount };
  }, [solved]);

  // --- 100% REAL-TIME COMPANY STATS ---
  const currentCompanyObj = useMemo(() => {
    return ALL_COMPANIES.find(c => c.id === selectedCompany) || { id: selectedCompany, name: selectedCompany, tier: 'Tech' };
  }, [selectedCompany]);

  const visibleCompanyChips = useMemo(() => {
    const top = TOP_COMPANIES.slice(0, 24);
    const exists = top.some(c => c.id === selectedCompany);
    if (!exists) {
      const current = ALL_COMPANIES.find(c => c.id === selectedCompany) || {
        id: selectedCompany,
        name: selectedCompany.charAt(0).toUpperCase() + selectedCompany.slice(1),
        tier: 'Tech'
      };
      return [current, ...top];
    }
    return top;
  }, [selectedCompany]);

  const compTotalCount = companyQuestions.length;
  const compSolvedCount = useMemo(() => {
    return companyQuestions.filter(q => q?.slug && solved[q.slug]?.done).length;
  }, [companyQuestions, solved]);

  const compSolvedPercent = compTotalCount > 0
    ? (compSolvedCount > 0
        ? Math.max(0.1, Math.round((compSolvedCount / compTotalCount) * 1000) / 10)
        : 0)
    : 0;

  const compEasy = useMemo(() => companyQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'easy'), [companyQuestions]);
  const compMed = useMemo(() => companyQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'medium'), [companyQuestions]);
  const compHard = useMemo(() => companyQuestions.filter(q => (q.difficulty || '').toLowerCase() === 'hard'), [companyQuestions]);

  const compEasySolved = useMemo(() => compEasy.filter(q => q?.slug && solved[q.slug]?.done).length, [compEasy, solved]);
  const compMedSolved = useMemo(() => compMed.filter(q => q?.slug && solved[q.slug]?.done).length, [compMed, solved]);
  const compHardSolved = useMemo(() => compHard.filter(q => q?.slug && solved[q.slug]?.done).length, [compHard, solved]);

  const compEasyRatio = compSolvedCount > 0 ? (compEasySolved / compSolvedCount) : 0;
  const compMedRatio = compSolvedCount > 0 ? (compMedSolved / compSolvedCount) : 0;
  const compHardRatio = compSolvedCount > 0 ? (compHardSolved / compSolvedCount) : 0;

  const topFrequencyQuestions = useMemo(() => {
    return [...companyQuestions].sort((a, b) => (b.frequency || 0) - (a.frequency || 0)).slice(0, 20);
  }, [companyQuestions]);

  const topFreqSolved = useMemo(() => {
    return topFrequencyQuestions.filter(q => q?.slug && solved[q.slug]?.done).length;
  }, [topFrequencyQuestions, solved]);

  const compReadinessLevel = useMemo(() => {
    if (compSolvedPercent >= 65) return { label: 'Interview Ready', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (compSolvedPercent >= 35) return { label: 'Competitive', color: 'text-[#2B7A78] bg-[#DEF2F1] border-[#3AAFA9]/30' };
    if (compSolvedPercent >= 15) return { label: 'Gaining Momentum', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Early Focus', color: 'text-slate-600 bg-slate-100 border-slate-200' };
  }, [compSolvedPercent]);

  // Real-time high priority unsolved interview questions for this company
  const priorityUnsolved = useMemo(() => {
    return companyQuestions
      .filter(q => !(q?.slug && solved[q.slug]?.done))
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 5);
  }, [companyQuestions, solved]);

  // Real-time Company Readiness Matrix across top companies
  const companyReadinessMatrix = useMemo(() => {
    const list = ALL_COMPANIES.slice(0, 36);
    return list.map(comp => {
      const companySlugs = COMPANY_QUESTION_MAP[comp.id] || [];
      const total = companySlugs.length > 0 ? companySlugs.length : 30;
      let countSolved = 0;

      if (companySlugs.length > 0) {
        countSolved = companySlugs.filter(slug => solved[slug]?.done).length;
      } else {
        const matched = PROBLEMS.filter(p =>
          p.company && (
            p.company.toLowerCase() === comp.name.toLowerCase() ||
            p.company.toLowerCase() === comp.id.toLowerCase()
          )
        );
        countSolved = matched.filter(p => solved[p.slug]?.done).length;
      }

      const pct = total > 0
        ? (countSolved > 0
            ? Math.max(0.1, Math.round((countSolved / total) * 1000) / 10)
            : 0)
        : 0;
      return {
        ...comp,
        total,
        solved: countSolved,
        percentage: pct
      };
    }).filter(c => {
      if (matrixFilter !== 'All' && c.tier !== matrixFilter) return false;
      if (matrixSearch.trim()) {
        const q = matrixSearch.toLowerCase().trim();
        return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [solved, matrixFilter, matrixSearch]);

  // Filter 660 companies in explorer modal
  const filteredAllCompanies = useMemo(() => {
    return ALL_COMPANIES.filter(comp => {
      if (selectedTier !== 'All' && comp.tier !== selectedTier) return false;
      if (companySearch.trim()) {
        const query = companySearch.toLowerCase().trim();
        return comp.name.toLowerCase().includes(query) || comp.id.toLowerCase().includes(query);
      }
      return true;
    });
  }, [companySearch, selectedTier]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncCloud();
    setTimeout(() => setIsSyncing(false), 900);
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <section className="text-center pt-6 pb-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md shadow-sm border border-[#DEF2F1] dark:border-[#2D3E47] hover:shadow-md transition-all cursor-default">
            <SpiderLogo size={16} variant="icon-only" className="text-[#2B7A78] dark:text-[#3AAFA9]" />
            <span className="text-xs font-semibold text-[#17252A] dark:text-[#CBD5E1]">
              {scope === 'guardians' ? 'Guardians 596 Curriculum Telemetry' : `Company Radar · ${currentCompanyObj.name}`}
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B7A78]"></span>
            </span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl mb-3 tracking-tight font-bold text-[#17252A] dark:text-[#F8FAFC] transition-colors">
          {scope === 'guardians' ? 'Performance & Velocity.' : 'Company Prep Telemetry.'}
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-6 font-normal transition-colors">
          {scope === 'guardians'
            ? 'Live tracking across your 596 Guardians Sheet progress, active streaks, and genuine practice activity.'
            : 'Live interview question completion rates and difficulty distribution across 660+ tech companies.'}
        </p>

        {/* Primary Scope Selector: Guardians Sheet vs Company-Wise */}
        <div className="inline-flex items-center p-1.5 bg-[#FEFFFF]/95 dark:bg-[#182226]/95 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-2xl shadow-sm gap-1 mb-4">
          <button
            onClick={() => setScope('guardians')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scope === 'guardians'
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-md shadow-[#2B7A78]/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1]/40 dark:hover:bg-[#202C32]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">shield</span>
            <span>Guardians List (596)</span>
          </button>

          <button
            onClick={() => setScope('company')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              scope === 'company'
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-md shadow-[#2B7A78]/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1]/40 dark:hover:bg-[#202C32]/60'
            }`}
          >
            <span className="material-symbols-outlined text-base">corporate_fare</span>
            <span>Company-Wise Radar</span>
          </button>
        </div>

        {/* Company Sub-selectors */}
        {scope === 'company' && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 px-2 no-scrollbar">
              <button
                onClick={() => setIsExplorerOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 bg-[#17252A] dark:bg-[#202C32] text-white shadow-sm hover:bg-[#2B7A78] dark:hover:bg-[#3AAFA9]"
              >
                <span className="material-symbols-outlined text-sm">search</span>
                <span>All 660+</span>
              </button>

              {visibleCompanyChips.map(comp => {
                const isSelected = selectedCompany === comp.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompany(comp.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2B7A78] text-white shadow-sm font-bold'
                        : 'bg-[#FEFFFF] dark:bg-[#182226]/80 text-gray-600 dark:text-gray-300 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1]/60 dark:hover:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47]'
                    }`}
                  >
                    <span>{comp.name}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-[#151D22] text-gray-500 dark:text-gray-400'}`}>
                      {comp.tier}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="inline-flex items-center p-1 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-sm">
              {TIMEFRAMES.map(t => {
                const isSelected = companyTimeframe === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setCompanyTimeframe(t.id)}
                    className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                        : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ================= GUARDIANS MODE VIEW ================= */}
      {scope === 'guardians' && (
        <>
          {/* 4 KPI Metric Cards (100% Real-Time) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Metric 1: Total Guardians Solved */}
            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Guardians Solved</span>
                <span className="material-symbols-outlined text-[#3AAFA9] dark:text-[#3AAFA9] text-base sm:text-lg">task_alt</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight font-body">
                {guardiansSolved}
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {guardiansTotal}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9]">
                <span>+{solvedThisWeek} this week</span>
              </div>
            </div>

            {/* Metric 2: Completion Rate */}
            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Completion</span>
                <span className="material-symbols-outlined text-[#3AAFA9] dark:text-[#3AAFA9] text-base sm:text-lg">verified</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight font-body">
                {completionPercent}%
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>{allSolvedCount} total solved</span>
              </div>
            </div>

            {/* Metric 3: Real Consecutive Streak */}
            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Current Streak</span>
                <span className="material-symbols-outlined text-orange-500 text-base sm:text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 tracking-tight font-body">
                {streak} {streak === 1 ? 'day' : 'days'}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="text-orange-400 font-bold">★</span>
                <span>Best: {bestStreak} {bestStreak === 1 ? 'day' : 'days'}</span>
              </div>
            </div>

            {/* Metric 4: Active Study Days */}
            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Active Days</span>
                <span className="material-symbols-outlined text-[#3AAFA9] dark:text-[#3AAFA9] text-base sm:text-lg">calendar_today</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight font-body">
                {totalActiveDays} {totalActiveDays === 1 ? 'day' : 'days'}
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>{solvedToday} solved today</span>
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown Donut Card */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">Guardians Difficulty Distribution</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Live breakdown of problems solved across 596 curated challenges</p>
              </div>
              <span className="text-xs font-bold text-[#2B7A78] dark:text-[#3AAFA9] bg-[#DEF2F1] dark:bg-[#202C32] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 px-3 py-1 rounded-full">
                {guardiansSolved} / {guardiansTotal} Solved
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" className="text-[#DEF2F1] dark:text-[#26353D]" strokeWidth="12" />
                  {guardiansSolved > 0 && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#10b981"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - easyRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                      <circle
                        className="origin-center rotate-[114deg]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#f59e0b"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - medRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                      <circle
                        className="origin-center rotate-[296deg]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#f43f5e"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - hardRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[#17252A] dark:text-[#F8FAFC]">{guardiansSolved}</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">SOLVED</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Easy Problems</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{easySolved} / {easyTotal}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Medium Problems</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{medSolved} / {medTotal}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${medTotal > 0 ? (medSolved / medTotal) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Hard Problems</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{hardSolved} / {hardTotal}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 12-Week Genuine Activity Heatmap */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">Activity Heatmap</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{totalHeatmapCount} practice solves recorded in the last 12 weeks</p>
              </div>
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-[#DEF2F1]/60 dark:bg-[#202C32] px-3 py-1 rounded-full border border-[#DEF2F1] dark:border-[#2D3E47]">
                Last 12 Wks
              </span>
            </div>

            <div className="w-full overflow-x-auto pb-2 no-scrollbar">
              <div className="inline-flex gap-1.5 min-w-[540px] sm:min-w-full justify-between">
                {heatmapWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1.5">
                    {week.map((day, dIdx) => {
                      const bgClass = day.level === 4 
                        ? 'bg-[#2B7A78] dark:bg-[#3AAFA9]' 
                        : day.level === 3 
                        ? 'bg-[#3AAFA9] dark:bg-[#2B7A78]' 
                        : day.level === 2 
                        ? 'bg-[#7fcbc7] dark:bg-[#245b58]' 
                        : day.level === 1 
                        ? 'bg-[#DEF2F1] dark:bg-[#16383B]' 
                        : 'bg-slate-100 dark:bg-[#202C32]';
                      return (
                        <span 
                          key={dIdx}
                          title={`${day.formattedDate}: ${day.count} solved`}
                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] ${bgClass} transition-colors cursor-pointer hover:ring-1 hover:ring-[#2B7A78] dark:hover:ring-[#3AAFA9]`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
              <span>Continuous study rhythm</span>
              <div className="flex items-center gap-1.5">
                <span>0 solves</span>
                <span className="w-3 h-3 rounded-[3px] bg-slate-100 dark:bg-[#202C32]" />
                <span className="w-3 h-3 rounded-[3px] bg-[#DEF2F1] dark:bg-[#16383B]" />
                <span className="w-3 h-3 rounded-[3px] bg-[#7fcbc7] dark:bg-[#245b58]" />
                <span className="w-3 h-3 rounded-[3px] bg-[#3AAFA9] dark:bg-[#2B7A78]" />
                <span className="w-3 h-3 rounded-[3px] bg-[#2B7A78] dark:bg-[#3AAFA9]" />
                <span>6+ solves</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= COMPANY-WISE MODE VIEW ================= */}
      {scope === 'company' && (
        <>
          {/* Company Selected KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">{currentCompanyObj.name} Solved</span>
                <span className="material-symbols-outlined text-[#3AAFA9] dark:text-[#3AAFA9] text-base sm:text-lg">domain</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight font-body">
                {compSolvedCount}
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {compTotalCount}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9]">
                <span>{compSolvedPercent}% complete</span>
              </div>
            </div>

            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Interview Readiness</span>
                <span className="material-symbols-outlined text-[#3AAFA9] dark:text-[#3AAFA9] text-base sm:text-lg">psychology</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight">
                {compSolvedPercent}%
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${compReadinessLevel.color}`}>
                  {compReadinessLevel.label}
                </span>
              </div>
            </div>

            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Top 20 Frequent</span>
                <span className="material-symbols-outlined text-amber-500 text-base sm:text-lg">whatshot</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 tracking-tight font-body">
                {topFreqSolved}
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {Math.min(20, compTotalCount)}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Must-know questions</span>
              </div>
            </div>

            <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 dark:text-gray-500 mb-2">
                <span className="text-[10px] uppercase tracking-wider font-bold">Hard Questions</span>
                <span className="material-symbols-outlined text-rose-500 text-base sm:text-lg">military_tech</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-rose-600 dark:text-rose-400 tracking-tight font-body">
                {compHardSolved}
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal"> / {compHard.length}</span>
              </div>
              <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>Bar raiser level</span>
              </div>
            </div>
          </div>

          {/* Company Difficulty Distribution */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">{currentCompanyObj.name} Difficulty Breakdown</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isCompanyLoading ? 'Calibrating company questions...' : `Live telemetry for ${currentCompanyObj.name} interview questions`}
                </p>
              </div>
              <span className="text-xs font-bold text-[#2B7A78] dark:text-[#3AAFA9] bg-[#DEF2F1] dark:bg-[#202C32] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 px-3 py-1 rounded-full">
                {compSolvedCount} / {compTotalCount} Solved
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="transparent" r="40" stroke="currentColor" className="text-[#DEF2F1] dark:text-[#26353D]" strokeWidth="12" />
                  {compSolvedCount > 0 && (
                    <>
                      <circle
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#10b981"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - compEasyRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                      <circle
                        className="origin-center rotate-[114deg]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#f59e0b"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - compMedRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                      <circle
                        className="origin-center rotate-[296deg]"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="#f43f5e"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - compHardRatio)}
                        strokeLinecap="round"
                        strokeWidth="12"
                      />
                    </>
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[#17252A] dark:text-[#F8FAFC]">{compSolvedCount}</span>
                  <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">SOLVED</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-3.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Easy Questions</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{compEasySolved} / {compEasy.length}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${compEasy.length > 0 ? (compEasySolved / compEasy.length) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <span>Medium Questions</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{compMedSolved} / {compMed.length}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${compMed.length > 0 ? (compMedSolved / compMed.length) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Hard Questions</span>
                    </span>
                    <span className="text-[#17252A] dark:text-[#F8FAFC] font-mono">{compHardSolved} / {compHard.length}</span>
                  </div>
                  <div className="w-full h-2 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${compHard.length > 0 ? (compHardSolved / compHard.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Companies Readiness Matrix Grid */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">Company Readiness Matrix</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Compare your real-time algorithmic readiness across tech employers</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={matrixSearch}
                  onChange={e => setMatrixSearch(e.target.value)}
                  placeholder="Filter matrix..."
                  className="px-3 py-1 text-xs bg-slate-50 dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl focus:outline-none focus:border-[#3AAFA9]"
                />
                <select
                  value={matrixFilter}
                  onChange={e => setMatrixFilter(e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] rounded-xl focus:outline-none focus:border-[#3AAFA9] text-gray-700 dark:text-gray-200 cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="FAANG">FAANG</option>
                  <option value="AI & Frontier">AI & Frontier</option>
                  <option value="Fintech / Quant">Fintech / Quant</option>
                  <option value="Big Tech">Big Tech</option>
                  <option value="Indian Tech">Indian Tech</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {companyReadinessMatrix.map(c => {
                const isSelected = selectedCompany === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCompany(c.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DEF2F1]/60 dark:bg-[#202C32] border-[#2B7A78] dark:border-[#3AAFA9] shadow-md ring-1 ring-[#2B7A78] dark:ring-[#3AAFA9]'
                        : 'bg-[#FEFFFF]/70 dark:bg-[#202C32]/60 border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9]/50 dark:hover:bg-[#26353D] hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#17252A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#2B7A78] dark:text-[#3AAFA9]">{c.logo || 'corporate_fare'}</span>
                        {c.name}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{c.tier}</span>
                    </div>

                    <div className="flex items-baseline justify-between text-xs mb-1.5">
                      <span className="font-mono text-gray-600 dark:text-gray-400">{c.solved} / {c.total} solved</span>
                      <span className="font-bold text-[#2B7A78] dark:text-[#3AAFA9]">{c.percentage}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-[#DEF2F1] dark:bg-[#26353D] rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] h-full rounded-full transition-all duration-300"
                        style={{ width: `${c.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended High-Priority Unsolved Questions */}
          {priorityUnsolved.length > 0 && (
            <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">High-Yield Questions for {currentCompanyObj.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Unsolved high-frequency problems frequently asked in recent interviews</p>
                </div>
                <span className="text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9] bg-[#DEF2F1] dark:bg-[#202C32] px-3 py-1 rounded-full border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20">
                  Top Priority
                </span>
              </div>

              <div className="divide-y divide-[#DEF2F1]/60 dark:divide-[#2D3E47]/60">
                {priorityUnsolved.map((q, idx) => {
                  const diffColor = 
                    (q.difficulty || '').toLowerCase() === 'easy'
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                      : (q.difficulty || '').toLowerCase() === 'medium'
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                      : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';

                  return (
                    <div key={q.slug || idx} className="py-3 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <label className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={Boolean(solved[q.slug]?.done)}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSolved(q.slug);
                            }}
                            className="w-4 h-4 rounded text-[#3AAFA9] focus:ring-[#3AAFA9] border-gray-300 dark:border-gray-600 cursor-pointer shrink-0 accent-[#3AAFA9]"
                            title="Mark problem as solved"
                          />
                          <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500 shrink-0 w-8">
                            #{q.num || idx + 1}
                          </span>
                        </label>
                        <div className="min-w-0">
                          <a
                            href={q.url || `https://leetcode.com/problems/${q.slug}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-[#17252A] dark:text-[#F8FAFC] hover:text-[#2B7A78] dark:hover:text-[#3AAFA9] transition-colors truncate block group-hover:underline"
                          >
                            {q.name || q.title}
                          </a>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${diffColor}`}>
                              {q.difficulty}
                            </span>
                            {q.frequency && (
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                                Freq: {q.frequency}%
                              </span>
                            )}
                            {q.rating && (
                              <span className="text-[10px] text-[#2B7A78] dark:text-[#3AAFA9] font-mono font-semibold">
                                ★ {q.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <a
                        href={q.url || `https://leetcode.com/problems/${q.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost !text-xs !py-1.5 !px-3 shrink-0 flex items-center gap-1 text-[#2B7A78] dark:text-[#3AAFA9] hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] cursor-pointer"
                      >
                        <span>Solve</span>
                        <span className="material-symbols-outlined text-xs">arrow_outward</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Cloud Backup & Sync Card */}
      <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-2xl">cloud_done</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC]">Cloud Progress Vault</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {cloudSyncStatus === 'synced' ? 'Cloud synced & secure' : 'Local cache active'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="btn-brand text-xs !py-2.5 !px-5 w-full sm:w-auto cursor-pointer"
        >
          <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
          <span>{isSyncing ? 'Syncing...' : 'Sync Vault Now'}</span>
        </button>
      </div>

      {/* ================= 660+ COMPANY EXPLORER MODAL IN STATSHUB ================= */}
      {isExplorerOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsExplorerOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-3xl bg-[#FEFFFF] dark:bg-[#182226] rounded-3xl shadow-[0_25px_60px_rgba(23,37,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#DEF2F1] dark:border-[#2D3E47] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#DEF2F1] dark:border-[#2D3E47] bg-[#DEF2F1]/30 dark:bg-[#202C32]/60">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#2B7A78] dark:text-[#3AAFA9] text-2xl">travel_explore</span>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-[#17252A] dark:text-[#F8FAFC]">
                    Select Target Company for Telemetry
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Choose from 660+ tech companies to evaluate your interview readiness
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

            <div className="p-4 border-b border-[#DEF2F1] dark:border-[#2D3E47] space-y-3 bg-[#FEFFFF] dark:bg-[#182226]">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg">
                  search
                </span>
                <input
                  type="text"
                  autoFocus
                  value={companySearch}
                  onChange={e => setCompanySearch(e.target.value)}
                  placeholder="Search 660+ companies... (e.g. OpenAI, Nvidia, Citadel, Tesla, Flipkart)"
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
              <span>Showing <strong className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold">{filteredAllCompanies.length}</strong> of {ALL_COMPANIES.length} companies</span>
              {selectedTier !== 'All' && <span className="text-[#2B7A78] dark:text-[#3AAFA9]">Tier: <strong>{selectedTier}</strong></span>}
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[55vh]">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {filteredAllCompanies.map(comp => {
                  const isSelected = selectedCompany === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedCompany(comp.id);
                        setIsExplorerOpen(false);
                      }}
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
          </div>
        </div>
      )}
    </div>
  );
}
