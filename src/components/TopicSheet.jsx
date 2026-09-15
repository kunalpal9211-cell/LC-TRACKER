import { useState, useMemo, useEffect } from 'react';
import { PROBLEMS, ALL_TOPICS } from '../data/problems';
import { useProgress } from '../context/ProgressContext';

export default function TopicSheet({ onOpenNotes }) {
  const { solved, toggleSolved, notes } = useProgress();

  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('all'); // 'all' | 'Easy' | 'Medium' | 'Hard'
  const [expandedTopics, setExpandedTopics] = useState(() => new Set(ALL_TOPICS));

  // Filter problems
  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter(p => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchNum = String(p.num).includes(q);
        const matchTopic = p.topic.toLowerCase().includes(q);
        const matchCompany = p.company && p.company.toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchTopic && !matchCompany) return false;
      }

      if (selectedTopic !== 'All') {
        if (p.topic.toLowerCase() !== selectedTopic.toLowerCase()) return false;
      }

      if (difficultyFilter !== 'all') {
        if (p.difficulty.toLowerCase() !== difficultyFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [search, selectedTopic, difficultyFilter]);

  // Group problems by topic - keep stable order by problem number so checking solved never causes items to jump
  const groupedTopics = useMemo(() => {
    const map = {};
    filteredProblems.forEach(p => {
      if (!map[p.topic]) map[p.topic] = [];
      map[p.topic].push(p);
    });

    Object.keys(map).forEach(t => {
      map[t].sort((a, b) => (a.num || 0) - (b.num || 0));
    });

    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredProblems]);

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

  const toggleAccordion = (topic) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const allCurrentTopicsExpanded = groupedTopics.length > 0 && groupedTopics.every(([t]) => expandedTopics.has(t));
  const noneExpanded = expandedTopics.size === 0;

  const expandAllTopics = () => {
    setExpandedTopics(new Set(groupedTopics.map(([t]) => t)));
  };

  const collapseAllTopics = () => {
    setExpandedTopics(new Set());
  };

  const handleSelectTopic = (topic) => {
    setSelectedTopic(topic);
    if (topic === 'All') {
      setExpandedTopics(new Set(ALL_TOPICS));
    } else {
      setExpandedTopics(new Set([topic]));
    }
  };

  // Auto-expand matching topics when user searches
  useEffect(() => {
    if (search.trim()) {
      setExpandedTopics(new Set(groupedTopics.map(([t]) => t)));
    }
  }, [search]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="text-center pt-6 md:pt-10 pb-4 max-w-3xl mx-auto">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#FEFFFF]/85 dark:bg-[#182226]/85 backdrop-blur-md shadow-sm border border-[#DEF2F1] dark:border-[#2D3E47] hover:shadow-md transition-all cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2B7A78] dark:bg-[#3AAFA9]"></span>
            </span>
            <span className="text-xs font-semibold text-[#17252A] dark:text-[#F8FAFC] tracking-tight">{groupedTopics.length} Core Topics · 596 Guardians Sheet</span>
          </div>
        </div>

        {/* Hero Title */}
        <h1 className="hero-framer-text text-3xl sm:text-5xl md:text-6xl mb-4 max-w-2xl mx-auto tracking-tight font-bold">
          Topic-Wise Problems
        </h1>
        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed mb-8 font-normal">
          Master algorithms pattern-by-pattern. Expand any topic to see ZeroTrac ratings, solve progress, and personal notes.
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full px-2">
          {nextProblem && (
            <a
              href={`https://leetcode.com/problems/${nextProblem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand max-w-full truncate px-4 py-2.5 text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <span className="truncate">Solve #{nextProblem.num}: {nextProblem.name}</span>
              <span className="material-symbols-outlined text-base shrink-0">arrow_forward</span>
            </a>
          )}
          <div className="inline-flex items-center p-1 rounded-2xl bg-[#DEF2F1]/60 dark:bg-[#182226] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-xs">
            <button
              type="button"
              onClick={expandAllTopics}
              title="Expand all topic sections"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                allCurrentTopicsExpanded
                  ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-xs font-bold'
                  : 'text-[#2B7A78] dark:text-[#3AAFA9] hover:bg-white dark:hover:bg-[#202C32]'
              }`}
            >
              <span className="material-symbols-outlined text-base">unfold_more</span>
              <span>Expand All</span>
            </button>
            <button
              type="button"
              onClick={collapseAllTopics}
              title="Collapse all topic sections"
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                noneExpanded
                  ? 'bg-[#17252A] dark:bg-white text-white dark:text-[#17252A] shadow-xs font-bold'
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-[#202C32]'
              }`}
            >
              <span className="material-symbols-outlined text-base">unfold_less</span>
              <span>Collapse All</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Metric Cards with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
        {/* Card 1: Total Solved */}
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/85 backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all text-center flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-1 tracking-tight">
            {allSolved}<span className="text-gray-400 dark:text-gray-500 text-lg font-normal"> / {totalCount}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Total Solved</p>
          <div className="w-full bg-[#DEF2F1] dark:bg-[#202C32] h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] h-full rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
          </div>
        </div>

        {/* Card 2: Mastery Rate */}
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/85 backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all text-center flex flex-col items-center justify-center">
          <div className="text-3xl sm:text-4xl font-bold text-[#2B7A78] dark:text-[#3AAFA9] mb-1 tracking-tight">
            {completionPct}<span className="text-xl">%</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Curriculum Progress</p>
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-[#3AAFA9]">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>ZeroTrac Calibrated</span>
          </div>
        </div>

        {/* Card 3: Difficulty Split */}
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/85 backdrop-blur-xl rounded-[1.75rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-lg transition-all text-center flex flex-col items-center justify-center">
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
          <div className="flex w-full gap-1 h-1.5 rounded-full mt-3 overflow-hidden bg-[#DEF2F1] dark:bg-[#202C32]">
            <div className="bg-emerald-500 rounded-full" style={{ width: `${easyTotal > 0 ? (easySolved / easyTotal) * 100 : 0}%` }} />
            <div className="bg-amber-500 rounded-full" style={{ width: `${medTotal > 0 ? (medSolved / medTotal) * 100 : 0}%` }} />
            <div className="bg-rose-500 rounded-full" style={{ width: `${hardTotal > 0 ? (hardSolved / hardTotal) * 100 : 0}%` }} />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-4xl mx-auto w-full">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems by name, company (Google, Meta...), #number..."
            className="w-full h-11 pl-11 pr-10 bg-[#FEFFFF]/90 dark:bg-[#182226] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-full text-xs font-medium focus:outline-none focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-[#F8FAFC] p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Difficulty Pill Filter */}
        <div className="flex items-center p-1 bg-[#FEFFFF]/90 dark:bg-[#182226] border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-sm">
          {['all', 'Easy', 'Medium', 'Hard'].map(d => {
            const isSelected = difficultyFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-[#F8FAFC]'
                }`}
              >
                {d === 'all' ? 'All' : d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Filter Pills */}
      <div className="max-w-4xl mx-auto w-full overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2">
          {['All', ...ALL_TOPICS].map(topic => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => handleSelectTopic(topic)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#2B7A78] text-white shadow-sm'
                    : 'bg-[#FEFFFF]/80 dark:bg-[#182226]/90 border border-[#DEF2F1] dark:border-[#2D3E47] text-gray-600 dark:text-gray-400 hover:border-[#3AAFA9] hover:text-[#2B7A78] dark:hover:text-[#3AAFA9]'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Topic Accordions List with Glassmorphism */}
      <div className="flex flex-col space-y-4 max-w-4xl mx-auto w-full">
        {groupedTopics.length === 0 ? (
          <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-12 text-center border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">search_off</span>
            <h3 className="text-lg font-bold text-[#17252A] dark:text-[#F8FAFC]">No matching problems found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Try clearing your search query or selecting a different topic.</p>
            <button
              onClick={() => { setSearch(''); setSelectedTopic('All'); setDifficultyFilter('all'); }}
              className="btn-brand mt-4 !text-xs !py-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedTopics.map(([topic, problems]) => {
            const isExpanded = expandedTopics.has(topic);
            const topicSolved = problems.filter(p => solved[p.slug]?.done).length;
            const topicTotal = problems.length;
            const topicPct = topicTotal > 0
              ? (topicSolved > 0
                  ? Math.max(0.1, Math.round((topicSolved / topicTotal) * 1000) / 10)
                  : 0)
              : 0;

            return (
              <div
                key={topic}
                className="bg-[#FEFFFF]/85 dark:bg-[#182226]/85 backdrop-blur-xl rounded-[2rem] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_4px_20px_rgba(43,122,120,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(43,122,120,0.08)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all overflow-hidden"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(topic)}
                  aria-expanded={isExpanded}
                  className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-[#DEF2F1]/30 dark:hover:bg-[#202C32]/40 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Radial Progress Ring in Teal */}
                    <div className="relative w-10 h-10 shrink-0 flex items-center justify-center">
                      <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          className="text-[#DEF2F1] dark:text-[#2D3E47]"
                          strokeWidth="3.5"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3AAFA9"
                          strokeWidth="3.5"
                          strokeDasharray={`${topicPct}, 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[10px] font-bold text-[#17252A] dark:text-[#F8FAFC]">{topicPct}%</span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC] tracking-tight">{topic}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{topicSolved} of {topicTotal} completed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-[#2B7A78] dark:text-[#3AAFA9] bg-[#DEF2F1] dark:bg-[#202C32] border border-[#3AAFA9]/30 dark:border-[#2D3E47] px-2.5 py-1 rounded-full">
                      {topicTotal} items
                    </span>
                    <span className={`material-symbols-outlined text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#3AAFA9]' : ''}`}>
                      expand_more
                    </span>
                  </div>
                </button>

                {/* Problems Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] px-4 py-3 sm:px-6 divide-y divide-[#DEF2F1]/50 dark:divide-[#2D3E47]/60">
                    {problems.map(problem => {
                      const isDone = solved[problem.slug]?.done;
                      const hasNote = notes[problem.slug];

                      const diffBadge = problem.difficulty === 'Easy'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
                        : problem.difficulty === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';

                      return (
                        <div
                          key={problem.slug}
                          className={`py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-3 group transition-opacity ${
                            isDone ? 'opacity-60 bg-gray-50/40 dark:bg-[#202C32]/30 rounded-xl px-2' : ''
                          }`}
                        >
                          {/* Checkbox and Title */}
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none py-1 -my-1">
                              <input
                                type="checkbox"
                                checked={!!isDone}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSolved(problem.slug);
                                }}
                                className="w-4 h-4 rounded text-[#3AAFA9] focus:ring-[#3AAFA9] border-gray-300 dark:border-gray-600 dark:bg-[#202C32] cursor-pointer shrink-0 accent-[#3AAFA9]"
                              />
                              <span className="font-code text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                #{String(problem.num).padStart(4, '0')}
                              </span>
                            </label>
                            <a
                              href={`https://leetcode.com/problems/${problem.slug}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-xs sm:text-sm font-semibold truncate hover:text-[#3AAFA9] transition-colors max-w-[130px] xs:max-w-[200px] sm:max-w-none ${
                                isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#17252A] dark:text-[#F8FAFC]'
                              }`}
                            >
                              {problem.name}
                            </a>
                          </div>

                          {/* Badges & Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Difficulty */}
                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${diffBadge}`}>
                              {problem.difficulty}
                            </span>

                            {/* ZeroTrac Rating */}
                            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-[10px] font-bold font-code border border-[#DEF2F1] dark:border-[#2D3E47]">
                              ★ {problem.rating}
                            </span>

                            {/* Company Tag */}
                            {problem.company && (
                              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202C32] text-slate-700 dark:text-slate-300 text-[10px] font-medium border border-transparent dark:border-[#2D3E47]">
                                {problem.company}
                              </span>
                            )}

                            {/* Note Icon */}
                            <button
                              onClick={() => onOpenNotes && onOpenNotes(problem)}
                              className={`p-1.5 rounded-full hover:bg-[#DEF2F1] dark:hover:bg-[#202C32] transition-colors cursor-pointer ${hasNote ? 'text-[#3AAFA9]' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                              title={hasNote ? 'View Note' : 'Add Note'}
                            >
                              <span className="material-symbols-outlined text-base">sticky_note_2</span>
                            </button>

                            {/* External Link */}
                            <a
                              href={`https://leetcode.com/problems/${problem.slug}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-[#3AAFA9] hover:bg-[#DEF2F1] dark:hover:bg-[#202C32] transition-colors"
                              title="Open in LeetCode"
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
            );
          })
        )}
      </div>
    </div>
  );
}
