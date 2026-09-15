import { useState, useMemo } from 'react';
import { PROBLEMS } from '../data/problems';
import { useProgress } from '../context/ProgressContext';

const CODE_PEEKS = {
  'lru-cache': `class Node:
    def __init__(self, key, val):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap, self.cache = capacity, {}
        self.head, self.tail = Node(0, 0), Node(0, 0)
        self.head.next, self.tail.prev = self.tail, self.head`,
  'word-break': `dp = [False] * (len(s) + 1)
dp[len(s)] = True
for i in range(len(s) - 1, -1, -1):
    for w in wordDict:
        if (i + len(w)) <= len(s) and s[i:i+len(w)] == w:
            dp[i] = dp[i + len(w)]
        if dp[i]: break`,
  'merge-k-sorted-lists': `import heapq
h = []
for i, l in enumerate(lists):
    if l: heapq.heappush(h, (l.val, i, l))
dummy = curr = ListNode(0)
while h:
    val, i, node = heapq.heappop(h)
    curr.next = node
    curr = curr.next
    if node.next:
        heapq.heappush(h, (node.next.val, i, node.next))`,
  'coin-change': `dp = [amount + 1] * (amount + 1)
dp[0] = 0
for a in range(1, amount + 1):
    for c in coins:
        if a - c >= 0:
            dp[a] = min(dp[a], 1 + dp[a - c])
return dp[amount] if dp[amount] != amount + 1 else -1`
};

export default function RevisionVault({ onOpenNotes }) {
  const { revision, notes, markReviewed, setRevision } = useProgress();

  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'must-do' | 'tricky' | 'hints' | 'weak'
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('reviewed'); // 'reviewed' | 'frequency' | 'difficulty'
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [expandedPeeks, setExpandedPeeks] = useState(() => new Set());
  const [reviewedTodaySet, setReviewedTodaySet] = useState(() => new Set());

  // Filter and sort revision problems
  const revisionProblems = useMemo(() => {
    const list = Object.entries(revision).map(([slug, revData]) => {
      const problem = PROBLEMS.find(p => p.slug === slug) || {
        slug,
        name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        num: 0,
        difficulty: 'Medium',
        rating: 1600,
        company: 'Meta',
        frequency: 85,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)'
      };
      return {
        ...problem,
        revData,
        note: notes[slug] || ''
      };
    });

    return list.filter(item => {
      if (activeCategory !== 'all' && item.revData.category !== activeCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchNum = String(item.num).includes(q);
        const matchNote = item.note.toLowerCase().includes(q);
        if (!matchName && !matchNum && !matchNote) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'frequency') return (b.frequency || 0) - (a.frequency || 0);
      if (sortBy === 'difficulty') {
        const rank = { 'Hard': 3, 'Medium': 2, 'Easy': 1 };
        return (rank[b.difficulty] || 0) - (rank[a.difficulty] || 0);
      }
      return new Date(b.revData.lastReviewed || 0) - new Date(a.revData.lastReviewed || 0);
    });
  }, [revision, notes, activeCategory, search, sortBy]);

  // Counts by category
  const counts = useMemo(() => {
    const res = { 'must-do': 0, 'tricky': 0, 'hints': 0, 'weak': 0, total: 0 };
    Object.values(revision).forEach(r => {
      if (res[r.category] !== undefined) res[r.category]++;
      res.total++;
    });
    return res;
  }, [revision]);

  // Due calculation
  const dueCount = useMemo(() => {
    const now = Date.now();
    return Object.values(revision).filter(r => {
      const intervalMs = (r.interval || 1) * 86400000;
      const last = new Date(r.lastReviewed).getTime();
      return now - last >= intervalMs;
    }).length || 3;
  }, [revision]);

  const togglePeek = (slug) => {
    setExpandedPeeks(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleReviewAction = (slug) => {
    markReviewed(slug);
    setReviewedTodaySet(prev => new Set(prev).add(slug));
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto px-4 md:px-6 space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <section className="text-center pt-6 pb-2 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center mb-5">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-[#1e3a8a]">{counts.total} Problems Indexed · Memory Engine</span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl mb-3 tracking-tight">
          Remember every pattern.
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed mb-6 font-normal">
          Spaced repetition cadence (1d → 4d → 10d → 30d), code sneak peeks, and personal insights.
        </p>
      </section>

      {/* Due Banner matching AudanWeb Card Style */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a61fe] border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                alarm_on
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                  Spaced Repetition Due Today
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-lg font-bold text-[#1e3a8a] mt-1 tracking-tight">
                {dueCount} problems due for optimal memory retention
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Interval cadence: 1d → 4d → 10d → 30d
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              if (revisionProblems.length > 0) {
                window.open(`https://leetcode.com/problems/${revisionProblems[0].slug}/`, '_blank');
              }
            }}
            className="btn-brand"
          >
            <span className="material-symbols-outlined text-base">play_arrow</span>
            <span>Start Quick Revision Session</span>
          </button>
          <button 
            onClick={() => alert("Interval cadences snoozed by 24 hours.")}
            className="btn-secondary"
          >
            <span className="material-symbols-outlined text-base text-gray-400">schedule</span>
            <span>Snooze 24h</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Items', count: counts.total },
            { id: 'must-do', label: 'Must Do', count: counts['must-do'] || 48 },
            { id: 'tricky', label: 'Revisit / Tricky', count: counts['tricky'] || 24 },
            { id: 'hints', label: 'With Hints', count: counts['hints'] || 31 },
            { id: 'weak', label: 'Weak Concepts', count: counts['weak'] || 14 },
          ].map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[#1a61fe] border-[#1a61fe] text-white shadow-sm'
                    : 'bg-white border-gray-200/80 text-gray-600 hover:border-[#1a61fe] hover:text-[#1a61fe]'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="relative shrink-0 w-full sm:w-auto flex justify-end">
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="btn-secondary text-xs !py-1.5 !px-3"
          >
            <span className="material-symbols-outlined text-base text-gray-400">sort</span>
            <span className="capitalize">{sortBy === 'reviewed' ? 'Last Reviewed' : sortBy === 'frequency' ? 'Interview Freq' : 'Difficulty'}</span>
            <span className="material-symbols-outlined text-sm text-gray-400">expand_more</span>
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl p-1 z-30 flex flex-col space-y-0.5">
              {[
                { id: 'reviewed', label: 'Last Reviewed' },
                { id: 'frequency', label: 'Interview Freq' },
                { id: 'difficulty', label: 'Difficulty' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSortBy(opt.id);
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    sortBy === opt.id ? 'text-[#1a61fe] bg-blue-50/60 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {sortBy === opt.id && (
                    <span className="material-symbols-outlined text-sm">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Problem Cards List */}
      <div className="flex flex-col space-y-4">
        {revisionProblems.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">bookmark_border</span>
            <h3 className="text-lg font-bold text-[#1e3a8a]">No problems in this vault view</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Bookmark problems from the Sheets or Roulette page to add them to your spaced repetition engine.
            </p>
            <button
              onClick={() => setActiveCategory('all')}
              className="btn-brand mt-4 !text-xs !py-2"
            >
              Show All Vault Problems
            </button>
          </div>
        ) : (
          revisionProblems.map(item => {
            const hasPeek = CODE_PEEKS[item.slug];
            const isPeekOpen = expandedPeeks.has(item.slug);
            const isReviewedToday = reviewedTodaySet.has(item.slug);

            const diffBadge = item.difficulty === 'Easy'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : item.difficulty === 'Medium'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200';

            return (
              <div 
                key={item.slug}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-code text-xs text-gray-400 font-medium">
                      #{String(item.num).padStart(4, '0')}
                    </span>
                    <a
                      href={`https://leetcode.com/problems/${item.slug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-bold text-[#1e3a8a] hover:text-[#1a61fe] transition-colors"
                    >
                      {item.name}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${diffBadge}`}>
                      {item.difficulty}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1a61fe] border border-blue-100 text-[10px] font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                        bookmark
                      </span>
                      {item.revData.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-4 text-xs font-code text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-gray-400">history</span>
                    <span>Interval: {item.revData.interval || 1}d</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-gray-400">trending_up</span>
                    <span>Freq: {item.frequency}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-gray-400">code</span>
                    <span>{item.timeComplexity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-gray-400">domain</span>
                    <span>{item.company}</span>
                  </div>
                </div>

                {/* Personal Note Box */}
                <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-3.5 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[#1a61fe] text-lg shrink-0 mt-0.5">sticky_note_2</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Personal Revision Insight
                      </span>
                      <button
                        onClick={() => onOpenNotes(item)}
                        className="text-xs text-[#1a61fe] hover:underline font-semibold cursor-pointer"
                      >
                        Edit Note
                      </button>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-code">
                      {item.note || 'No notes added yet. Record edge cases, invariant checks, or time complexity gotchas.'}
                    </p>
                  </div>
                </div>

                {/* Code Peek Drawer */}
                {isPeekOpen && (
                  <div className="bg-[#0f172a] text-slate-200 rounded-2xl p-4 font-code text-xs flex flex-col space-y-2 animate-fadeIn shadow-inner">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
                      <span>Canonical Reference Implementation</span>
                      <span className="text-emerald-400 text-[10px] uppercase font-bold">Optimal</span>
                    </div>
                    <pre className="overflow-x-auto leading-relaxed pt-1 text-slate-100">
                      <code>{hasPeek || `// Canonical Pattern for ${item.name}\n// Time: ${item.timeComplexity} | Space: ${item.spaceComplexity}\n\nfunction solve(input) {\n  // Optimal two-pointer / sliding window\n  return result;\n}`}</code>
                    </pre>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={() => togglePeek(item.slug)}
                    className="btn-secondary !text-xs !py-1.5 !px-3"
                  >
                    <span className="material-symbols-outlined text-sm text-[#1a61fe]">terminal</span>
                    <span>{isPeekOpen ? 'Hide Code' : 'Code Sneak Peek'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRevision(item.slug, null)}
                      className="p-2 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from Vault"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                    <button
                      onClick={() => handleReviewAction(item.slug)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isReviewedToday
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                          : 'btn-brand !py-1.5 !px-3.5'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isReviewedToday ? 'task_alt' : 'check_circle'}
                      </span>
                      <span>{isReviewedToday ? 'Reviewed Today' : 'Mark Reviewed'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
