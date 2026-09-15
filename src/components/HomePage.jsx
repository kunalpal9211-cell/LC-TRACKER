import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SpiderLogo from './SpiderLogo';

// Real sample problems for the live interactive sandbox
const RADAR_DEMO_DATA = {
  google: {
    name: 'Google',
    role: 'SDE II / SWE III Rounds',
    questions: [
      { num: 300, name: 'Longest Increasing Subsequence', topic: 'Dynamic Programming', rating: 1812, tier: 'Expert', freq: 96, diff: 'Medium' },
      { num: 127, name: 'Word Ladder', topic: 'Graphs (BFS)', rating: 1856, tier: 'Expert', freq: 91, diff: 'Hard' },
      { num: 4, name: 'Median of Two Sorted Arrays', topic: 'Binary Search', rating: 2042, tier: 'Candidate Master', freq: 88, diff: 'Hard' },
      { num: 76, name: 'Minimum Window Substring', topic: 'Sliding Window', rating: 1953, tier: 'Candidate Master', freq: 85, diff: 'Hard' }
    ]
  },
  meta: {
    name: 'Meta',
    role: 'E4 / E5 Coding Interviews',
    questions: [
      { num: 314, name: 'Binary Tree Vertical Order Traversal', topic: 'Trees (BFS)', rating: 1620, tier: 'Expert', freq: 98, diff: 'Medium' },
      { num: 408, name: 'Valid Word Abbreviation', topic: 'Two Pointers', rating: 1480, tier: 'Specialist', freq: 94, diff: 'Easy' },
      { num: 227, name: 'Basic Calculator II', topic: 'Monotonic Stack', rating: 1785, tier: 'Expert', freq: 90, diff: 'Medium' },
      { num: 528, name: 'Random Pick with Weight', topic: 'Prefix Sum & Binary Search', rating: 1690, tier: 'Expert', freq: 87, diff: 'Medium' }
    ]
  },
  uber: {
    name: 'Uber',
    role: 'L4 / L5 Core Algorithms',
    questions: [
      { num: 42, name: 'Trapping Rain Water', topic: 'Two Pointers / Stack', rating: 1944, tier: 'Candidate Master', freq: 97, diff: 'Hard' },
      { num: 200, name: 'Number of Islands', topic: 'Matrix DFS/BFS', rating: 1490, tier: 'Specialist', freq: 93, diff: 'Medium' },
      { num: 23, name: 'Merge k Sorted Lists', topic: 'Min-Heap / Divide & Conquer', rating: 1820, tier: 'Expert', freq: 89, diff: 'Hard' },
      { num: 253, name: 'Meeting Rooms II', topic: 'Interval Greedy', rating: 1610, tier: 'Expert', freq: 86, diff: 'Medium' }
    ]
  },
  amazon: {
    name: 'Amazon',
    role: 'SDE I / SDE II Technical Bar',
    questions: [
      { num: 146, name: 'LRU Cache', topic: 'Design & Hash Doubly-LL', rating: 1720, tier: 'Expert', freq: 99, diff: 'Medium' },
      { num: 210, name: 'Course Schedule II', topic: 'Topological Sort', rating: 1790, tier: 'Expert', freq: 92, diff: 'Medium' },
      { num: 994, name: 'Rotting Oranges', topic: 'Multi-Source BFS', rating: 1540, tier: 'Specialist', freq: 90, diff: 'Medium' },
      { num: 815, name: 'Bus Routes', topic: 'Breadth-First Search', rating: 2180, tier: 'Candidate Master', freq: 84, diff: 'Hard' }
    ]
  },
  apple: {
    name: 'Apple',
    role: 'ICT3 / ICT4 System & Algorithms',
    questions: [
      { num: 54, name: 'Spiral Matrix', topic: 'Simulation & Matrix', rating: 1510, tier: 'Specialist', freq: 92, diff: 'Medium' },
      { num: 15, name: '3Sum', topic: 'Two Pointers', rating: 1580, tier: 'Specialist', freq: 90, diff: 'Medium' },
      { num: 72, name: 'Edit Distance', topic: '2D Dynamic Programming', rating: 2010, tier: 'Candidate Master', freq: 86, diff: 'Medium' },
      { num: 124, name: 'Binary Tree Maximum Path Sum', topic: 'Tree Post-Order DFS', rating: 2150, tier: 'Candidate Master', freq: 83, diff: 'Hard' }
    ]
  }
};

export default function HomePage({ onExplore, isUserSignedIn }) {
  const { user, setIsAuthModalOpen } = useAuth();
  const handleAction = (tab = 'guardians') => {
    if (onExplore) {
      onExplore(tab);
    }
  };

  const [openFaq, setOpenFaq] = useState(null);
  const [activeDemoCompany, setActiveDemoCompany] = useState('google');

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const selectedDemo = RADAR_DEMO_DATA[activeDemoCompany];

  const FAQS = [
    {
      q: "How does SPYDEX determine company question frequencies?",
      a: "SPYDEX indexes interview data across 40+ engineering powerhouses and calculates weighted frequency scores across 30-day, 90-day, 6-month, and all-time windows. Instead of practicing outdated questions from 2019, you focus precisely on what interview panels are testing right now."
    },
    {
      q: "What is a ZeroTrac contest rating and why does it matter?",
      a: "Traditional 'Easy/Medium/Hard' difficulty labels are notoriously subjective and uncalibrated — a 1450 Medium and a 2050 Medium are entirely different beasts. ZeroTrac ratings are mathematically computed Elo ratings (from 1,000 to 2,600+) derived from thousands of weekly contest performances. This lets you train precisely on your boundary of cognitive growth."
    },
    {
      q: "What is the Guardians Problems sheet?",
      a: "Guardians is our hand-curated curriculum of 596 core algorithmic problems. Unlike generic 75 or 150 problem lists that leave massive algorithmic blind spots, Guardians is built around core invariant patterns (Monotonic Stacks, Fast/Slow Pointers, Top-Down & Bottom-Up DP, DSU, Segment Trees) so you are prepared for senior-level rounds."
    },
    {
      q: "How does offline-first storage and cloud sync work?",
      a: "SPYDEX is engineered offline-first. Every problem you solve, note you record, and revision tag you mark is instantly saved in your local browser cache with microsecond response times. When signed in, SPYDEX seamlessly replicates your progress to our secure cloud vault in the background."
    },
    {
      q: "Can I use SPYDEX completely free?",
      a: "Yes. SPYDEX is built by engineers for engineers. All 596 Guardians problems, 40+ company interview trackers, ZeroTrac rating ladders, topic roadmaps, and telemetry dashboards are completely free to use."
    }
  ];

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto px-4 md:px-6 space-y-20 sm:space-y-24 animate-fadeIn">
      {/* 1. Hero Section */}
      <section className="text-center pt-6 sm:pt-12 pb-2 max-w-3xl mx-auto">
        {/* Modern High-Tech Status Pill */}
        <div className="inline-flex items-center justify-center mb-5 sm:mb-6">
          <div className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#FEFFFF]/90 dark:bg-[#182226]/90 backdrop-blur-md shadow-sm border border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#3AAFA9]/60 transition-all cursor-default group">
            <SpiderLogo size={16} variant="icon-only" className="text-[#2B7A78] dark:text-[#3AAFA9] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#17252A] dark:text-[#CBD5E1] transition-colors">
              SPYDEX WEB RADAR · REAL-TIME TELEMETRY
            </span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3AAFA9] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2B7A78]"></span>
            </span>
          </div>
        </div>

        {/* Distinctive Hero Headline */}
        <h1 className="hero-framer-text text-3xl xs:text-4xl sm:text-6xl md:text-7xl mb-4 sm:mb-6 tracking-tight font-extrabold text-[#17252A] dark:text-[#F8FAFC] leading-[1.12] transition-colors">
          Target the exact algorithms <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-[#2B7A78] via-[#3AAFA9] to-[#2B7A78] dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
            that get you hired.
          </span>
        </h1>
        
        {/* Precise Engineering Subtitle */}
        <p className="text-sm sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 font-normal px-2 transition-colors">
          Real-time interview frequency telemetry across 40+ tech giants, calibrated ZeroTrac contest ratings, and the curated 596 Guardians curriculum. No guesswork. Pure algorithmic precision.
        </p>

        {/* Signed In User Pill */}
        {isUserSignedIn && user && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-6 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Signed in as <strong>{user.name}</strong> ({user.email})</span>
          </div>
        )}

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full max-w-xs sm:max-w-none mx-auto mb-10 sm:mb-12">
          <button
            onClick={() => handleAction('guardians')}
            className="btn-brand w-full sm:w-auto min-w-[210px] !py-3 sm:!py-3.5 !px-6 text-sm sm:text-base font-semibold shadow-lg shadow-[#3AAFA9]/25 hover:shadow-xl hover:shadow-[#3AAFA9]/35 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Start Solving (596 Invariants)</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
          {!isUserSignedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-secondary w-full sm:w-auto min-w-[200px] !py-3 sm:!py-3.5 !px-6 text-sm sm:text-base font-semibold cursor-pointer flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          ) : (
            <button
              onClick={() => handleAction('companies')}
              className="btn-secondary w-full sm:w-auto min-w-[190px] !py-3 sm:!py-3.5 !px-6 text-sm sm:text-base font-semibold cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Company Radar (660+)</span>
              <span className="material-symbols-outlined text-base text-gray-400">arrow_forward</span>
            </button>
          )}
        </div>

        {/* 2. Interactive Live SPYDEX Radar Sandbox (Anti-Copy-Site Weapon) */}
        <div className="relative w-full text-left bg-[#17252A] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-[#2B7A78]/50 shadow-[0_20px_50px_rgba(23,37,42,0.25)] ring-1 ring-white/10 text-white overflow-hidden transition-all">
          {/* Subtle Ambient Spiderweb Mesh in Terminal Background */}
          <div className="absolute -right-8 -top-8 w-60 h-60 pointer-events-none opacity-[0.08] text-[#3AAFA9]">
            <SpiderLogo size={240} variant="icon-only" />
          </div>

          {/* Terminal Topbar */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <SpiderLogo size={16} variant="icon-only" className="text-[#3AAFA9]" />
                <span className="font-mono text-xs font-semibold text-[#3AAFA9]">
                  spydex-radar --stream=live-interviews
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400 font-medium">
                Live Frequency Stream (Last 30 Days)
              </span>
            </div>
          </div>

          {/* Interactive Company Switcher Chips */}
          <div className="pt-4 pb-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {['google', 'meta', 'uber', 'amazon', 'apple'].map((cid) => {
                const isActive = activeDemoCompany === cid;
                return (
                  <button
                    key={cid}
                    onClick={() => setActiveDemoCompany(cid)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#3AAFA9] text-[#17252A] shadow-md shadow-[#3AAFA9]/30 font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5'
                    }`}
                  >
                    {cid}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-gray-400 hidden md:inline">
              Target: <span className="text-white font-semibold">{selectedDemo.role}</span>
            </span>
          </div>

          {/* Live Questions Feed in Sandbox */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
            {selectedDemo.questions.map((q) => (
              <div
                key={q.num}
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#3AAFA9]/40 rounded-xl p-3 sm:p-3.5 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#3AAFA9] font-bold">
                      #{q.num}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        q.diff === 'Easy' ? 'bg-emerald-500/20 text-emerald-300' :
                        q.diff === 'Medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-rose-500/20 text-rose-300'
                      }`}>
                        {q.diff}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#2B7A78]/40 text-[#DEF2F1] border border-[#3AAFA9]/30">
                        Elo {q.rating}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-[#DEF2F1] transition-colors truncate">
                    {q.name}
                  </h4>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    Topic: {q.topic}
                  </span>
                </div>

                {/* Frequency Bar */}
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between gap-3 text-[11px] font-mono">
                  <span className="text-gray-400">30d Frequency</span>
                  <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] rounded-full"
                        style={{ width: `${q.freq}%` }}
                      ></div>
                    </div>
                    <span className="text-[#3AAFA9] font-bold">{q.freq}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Sandbox Footer Action */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400 font-mono text-center sm:text-left">
              Showing 4 of 60+ verified interview questions for {selectedDemo.name}
            </span>
            <button
              onClick={() => handleAction('companies')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#3AAFA9] hover:text-[#17252A] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <span>Explore Full {selectedDemo.name} Radar in App</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. High-Density Telemetry Metrics Strip */}
      <section className="border-y border-[#DEF2F1] py-6 sm:py-8 overflow-hidden bg-[#DEF2F1]/30 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-3xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto px-4">
          <div className="space-y-1">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17252A] dark:text-white tracking-tight">40+</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tech Giants Monitored</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2B7A78] dark:text-[#3AAFA9] tracking-tight">596</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Curated Invariants</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3AAFA9] dark:text-[#5EEAD4] tracking-tight">1,000–2,600+</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ZeroTrac Contest Elo</div>
          </div>
          <div className="space-y-1">
            <div className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17252A] dark:text-white tracking-tight">&lt;10ms</div>
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Local-First Latency</div>
          </div>
        </div>
      </section>

      {/* 4. The SPYDEX Advantage (Architectural Pillars — No tacky With/Without table!) */}
      <section className="space-y-10 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full px-4 py-1.5 shadow-sm transition-colors">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2B7A78] dark:text-[#3AAFA9]">
              The SPYDEX Advantage
            </span>
          </div>
          <h2 className="hero-framer-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#17252A] dark:text-[#F8FAFC] transition-colors">
            Engineered for high-conviction engineering rounds.
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors">
            Three architectural pillars designed to replace scattered spreadsheets and outdated forum threads with calibrated algorithmic data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Pillar 1 */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">radar</span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2B7A78] dark:text-[#3AAFA9]">
                Pillar 01
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mt-1 mb-3 transition-colors">
                Live 30-Day Interview Radar
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Interview loops evolve rapidly. Instead of grinding static sheets from 2020, SPYDEX continuously calculates interview frequency distributions over 30-day, 90-day, and 6-month windows for 40+ engineering organizations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1] dark:border-[#2D3E47] text-xs font-mono text-[#2B7A78] dark:text-[#3AAFA9] font-semibold transition-colors">
              ● Zero outdated questions
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">tune</span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2B7A78] dark:text-[#3AAFA9]">
                Pillar 02
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mt-1 mb-3 transition-colors">
                ZeroTrac Contest Calibration
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                LeetCode's Easy/Medium/Hard tags are subjective and misleading. SPYDEX calibrates every problem against official contest Elo ratings (1000 to 2600+), so you train on your exact boundary of cognitive growth without wasting time.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1] dark:border-[#2D3E47] text-xs font-mono text-[#2B7A78] dark:text-[#3AAFA9] font-semibold transition-colors">
              ● Calibrated Elo progression
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9]/40 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2B7A78] dark:text-[#3AAFA9]">
                Pillar 03
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mt-1 mb-3 transition-colors">
                The 596 Guardians Invariants
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Grinding 3,000 random problems causes burnout and shallow retention. Guardians distills DSA into 596 foundational invariants covering Monotonic Stacks, Fast/Slow Pointers, 2D DP, and Graph Invariants for permanent mastery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1] dark:border-[#2D3E47] text-xs font-mono text-[#2B7A78] dark:text-[#3AAFA9] font-semibold transition-colors">
              ● 100% pattern coverage
            </div>
          </div>
        </div>
      </section>

      {/* 5. The 5 Core Workspace Modules */}
      <section id="features" className="space-y-10 sm:space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full px-4 py-1.5 shadow-sm transition-colors">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
              Workspace Arsenal
            </span>
          </div>
          <h2 className="hero-framer-text text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#17252A] dark:text-[#F8FAFC] transition-colors">
            5 Specialized Tools.<br />
            <span className="text-gray-400 dark:text-gray-500 font-normal">One cohesive preparation suite.</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 transition-colors">
            Click any module below to launch directly into that workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Module 1: Company-Wise Radar */}
          <div 
            onClick={() => handleAction('companies')}
            className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9]/70 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2B7A78] dark:group-hover:bg-[#3AAFA9] group-hover:text-white dark:group-hover:text-[#12181C] transition-all">
                <span className="material-symbols-outlined text-2xl">domain</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-xs font-mono font-semibold mb-3">
                <span>01. Company-Wise Radar</span>
              </div>
              <h3 className="text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-2 tracking-tight transition-colors">
                Real-Time Company Telemetry
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Filter recent coding interview questions across Google, Meta, Amazon, Microsoft, Apple, Uber, Netflix, Bloomberg, Adobe, and ByteDance with 30-day, 90-day, and 6-month recency filters.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500 font-medium">
              <span>40+ firms · Live sync</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold group-hover:text-[#3AAFA9] dark:group-hover:text-[#5EEAD4] transition-colors">Launch Radar →</span>
            </div>
          </div>

          {/* Module 2: Rating-Wise Ladder */}
          <div 
            onClick={() => handleAction('ratings')}
            className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9]/70 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2B7A78] dark:group-hover:bg-[#3AAFA9] group-hover:text-white dark:group-hover:text-[#12181C] transition-all">
                <span className="material-symbols-outlined text-2xl">trending_up</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-xs font-mono font-semibold mb-3">
                <span>02. Rating-Wise Ladder</span>
              </div>
              <h3 className="text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-2 tracking-tight transition-colors">
                ZeroTrac Contest Tiers
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Calibrated against official contest ratings from 1000 to 2600+. Filter through 5 competitive tiers (Novice, Specialist, Expert, Candidate Master, Grandmaster) or dial your custom dual-range rating slider.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500 font-medium">
              <span>5 Elo tiers · Slider</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold group-hover:text-[#3AAFA9] dark:group-hover:text-[#5EEAD4] transition-colors">Climb Ladder →</span>
            </div>
          </div>

          {/* Module 3: Guardians Sheet */}
          <div 
            onClick={() => handleAction('guardians')}
            className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9]/70 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2B7A78] dark:group-hover:bg-[#3AAFA9] group-hover:text-white dark:group-hover:text-[#12181C] transition-all">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-xs font-mono font-semibold mb-3">
                <span>03. Guardians Problems</span>
              </div>
              <h3 className="text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-2 tracking-tight transition-colors">
                Curated 596 Problem Sheet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                The high-yield invariant DSA syllabus. Every problem carefully vetted with difficulty tags, company appearances, and personal revision notes support to build deep algorithmic mastery.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500 font-medium">
              <span>596 core invariants</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold group-hover:text-[#3AAFA9] dark:group-hover:text-[#5EEAD4] transition-colors">Open Guardians →</span>
            </div>
          </div>

          {/* Module 4: Topic-Wise Mastery */}
          <div 
            onClick={() => handleAction('topics')}
            className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9]/70 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2B7A78] dark:group-hover:bg-[#3AAFA9] group-hover:text-white dark:group-hover:text-[#12181C] transition-all">
                <span className="material-symbols-outlined text-2xl">account_tree</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-xs font-mono font-semibold mb-3">
                <span>04. Topic-Wise Architecture</span>
              </div>
              <h3 className="text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-2 tracking-tight transition-colors">
                Pattern-by-Pattern Accordions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Break down the Guardians sheet into 14 distinct paradigms: Arrays, Two Pointers, Trees, Dynamic Programming, Graphs, and Backtracking. Track topic percentage completion with live circular rings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500 font-medium">
              <span>14 topical frameworks</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold group-hover:text-[#3AAFA9] dark:group-hover:text-[#5EEAD4] transition-colors">View Topics →</span>
            </div>
          </div>

          {/* Module 5: Stats & Telemetry */}
          <div 
            onClick={() => handleAction('stats')}
            className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_8px_30px_rgba(43,122,120,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-xl hover:border-[#3AAFA9] dark:hover:border-[#3AAFA9]/70 transition-all duration-300 flex flex-col justify-between group md:col-span-2 lg:col-span-2 cursor-pointer"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] border border-[#3AAFA9]/30 dark:border-[#3AAFA9]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2B7A78] dark:group-hover:bg-[#3AAFA9] group-hover:text-white dark:group-hover:text-[#12181C] transition-all">
                <span className="material-symbols-outlined text-2xl">monitoring</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DEF2F1] dark:bg-[#202C32] text-[#2B7A78] dark:text-[#3AAFA9] text-xs font-mono font-semibold mb-3">
                <span>05. Telemetry &amp; Consistency Hub</span>
              </div>
              <h3 className="text-xl font-bold text-[#17252A] dark:text-[#F8FAFC] mb-2 tracking-tight transition-colors">
                Cognitive Velocity &amp; Cloud Vault
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
                Track your cognitive velocity, difficulty distribution donut charts, streaks, and 12-week activity heatmaps. Automatic two-way cloud synchronization ensures your solved problems and personal notes are safely preserved.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#DEF2F1]/80 dark:border-[#2D3E47] flex items-center justify-between text-xs font-mono text-gray-400 dark:text-gray-500 font-medium">
              <span>Live Heatmaps · Cloud Sync</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9] font-bold group-hover:text-[#3AAFA9] dark:group-hover:text-[#5EEAD4] transition-colors">View Telemetry →</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Technical FAQs */}
      <section className="space-y-8 max-w-3xl mx-auto w-full">
        <div className="text-center space-y-3">
          <div className="inline-block bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-md border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full px-4 py-1.5 shadow-sm transition-colors">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#17252A] dark:text-[#CBD5E1]">
              Frequently Asked Questions
            </span>
          </div>
          <h2 className="hero-framer-text text-3xl sm:text-4xl font-bold tracking-tight text-[#17252A] dark:text-[#F8FAFC] transition-colors">
            Technical FAQ
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-[#FEFFFF]/85 dark:bg-[#182226]/90 backdrop-blur-xl rounded-2xl border border-[#DEF2F1] dark:border-[#2D3E47] shadow-[0_4px_20px_rgba(43,122,120,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#DEF2F1]/30 dark:hover:bg-[#202C32]/40 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold text-[#17252A] dark:text-[#F8FAFC] transition-colors">{faq.q}</span>
                  <span className={`material-symbols-outlined text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-[#3AAFA9] dark:text-[#3AAFA9]' : ''}`}>
                    expand_more
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-[#DEF2F1]/60 dark:border-[#2D3E47] pt-3 animate-fadeIn transition-colors">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Final High-Conviction CTA */}
      <section className="text-center py-10 sm:py-14 px-4 sm:px-8 bg-[#17252A] dark:bg-[#151D22] text-white rounded-[2rem] sm:rounded-[3rem] border border-[#2B7A78]/40 dark:border-[#2D3E47] shadow-[0_20px_50px_rgba(23,37,42,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] max-w-3xl mx-auto w-full space-y-5 sm:space-y-6 transition-colors">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#3AAFA9] dark:text-[#3AAFA9] text-xs font-mono font-semibold">
          <span>● ZERO NOISE · PURE PERFORMANCE</span>
        </div>
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Prepare with algorithmic precision.
        </h2>
        <p className="text-sm sm:text-base text-gray-300 dark:text-gray-400 max-w-md mx-auto leading-relaxed px-2 transition-colors">
          Eliminate guesswork. Focus on high-signal interview problems calibrated for top-tier software engineering rounds.
        </p>
        <div className="pt-2 flex items-center justify-center">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="btn-brand !py-3.5 !px-8 text-sm sm:text-base font-semibold w-full sm:w-auto shadow-lg shadow-[#3AAFA9]/20 cursor-pointer"
          >
            <span>Sign in with Google</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 8. Clean Engineering Footer */}
      <footer className="pt-8 pb-14 border-t border-[#DEF2F1] dark:border-[#2D3E47] text-center text-xs text-gray-500 dark:text-gray-400 space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 dark:text-gray-300 font-medium">
          <a href="#features" className="hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors">Workspace Arsenal</a>
          <span>·</span>
          <button onClick={() => handleAction('companies')} className="hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors cursor-pointer">Company Radar</button>
          <span>·</span>
          <button onClick={() => handleAction('ratings')} className="hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors cursor-pointer">Elo Ladder</button>
          <span>·</span>
          <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-[#3AAFA9] dark:hover:text-[#3AAFA9] transition-colors cursor-pointer">Google Sign In</button>
        </div>

        {/* Creator / LinkedIn Profile */}
        <div className="flex items-center justify-center">
          <a
            href="https://www.linkedin.com/in/tushar-sharma-702069305/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 hover:bg-white dark:bg-[#182226] dark:hover:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] shadow-xs text-gray-700 dark:text-gray-200 hover:text-[#0077B5] dark:hover:text-[#38A8EC] hover:border-[#0077B5]/40 transition-all group font-medium text-xs hover:shadow-sm"
          >
            <svg className="w-4 h-4 fill-[#0077B5] shrink-0" viewBox="0 0 24 24">
              <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z"/>
            </svg>
            <span>Developed by <strong className="text-gray-900 dark:text-white group-hover:text-[#0077B5] dark:group-hover:text-[#38A8EC] font-semibold">Tushar Sharma</strong></span>
            <span className="material-symbols-outlined text-[14px] text-gray-400 group-hover:text-[#0077B5] dark:group-hover:text-[#38A8EC] transition-transform group-hover:translate-x-0.5">
              open_in_new
            </span>
          </a>
        </div>

        <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500">© 2026 SPYDEX · High-Performance DSA Preparation Suite</p>
      </footer>
    </div>
  );
}
