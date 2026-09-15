import { useState, useEffect, useMemo, useCallback } from 'react';
import { PROBLEMS, ALL_TOPICS } from '../data/problems';
import { useProgress } from '../context/ProgressContext';

export default function ProblemRoulette({ onOpenNotes }) {
  const { revision, setRevision } = useProgress();

  const [mode, setMode] = useState('rating'); // 'rating' | 'pure'
  const [minRating, setMinRating] = useState(1200);
  const [maxRating, setMaxRating] = useState(1800);
  const [selectedTopics, setSelectedTopics] = useState(() => new Set(ALL_TOPICS));
  const [isSpinning, setIsSpinning] = useState(false);
  const [rollCount, setRollCount] = useState(142);

  // Practice Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Eligible pool
  const candidatePool = useMemo(() => {
    return PROBLEMS.filter(p => {
      if (selectedTopics.size > 0 && !selectedTopics.has(p.topic)) return false;

      if (mode === 'rating') {
        const r = p.rating || 1500;
        const low = Math.min(minRating, maxRating);
        const high = Math.max(minRating, maxRating);
        if (r < low || r > high) return false;
      }

      return true;
    });
  }, [mode, minRating, maxRating, selectedTopics]);

  const [currentProblem, setCurrentProblem] = useState(() => {
    return candidatePool.length > 0 ? candidatePool[0] : PROBLEMS[0];
  });

  const triggerRoulette = useCallback(() => {
    if (candidatePool.length === 0) return;
    setIsSpinning(true);

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * candidatePool.length);
      setCurrentProblem(candidatePool[randomIndex]);
      setRollCount(prev => prev + 1);
      setIsSpinning(false);
    }, 280);
  }, [candidatePool]);

  // Spacebar shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        triggerRoulette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerRoulette]);

  // Timer interval
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const applyPreset = (min, max) => {
    setMinRating(min);
    setMaxRating(max);
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topic)) {
        next.delete(topic);
      } else {
        next.add(topic);
      }
      return next;
    });
  };

  const toggleAllTopics = () => {
    if (selectedTopics.size === ALL_TOPICS.length) {
      setSelectedTopics(new Set());
    } else {
      setSelectedTopics(new Set(ALL_TOPICS));
    }
  };

  const isBookmarked = currentProblem && !!revision[currentProblem.slug]?.category;

  const lowRating = Math.min(minRating, maxRating);
  const highRating = Math.max(minRating, maxRating);
  const rangeLeftPercent = Math.max(0, Math.min(100, ((lowRating - 800) / (2400 - 800)) * 100));
  const rangeRightPercent = Math.max(0, Math.min(100, 100 - (((highRating - 800) / (2400 - 800)) * 100)));

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
            <span className="text-xs font-semibold text-[#1e3a8a]">Random Roulette · Pool of {candidatePool.length}</span>
          </div>
        </div>

        <h1 className="hero-framer-text text-3xl sm:text-5xl mb-3 tracking-tight">
          Break interview paralysis.
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto leading-relaxed mb-6 font-normal">
          Calibrated rating brackets, simulated pressure timer, and instant roll. Zero noise.
        </p>

        {/* Mode Toggle Pills */}
        <div className="inline-flex items-center p-1 bg-white border border-gray-200/90 rounded-full shadow-sm">
          <button
            onClick={() => setMode('rating')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'rating'
                ? 'bg-[#1a61fe] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1e3a8a]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>With Rating Mode</span>
          </button>
          <button
            onClick={() => setMode('pure')}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'pure'
                ? 'bg-[#1a61fe] text-white shadow-sm'
                : 'text-gray-500 hover:text-[#1e3a8a]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shuffle</span>
            <span>Pure Random</span>
          </button>
        </div>
      </section>

      {/* Rating Configurator Section */}
      {mode === 'rating' && (
        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#1a61fe] text-lg">signal_cellular_alt</span>
              <span className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">
                Calibrated Rating Bracket
              </span>
            </div>
            <span className="font-code text-xs text-[#1a61fe] font-bold bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              {lowRating} — {highRating}
            </span>
          </div>

          {/* Dual Range Slider */}
          <div className="space-y-3 py-1">
            <div className="relative w-full h-6 flex items-center">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative border border-gray-200/60">
                <div 
                  className="absolute h-full bg-[#1a61fe] rounded-full transition-all"
                  style={{ left: `${rangeLeftPercent}%`, right: `${rangeRightPercent}%` }}
                />
              </div>
              <input
                type="range"
                min="800"
                max="2400"
                step="50"
                value={minRating}
                onChange={e => setMinRating(parseInt(e.target.value, 10))}
                className="absolute w-full appearance-none bg-transparent pointer-events-auto accent-[#1a61fe] h-4 cursor-pointer"
              />
              <input
                type="range"
                min="800"
                max="2400"
                step="50"
                value={maxRating}
                onChange={e => setMaxRating(parseInt(e.target.value, 10))}
                className="absolute w-full appearance-none bg-transparent pointer-events-auto accent-[#1a61fe] h-4 cursor-pointer"
              />
            </div>
            <div className="flex justify-between font-code text-[11px] text-gray-400 px-1">
              <span>800 (CF Div.3)</span>
              <span>1500 (LC Med)</span>
              <span>2400+ (Grandmaster)</span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">
              Difficulty Presets
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Novice', min: 800, max: 1100 },
                { label: 'Specialist', min: 1200, max: 1500 },
                { label: 'Expert', min: 1600, max: 1900 },
                { label: 'Cand. Master', min: 2000, max: 2400 },
              ].map(p => {
                const isActive = lowRating === p.min && highRating === p.max;
                return (
                  <button
                    key={p.label}
                    onClick={() => applyPreset(p.min, p.max)}
                    className={`px-3 py-2 rounded-xl text-left flex items-center justify-between transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-[#1a61fe] border-[#1a61fe] text-white font-semibold shadow-sm' 
                        : 'bg-white border-gray-200/80 text-gray-600 hover:border-[#1a61fe] hover:text-[#1a61fe]'
                    }`}
                  >
                    <span className="text-xs font-semibold">{p.label}</span>
                    <span className="font-code text-[10px] opacity-80">{p.min}-{p.max}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Topic Filter Pills */}
      <div className="space-y-2 max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#1e3a8a] font-bold uppercase tracking-wider">
            Topic Filter ({selectedTopics.size}/{ALL_TOPICS.length})
          </span>
          <button
            onClick={toggleAllTopics}
            className="text-xs font-semibold text-[#1a61fe] hover:underline cursor-pointer"
          >
            {selectedTopics.size === ALL_TOPICS.length ? 'Clear All' : 'Select All'}
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {ALL_TOPICS.map(topic => {
            const isChecked = selectedTopics.has(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer select-none transition-all whitespace-nowrap border ${
                  isChecked
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white font-semibold shadow-sm'
                    : 'bg-white border-gray-200/80 text-gray-600 hover:border-[#1a61fe] hover:text-[#1a61fe]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isChecked ? 'bg-white' : 'bg-gray-300'}`} />
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spin / Generate Problem Big CTA matching AudanWeb */}
      <div className="max-w-3xl mx-auto w-full">
        <button
          onClick={triggerRoulette}
          disabled={candidatePool.length === 0}
          className="btn-brand w-full !py-4 !px-6 !rounded-2xl flex items-center justify-between text-base"
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-2xl ${isSpinning ? 'animate-spin' : ''}`}>
              casino
            </span>
            <span>{isSpinning ? 'Rolling Calibrated Seed...' : 'Spin / Generate Problem'}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white font-code text-xs border border-white/30 backdrop-blur-sm">
            <span>Press Space</span>
          </div>
        </button>
      </div>

      {/* Generated Problem Card */}
      {currentProblem ? (
        <div className={`bg-white border border-gray-100 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden transition-all duration-300 max-w-3xl mx-auto w-full ${isSpinning ? 'opacity-50 scale-[0.99]' : 'opacity-100 scale-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-50 text-[#1a61fe] flex items-center justify-center">
                <span className="material-symbols-outlined text-base">casino</span>
              </span>
              <span className="font-code text-xs text-gray-400 tracking-wider">
                LOCKED ROLL #{rollCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-[#1a61fe] border border-blue-100 font-code text-xs font-bold">
                Rating {currentProblem.rating}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${
                currentProblem.difficulty === 'Hard'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : currentProblem.difficulty === 'Medium'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {currentProblem.difficulty}
              </span>
            </div>
          </div>

          {/* Title & Topic */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-code text-base text-gray-400 font-bold">
                #{String(currentProblem.num).padStart(4, '0')}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a8a] tracking-tight leading-snug">
                {currentProblem.name}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
                {currentProblem.topic}
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-[#1a61fe] text-xs font-medium border border-blue-100">
                Frequency {currentProblem.frequency}%
              </span>
            </div>
          </div>

          {/* Complexity Metrics Grid */}
          <div className="bg-slate-50/70 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-[#1a61fe] text-base">speed</span>
              <span className="text-gray-500 font-medium">Time:</span>
              <span className="text-[#1e3a8a] font-bold font-code">{currentProblem.timeComplexity}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-[#1a61fe] text-base">memory</span>
              <span className="text-gray-500 font-medium">Space:</span>
              <span className="text-[#1e3a8a] font-bold font-code">{currentProblem.spaceComplexity}</span>
            </div>
          </div>

          {/* Company Target */}
          <div className="flex items-center gap-2.5 text-xs bg-blue-50/50 border border-blue-100 px-4 py-3 rounded-2xl">
            <span className="material-symbols-outlined text-base text-[#1a61fe]">domain</span>
            <span className="font-bold text-[#1e3a8a]">Target Company:</span>
            <span className="text-gray-600 font-code">
              {currentProblem.company} (High Priority Focus)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <a
              href={`https://leetcode.com/problems/${currentProblem.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-brand w-full !py-3 !rounded-2xl justify-between"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">code</span>
                <span>Solve in LeetCode</span>
              </span>
              <span className="material-symbols-outlined text-lg">open_in_new</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setRevision(currentProblem.slug, isBookmarked ? null : { category: 'must-do', interval: 1, lastReviewed: new Date().toISOString() });
                }}
                className={`py-2.5 px-3 rounded-2xl border text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white font-semibold shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-[#1a61fe] hover:text-[#1a61fe]'
                }`}
              >
                <span 
                  className="material-symbols-outlined text-lg"
                  style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {isBookmarked ? 'bookmark' : 'bookmark_border'}
                </span>
                <span className="text-[11px] font-semibold">{isBookmarked ? 'Bookmarked' : 'Save to Vault'}</span>
              </button>

              <button
                onClick={() => onOpenNotes(currentProblem)}
                className="bg-white border border-gray-200 text-gray-600 hover:text-[#1e3a8a] hover:border-[#1a61fe] px-3 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">edit_note</span>
                <span className="text-[11px] font-semibold">Add Notes</span>
              </button>

              <button
                onClick={triggerRoulette}
                className="btn-secondary !rounded-2xl !py-2.5 flex-col !gap-1"
              >
                <span className="material-symbols-outlined text-lg text-[#1a61fe]">replay</span>
                <span className="text-[11px] font-semibold">Roll Another</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center bg-white border border-gray-100 rounded-[2.5rem] text-gray-500 text-xs shadow-sm max-w-3xl mx-auto w-full">
          No problems found within the selected rating bracket. Adjust the slider or reset topics!
        </div>
      )}

      {/* Practice Timer Widget */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#1a61fe] border border-blue-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                Simulated Pressure
              </span>
              <span className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'}`} />
            </div>
            <div className="text-2xl text-[#1e3a8a] font-bold font-code tracking-tight">
              {formatTimer(timerSeconds)}
            </div>
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsTimerRunning(false);
              setTimerSeconds(25 * 60);
            }}
            className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:text-[#1e3a8a] flex items-center justify-center transition-colors cursor-pointer"
            title="Reset to 25m"
          >
            <span className="material-symbols-outlined text-xl">restart_alt</span>
          </button>
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="btn-brand !py-2 !px-4 text-xs font-bold"
          >
            <span className="material-symbols-outlined text-base">
              {isTimerRunning ? 'pause' : 'play_arrow'}
            </span>
            <span>{isTimerRunning ? 'Pause' : timerSeconds === 25*60 ? 'Start 25m' : 'Resume'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
