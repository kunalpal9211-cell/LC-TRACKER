import { useState, useMemo } from 'react';
import { PROBLEMS } from '../data/problems';
import ALL_RATED_PROBLEMS from '../data/allRatedProblems.json';
import { useProgress } from '../context/ProgressContext';
import SpiderLogo from './SpiderLogo';

const RATING_TIERS = [
  { id: 'all', label: 'All Ratings', min: 0, max: 4000 },
  { id: 'novice', label: 'Novice (< 1400)', min: 0, max: 1399 },
  { id: 'specialist', label: 'Specialist (1400 - 1599)', min: 1400, max: 1599 },
  { id: 'expert', label: 'Expert (1600 - 1899)', min: 1600, max: 1899 },
  { id: 'candidate-master', label: 'Cand. Master (1900 - 2199)', min: 1900, max: 2199 },
  { id: 'grandmaster', label: 'Grandmaster (2200+)', min: 2200, max: 4000 },
];

export default function RatingWise({ onOpenNotes }) {
  const { solved, toggleSolved, notes } = useProgress();

  const [scope, setScope] = useState('all'); // 'all' (2572) | 'guardians' (596)
  const [selectedTier, setSelectedTier] = useState('all');
  const [minRating, setMinRating] = useState(1000);
  const [maxRating, setMaxRating] = useState(2600);
  const [useSlider, setUseSlider] = useState(false);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('rating-asc'); // 'rating-asc' | 'rating-desc' | 'num-asc'
  const [displayLimit, setDisplayLimit] = useState(60);

  // Active base dataset
  const baseProblems = useMemo(() => {
    return scope === 'guardians' ? PROBLEMS : ALL_RATED_PROBLEMS;
  }, [scope]);

  // Filter problems by rating and other criteria
  const filteredProblems = useMemo(() => {
    return baseProblems.filter(p => {
      const rating = p.rating || 1500;

      // Rating filter
      if (useSlider) {
        if (rating < minRating || rating > maxRating) return false;
      } else if (selectedTier !== 'all') {
        const tier = RATING_TIERS.find(t => t.id === selectedTier);
        if (tier && (rating < tier.min || rating > tier.max)) return false;
      }

      // Difficulty filter
      if (difficultyFilter !== 'all') {
        const diff = (p.difficulty || '').toLowerCase();
        if (diff !== difficultyFilter.toLowerCase()) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = (p.name || p.title || '').toLowerCase().includes(q);
        const matchNum = String(p.num || p.id || '').includes(q);
        const matchRating = String(p.rating || '').includes(q);
        const matchContest = (p.contest || '').toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchRating && !matchContest) return false;
      }

      return true;
    }).sort((a, b) => {
      // Stable ordering so toggling solved does not cause items to jump
      if (sortOrder === 'rating-asc') return (a.rating || 1500) - (b.rating || 1500);
      if (sortOrder === 'rating-desc') return (b.rating || 1500) - (a.rating || 1500);
      return (a.num || a.id || 0) - (b.num || b.id || 0);
    });
  }, [baseProblems, selectedTier, minRating, maxRating, useSlider, difficultyFilter, search, sortOrder]);

  // Paginated visible problems
  const visibleProblems = useMemo(() => {
    return filteredProblems.slice(0, displayLimit);
  }, [filteredProblems, displayLimit]);

  // Statistics for the current view
  const stats = useMemo(() => {
    const total = filteredProblems.length;
    const solvedCount = filteredProblems.filter(p => p.slug && solved[p.slug]?.done).length;
    const avgRating = total > 0
      ? Math.round(filteredProblems.reduce((acc, p) => acc + (p.rating || 1500), 0) / total)
      : 0;
    return { total, solvedCount, avgRating };
  }, [filteredProblems, solved]);

  const getTierColor = (rating) => {
    if (!rating || rating < 1400) return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-[#202C32] dark:text-slate-300 dark:border-[#2D3E47]';
    if (rating < 1600) return 'bg-[#DEF2F1] text-[#2B7A78] border-[#3AAFA9]/30 dark:bg-[#202C32] dark:text-[#3AAFA9] dark:border-[#3AAFA9]/30';
    if (rating < 1900) return 'bg-[#DEF2F1] text-[#2B7A78] border-[#2B7A78]/30 dark:bg-[#202C32] dark:text-[#3AAFA9] dark:border-[#2B7A78]/40 font-bold';
    if (rating < 2200) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60';
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <section className="text-center pt-6 pb-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md shadow-sm border border-[#DEF2F1] dark:border-[#2D3E47] hover:shadow-md transition-all cursor-default">
            <SpiderLogo size={16} variant="icon-only" className="text-[#2B7A78] dark:text-[#3AAFA9]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
              SPYDEX RATING LADDER · {ALL_RATED_PROBLEMS.length} CALIBRATED PROBLEMS
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B7A78]"></span>
            </span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl mb-3 tracking-tight font-bold text-[#17252A] dark:text-[#F8FAFC] transition-colors">
          ZeroTrac Rating Ladder
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed mb-6 font-normal transition-colors">
          Accurate contest Elo ratings for {ALL_RATED_PROBLEMS.length} LeetCode contest problems. Move beyond arbitrary difficulty tags and calibrate your exact growth boundary.
        </p>

        {/* Dataset Scope Switcher */}
        <div className="inline-flex items-center p-1 bg-[#DEF2F1]/60 dark:bg-[#182226]/90 border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-sm">
          <button
            onClick={() => { setScope('all'); setDisplayLimit(60); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              scope === 'all'
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
            }`}
          >
            All Contest Problems ({ALL_RATED_PROBLEMS.length})
          </button>
          <button
            onClick={() => { setScope('guardians'); setDisplayLimit(60); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              scope === 'guardians'
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                : 'text-gray-600 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-white'
            }`}
          >
            Guardians Sheet Only ({PROBLEMS.length})
          </button>
        </div>
      </section>

      {/* Tier Selection Chips */}
      <div className="max-w-4xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
            Select Rating Tier
          </span>
          <button
            onClick={() => setUseSlider(!useSlider)}
            className="text-xs text-[#2B7A78] dark:text-[#3AAFA9] font-semibold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>{useSlider ? 'Use Tier Buttons' : 'Use Rating Slider'}</span>
          </button>
        </div>

        {useSlider ? (
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-2xl p-5 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-[#17252A] dark:text-[#F8FAFC]">
              <span>Min Rating: {minRating}</span>
              <span>Max Rating: {maxRating}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="range"
                  min="1000"
                  max="2800"
                  step="50"
                  value={minRating}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val < maxRating) setMinRating(val);
                  }}
                  className="w-full accent-[#3AAFA9] cursor-pointer"
                />
              </div>
              <div>
                <input
                  type="range"
                  min="1000"
                  max="3200"
                  step="50"
                  value={maxRating}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > minRating) setMaxRating(val);
                  }}
                  className="w-full accent-[#3AAFA9] cursor-pointer"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {RATING_TIERS.map(tier => {
              const isSelected = selectedTier === tier.id;
              return (
                <button
                  key={tier.id}
                  onClick={() => { setSelectedTier(tier.id); setDisplayLimit(60); }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] border-transparent text-white shadow-md shadow-[#3AAFA9]/25 font-bold'
                      : 'bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-md border-[#DEF2F1] dark:border-[#2D3E47] text-gray-600 dark:text-gray-300 hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9] hover:text-[#2B7A78] dark:hover:text-[#3AAFA9]'
                  }`}
                >
                  {tier.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] p-4 text-center border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#17252A] dark:text-[#F8FAFC] block">
            {stats.total}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Matching Problems
          </span>
        </div>
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] p-4 text-center border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#2B7A78] dark:text-[#3AAFA9] block">
            {stats.solvedCount}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Solved in Tier
          </span>
        </div>
        <div className="bg-[#FEFFFF]/80 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[1.5rem] p-4 text-center border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm">
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#3AAFA9] dark:text-[#5EEAD4] block">
            ★ {stats.avgRating}
          </span>
          <span className="text-[10px] sm:text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Average Rating
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-5 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm max-w-4xl mx-auto w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Difficulty Chips */}
          <div className="flex items-center p-1 bg-[#DEF2F1]/50 dark:bg-[#202C32]/60 border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full self-center sm:self-auto">
            {['all', 'Easy', 'Medium', 'Hard'].map(d => {
              const isSelected = difficultyFilter === d;
              return (
                <button
                  key={d}
                  onClick={() => { setDifficultyFilter(d); setDisplayLimit(60); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Sort Order Selector */}
          <div className="flex items-center justify-end gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1.5 bg-[#FEFFFF] dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] rounded-xl text-xs font-semibold text-[#17252A] dark:text-[#F8FAFC] focus:outline-none cursor-pointer"
            >
              <option value="rating-asc">Rating (Lowest First)</option>
              <option value="rating-desc">Rating (Highest First)</option>
              <option value="num-asc">Problem Number</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setDisplayLimit(60); }}
            placeholder="Search problems by name, #number, rating (e.g. 1800), contest..."
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

      {/* Problems List */}
      <div className="max-w-4xl mx-auto w-full space-y-3">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-2 font-medium">
          <span>
            Showing {Math.min(displayLimit, filteredProblems.length)} of {filteredProblems.length} Problems
          </span>
          <span>{scope === 'all' ? 'ZeroTrac All-Problems Database' : 'Guardians Curriculum'}</span>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="p-16 text-center bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm space-y-3">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">search_off</span>
            <h3 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC]">No rated problems match your criteria</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Try adjusting the rating tier slider or clearing search.</p>
          </div>
        ) : (
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2.5rem] p-4 sm:p-6 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] divide-y divide-[#DEF2F1]/50 dark:divide-[#2D3E47]/60">
            {visibleProblems.map((q, idx) => {
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
                  {/* Checkbox & Problem Name */}
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
                      <span className="font-code text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 shrink-0">
                        #{String(q.num || q.id || idx + 1).padStart(4, '0')}
                      </span>
                    </label>
                    <a
                      href={q.url || `https://leetcode.com/problems/${slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs sm:text-sm font-semibold truncate hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors max-w-[140px] xs:max-w-[220px] sm:max-w-none ${
                        isDone ? 'line-through text-gray-400 dark:text-gray-500' : 'text-[#17252A] dark:text-[#F8FAFC]'
                      }`}
                    >
                      {q.name || q.title}
                    </a>
                  </div>

                  {/* Rating & Action Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Contest tag */}
                    {q.contest && (
                      <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#202C32] text-slate-500 dark:text-slate-400 text-[10px] font-mono">
                        {q.questionIndex ? `${q.questionIndex} · ` : ''}{q.contest.replace('weekly-contest-', 'WC ').replace('biweekly-contest-', 'BC ')}
                      </span>
                    )}

                    {/* ZeroTrac Rating Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-mono ${getTierColor(q.rating)}`}>
                      ★ {q.rating}
                    </span>

                    {/* Difficulty Badge */}
                    <span className={`px-2 sm:px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${diffBadge}`}>
                      {q.difficulty}
                    </span>

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
                      href={q.url || `https://leetcode.com/problems/${slug}/`}
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

            {/* Load More Button */}
            {displayLimit < filteredProblems.length && (
              <div className="pt-5 text-center">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 60)}
                  className="btn-secondary !py-2.5 !px-6 text-xs font-semibold cursor-pointer"
                >
                  <span>Load Next 60 Problems ({filteredProblems.length - displayLimit} remaining)</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
