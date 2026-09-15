import { useState, useEffect, useRef } from 'react';

export default function NotesModal({ problem, initialNote, onSave, onClose }) {
  const [draft, setDraft] = useState(initialNote || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  if (!problem) return null;

  const diffBadge = problem.difficulty === 'Easy'
    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60'
    : problem.difficulty === 'Medium'
    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60'
    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#17252A]/40 dark:bg-black/70 backdrop-blur-md animate-fadeIn" onClick={onClose}>
      <div 
        className="w-full max-w-lg bg-[#FEFFFF]/95 dark:bg-[#182226] backdrop-blur-2xl border border-[#DEF2F1] dark:border-[#2D3E47] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 shadow-[0_20px_50px_rgba(43,122,120,0.14)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto no-scrollbar animate-scaleUp theme-transition"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-code text-xs text-gray-400 dark:text-gray-500 font-medium">#{String(problem.num).padStart(4, '0')}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${diffBadge}`}>
                {problem.difficulty}
              </span>
              <span className="text-xs text-[#2B7A78] dark:text-[#3AAFA9] font-code font-bold bg-[#DEF2F1] dark:bg-[#202C32] border border-transparent dark:border-[#2D3E47] px-2 py-0.5 rounded-full">
                ★ {problem.rating || 1500}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mt-1.5 tracking-tight">
              {problem.name}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-[#F8FAFC] p-2 rounded-full hover:bg-[#DEF2F1] dark:hover:bg-[#202C32] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-col space-y-2">
          <label className="text-xs uppercase text-gray-400 dark:text-gray-400 tracking-wider font-bold">
            Personal Revision Insight / Key Gotchas
          </label>
          <textarea
            ref={textareaRef}
            rows={5}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Approach, edge cases, time/space complexity pitfalls, canonical insights..."
            className="w-full p-3.5 sm:p-4 rounded-2xl bg-[#DEF2F1]/30 dark:bg-[#202C32]/70 border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] font-code text-xs leading-relaxed focus:outline-none focus:border-[#3AAFA9] focus:ring-2 focus:ring-[#3AAFA9]/20 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-y font-medium"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <a
            href={`https://leetcode.com/problems/${problem.slug}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-[#3AAFA9] font-semibold transition-colors"
          >
            <span>Open on LeetCode</span>
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs !py-2 !px-4"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave(problem.slug, draft);
                onClose();
              }}
              className="btn-brand text-xs !py-2 !px-5"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
