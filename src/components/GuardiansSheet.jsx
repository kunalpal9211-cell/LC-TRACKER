import { useState, useMemo, useEffect } from 'react';
import { PROBLEMS } from '../data/problems';
import { useProgress } from '../context/ProgressContext';
import SpiderLogo from './SpiderLogo';

export default function GuardiansSheet({ onOpenNotes }) {
  const { solved, toggleSolved, notes } = useProgress();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unsolved' | 'solved'
  const [sortOrder, setSortOrder] = useState('num-asc'); // 'num-asc' | 'smart' | 'diff-asc'
  const [randomProblem, setRandomProblem] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(60);

  // Difficulty counts
  const totalCount = PROBLEMS.length;
  const easyTotal = PROBLEMS.filter(p => p.difficulty === 'Easy').length;
  const medTotal = PROBLEMS.filter(p => p.difficulty === 'Medium').length;
  const hardTotal = PROBLEMS.filter(p => p.difficulty === 'Hard').length;

  const easySolved = PROBLEMS.filter(p => p.difficulty === 'Easy' && solved[p.slug]?.done).length;
  const medSolved = PROBLEMS.filter(p => p.difficulty === 'Medium' && solved[p.slug]?.done).length;
  const hardSolved = PROBLEMS.filter(p => p.difficulty === 'Hard' && solved[p.slug]?.done).length;
  const allSolved = PROBLEMS.filter(p => solved[p.slug]?.done).length;
  const completionPct = totalCount > 0 ? Math.round((allSolved / totalCount) * 1000) / 10 : 0;

  const nextProblem = useMemo(() => {
    return PROBLEMS.find(p => !solved[p.slug]?.done) || PROBLEMS[0];
  }, [solved]);

  // Filter problems (Clean Guardians list without topic, company, or rating clutter)
  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchNum = String(p.num || '').includes(q);
        if (!matchName && !matchNum) return false;
      }

      if (difficultyFilter !== 'all') {
        const diff = (p.difficulty || '').toLowerCase();
        if (diff !== difficultyFilter.toLowerCase()) return false;
      }

      const isDone = Boolean(solved[p.slug]?.done);
      if (statusFilter === 'unsolved' && isDone) return false;
      if (statusFilter === 'solved' && !isDone) return false;

      return true;
    }).sort((a, b) => {
      const aDone = (a?.slug && solved[a.slug]?.done) ? 1 : 0;
      const bDone = (b?.slug && solved[b.slug]?.done) ? 1 : 0;

      if (sortOrder === 'smart') {
        if (aDone !== bDone) return aDone - bDone; // Unsolved first
        return (a.num || 0) - (b.num || 0);
      }

      if (sortOrder === 'num-asc') {
        return (a.num || 0) - (b.num || 0);
      }

      return 0;
    });
  }, [search, difficultyFilter, statusFilter, sortOrder, solved]);

  // Reset pagination on filter or search change
  useEffect(() => {
    setDisplayLimit(60);
  }, [search, difficultyFilter, statusFilter, sortOrder]);

  // Paginated visible problems for instant 120fps render
  const visibleProblems = useMemo(() => {
    return filteredProblems.slice(0, displayLimit);
  }, [filteredProblems, displayLimit]);

  // Random Problem Chooser
  const handlePickRandom = () => {
    const pool = filteredProblems.filter(p => !solved[p.slug]?.done);
    const candidateList = pool.length > 0 ? pool : (filteredProblems.length > 0 ? filteredProblems : PROBLEMS);
    if (candidateList.length > 0) {
      const idx = Math.floor(Math.random() * candidateList.length);
      setRandomProblem(candidateList[idx]);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center pt-6 pb-2 max-w-3xl mx-auto">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md shadow-xs border border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9]/50 transition-colors duration-150 cursor-default">
            <SpiderLogo size={16} variant="icon-only" className="text-[#2B7A78] dark:text-[#3AAFA9]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
              596 CURATED PROBLEMS · GUARDIANS MASTER SHEET
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B7A78]"></span>
            </span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl md:text-6xl mb-3 max-w-2xl mx-auto tracking-tight font-bold text-[#17252A] dark:text-[#F8FAFC] transition-colors">
          Guardians Problems
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-6 font-normal transition-colors">
          The definitive, distraction-free DSA syllabus. 596 high-yield problems focused purely on algorithmic execution.
        </p>

        {/* Action Buttons: Pick Random Problem & Next Problem */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md mx-auto">
          {/* Pick Random Problem Button */}
          <button
            onClick={handlePickRandom}
            className="btn-brand !py-2.5 !px-5 text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md hover:scale-105 transition-transform cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">shuffle</span>
            <span>Pick Random Problem</span>
          </button>

          {/* Next Problem Quick Link */}
          {nextProblem && (
            <a
              href={`https://leetcode.com/problems/${nextProblem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !py-2.5 !px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 max-w-full truncate"
            >
              <span className="material-symbols-outlined text-base text-[#2B7A78] dark:text-[#3AAFA9]">arrow_forward</span>
              <span className="truncate">Next: #{nextProblem.num} {nextProblem.name}</span>
            </a>
          )}
        </div>
      </section>

      {/* Progress Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
        {/* Metric 1 */}
        <div className="bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm hover:border-[#3AAFA9]/40 transition-colors duration-150 text-center flex flex-col items-center justify-center">
          <span className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17252A] dark:text-[#F8FAFC] mb-1 transition-colors">
            {allSolved} <span className="text-base text-gray-400 dark:text-gray-500 font-normal">/ {totalCount}</span>
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Solved</p>
          <div className="w-full bg-[#DEF2F1] dark:bg-[#26353D] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, completionPct)}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm hover:border-[#3AAFA9]/40 transition-colors duration-150 text-center flex flex-col items-center justify-center">
          <span className="font-heading font-extrabold text-3xl sm:text-4xl text-[#2B7A78] dark:text-[#3AAFA9] mb-1 transition-colors">
            {completionPct}%
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Curriculum Progress</p>
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
            {totalCount - allSolved} Remaining
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm hover:border-[#3AAFA9]/40 transition-colors duration-150 text-center flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              {easySolved}/{easyTotal} E
            </span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 sm:px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
              {medSolved}/{medTotal} M
            </span>
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/60">
              {hardSolved}/{hardTotal} H
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mt-1">Difficulty Split</p>
          <div className="flex w-full gap-1 h-1.5 rounded-full mt-3 overflow-hidden bg-[#DEF2F1] dark:bg-[#26353D]">
            <div className="bg-emerald-500 rounded-full" style={{ width: `${easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0}%` }} />
            <div className="bg-amber-500 rounded-full" style={{ width: `${medTotal > 0 ? (medSolved / medTotal) * 100 : 0}%` }} />
            <div className="bg-rose-500 rounded-full" style={{ width: `${hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls (Streamlined, no topic filter) */}
      <div className="flex flex-col md:flex-row items-center gap-3 max-w-4xl mx-auto w-full">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Guardians problems by name or #number..."
            className="w-full h-11 pl-11 pr-10 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-full text-xs font-medium focus:outline-none focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 transition-colors duration-150 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-xs"
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

        {/* Filters Wrapper for Mobile */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-2 w-full md:w-auto">
          {/* Difficulty Pill Filter */}
          <div className="flex items-center p-1 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-xs">
            {['all', 'Easy', 'Medium', 'Hard'].map(d => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  difficultyFilter === d
                    ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center p-1 bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'unsolved', label: 'Unsolved' },
              { id: 'solved', label: 'Solved' }
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  statusFilter === s.id
                    ? 'bg-[#17252A] dark:bg-[#3AAFA9] text-white dark:text-[#12181C] shadow-xs font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Problems List with Pure, Clean Layout (No topic, no company, no rating) */}
      <div className="space-y-3 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 px-2 font-medium">
          <span>
            Showing <strong className="text-[#2B7A78] dark:text-[#3AAFA9]">{visibleProblems.length}</strong> of {filteredProblems.length} problems
          </span>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <button
              onClick={() => setSortOrder(prev => prev === 'smart' ? 'num-asc' : 'smart')}
              className="text-[#2B7A78] dark:text-[#3AAFA9] font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>{sortOrder === 'smart' ? 'Unsolved First' : 'Problem #'}</span>
              <span className="material-symbols-outlined text-sm">swap_vert</span>
            </button>
          </div>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-12 text-center border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">search_off</span>
            <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">No matching Guardians problems</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try changing your search keywords or resetting filters.</p>
            <button
              onClick={() => { setSearch(''); setDifficultyFilter('all'); setStatusFilter('all'); }}
              className="btn-brand mt-4 !text-xs !py-2 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          visibleProblems.map((problem, idx) => {
            const isDone = Boolean(solved[problem.slug]?.done);
            const hasNote = Boolean(notes[problem.slug]);
            const diffBadge = problem.difficulty === 'Easy'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
              : problem.difficulty === 'Medium'
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';

            const rowBg = isDone
              ? 'opacity-65 bg-gray-50/70 dark:bg-[#151D22]/80 border-gray-200/60 dark:border-[#2D3E47]/60'
              : 'bg-[#FEFFFF] dark:bg-[#182226] border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9]/50 shadow-xs hover:shadow-md';

            return (
              <div
                key={problem.slug || idx}
                className={`rounded-[1.25rem] sm:rounded-[1.5rem] p-3.5 sm:p-4 border transition-colors duration-150 flex items-center justify-between gap-2.5 sm:gap-3 group ${rowBg}`}
              >
                {/* Left: Checkbox + Number + Title */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                  <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none py-0.5">
                    <input
                      type="checkbox"
                      checked={!!isDone}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSolved(problem.slug);
                      }}
                      className="w-4 h-4 rounded text-[#3AAFA9] focus:ring-[#3AAFA9] border-gray-300 dark:border-gray-600 cursor-pointer shrink-0 accent-[#3AAFA9]"
                    />
                    <span className="font-code text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      #{String(problem.num).padStart(4, '0')}
                    </span>
                  </label>
                  <a
                    href={`https://leetcode.com/problems/${problem.slug}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs sm:text-sm font-semibold truncate hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors max-w-[170px] xs:max-w-[260px] sm:max-w-none ${
                      isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#17252A] dark:text-[#F8FAFC]'
                    }`}
                  >
                    {problem.name}
                  </a>
                </div>

                {/* Right: Difficulty Badge + Note + Solve Link ONLY (No topic, no company, no rating) */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${diffBadge}`}>
                    {problem.difficulty}
                  </span>

                  {/* Note Button */}
                  <button
                    onClick={() => onOpenNotes && onOpenNotes(problem)}
                    className={`p-1.5 rounded-full hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-colors cursor-pointer ${
                      hasNote ? 'text-[#3AAFA9] dark:text-[#3AAFA9]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                    title={hasNote ? 'View Note' : 'Add Note'}
                  >
                    <span className="material-symbols-outlined text-base">sticky_note_2</span>
                  </button>

                  {/* LeetCode link */}
                  <a
                    href={`https://leetcode.com/problems/${problem.slug}/`}
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
          })
        )}

        {/* Load More Pagination for Butter-Smooth Zero-Lag Scrolling */}
        {filteredProblems.length > displayLimit && (
          <div className="pt-4 pb-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setDisplayLimit(prev => Math.min(filteredProblems.length, prev + 60))}
              className="btn-secondary !text-xs !py-2.5 !px-6 font-semibold flex items-center gap-2 cursor-pointer shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              <span>Load Next 60 Problems</span>
              <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                ({visibleProblems.length} of {filteredProblems.length})
              </span>
            </button>
            <button
              onClick={() => setDisplayLimit(filteredProblems.length)}
              className="text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer py-2 px-3"
            >
              Load All ({filteredProblems.length})
            </button>
          </div>
        )}
      </div>

      {/* Random Problem Modal */}
      {randomProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#FEFFFF] dark:bg-[#182226] rounded-3xl shadow-[0_25px_60px_rgba(23,37,42,0.3)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#DEF2F1] dark:border-[#2D3E47] overflow-hidden flex flex-col animate-scaleUp p-6 space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DEF2F1] dark:border-[#2D3E47]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#2B7A78] dark:text-[#3AAFA9]">shuffle</span>
                <h3 className="font-heading font-bold text-base text-[#17252A] dark:text-[#F8FAFC]">
                  Random Guardians Pick
                </h3>
              </div>
              <button
                onClick={() => setRandomProblem(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-[#17252A] dark:hover:text-[#F8FAFC] hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="bg-[#DEF2F1]/30 dark:bg-[#202C32]/60 rounded-2xl p-5 border border-[#DEF2F1] dark:border-[#2D3E47] space-y-2 text-center">
              <span className="font-mono text-xs text-[#2B7A78] dark:text-[#3AAFA9] font-bold">
                Problem #{randomProblem.num}
              </span>
              <h4 className="font-heading font-extrabold text-xl text-[#17252A] dark:text-[#F8FAFC]">
                {randomProblem.name}
              </h4>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  randomProblem.difficulty === 'Easy'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
                    : randomProblem.difficulty === 'Medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
                }`}>
                  {randomProblem.difficulty}
                </span>
                {solved[randomProblem.slug]?.done && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-semibold">
                    ✓ Already Solved
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <a
                href={`https://leetcode.com/problems/${randomProblem.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setRandomProblem(null)}
                className="btn-brand w-full !py-3 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <span>Solve on LeetCode</span>
                <span className="material-symbols-outlined text-base">open_in_new</span>
              </a>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handlePickRandom}
                  className="btn-secondary !py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">shuffle</span>
                  <span>Pick Another</span>
                </button>
                <button
                  onClick={() => {
                    toggleSolved(randomProblem.slug);
                  }}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#2D3E47] bg-white dark:bg-[#202C32] hover:bg-slate-50 dark:hover:bg-[#2D3E47] text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{solved[randomProblem.slug]?.done ? 'Mark Unsolved' : 'Mark Solved'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
