import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth, FALLBACK_AVATAR } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import SpiderLogo from './SpiderLogo';

export default function Header({ onNavigateHome, isUserSignedIn, onSelectTab, activeTab, isViewingHome, onNavigateWorkspace }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, setIsAuthModalOpen } = useAuth();
  const { streak } = useProgress();
  const [onlineCount, setOnlineCount] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchActiveUsers = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const res = await fetch(`${apiBase}/api/realtime-users`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.activeCount) {
            setOnlineCount(Math.max(data.activeCount, 1));
          }
        }
      } catch {}
    };

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const navTabs = [
    { id: 'guardians', label: 'Guardians' },
    { id: 'topics', label: 'Topics' },
    { id: 'companies', label: 'Companies' },
    { id: 'ratings', label: 'Ratings' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-2.5 sm:px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-between gap-2 sm:gap-4 p-1.5 sm:p-2 px-2.5 sm:px-3.5 bg-[#FEFFFF]/90 dark:bg-[#151D22]/90 backdrop-blur-xl border border-[#DEF2F1] dark:border-[#2D3E47] rounded-full shadow-[0_12px_36px_rgba(43,122,120,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.7)] ring-1 ring-white/80 dark:ring-white/5 max-w-5xl w-full mx-auto transition-colors duration-300">
        {/* Brand */}
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer focus:outline-none shrink-0 group"
          title="Return to Home"
        >
          <SpiderLogo size={32} className="group-hover:scale-105 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-extrabold text-[#17252A] dark:text-[#F8FAFC] text-sm sm:text-base tracking-tight transition-colors">
              SPYDEX
            </span>
          </div>
        </button>

        {/* Navigation Tabs */}
        <div className="hidden md:flex items-center gap-0.5 lg:gap-1 bg-[#DEF2F1]/50 dark:bg-[#1D272C] p-0.5 lg:p-1 rounded-full border border-[#DEF2F1] dark:border-[#1F243A] transition-colors shrink min-w-0">
          <button
            onClick={onNavigateHome}
            className={`px-2 lg:px-2.5 py-1 rounded-full text-[11px] lg:text-xs font-semibold transition-all cursor-pointer ${
              isViewingHome
                ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] dark:bg-none dark:bg-white text-white dark:text-[#0E1417] shadow-sm dark:shadow-[0_2px_12px_rgba(255,255,255,0.25)] font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1] dark:hover:bg-[#26353D]'
            }`}
          >
            Home
          </button>
          {navTabs.map(tab => {
            const isActive = !isViewingHome && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab && onSelectTab(tab.id)}
                className={`px-2 lg:px-2.5 py-1 rounded-full text-[11px] lg:text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] dark:bg-none dark:bg-white text-white dark:text-[#0E1417] shadow-sm dark:shadow-[0_2px_12px_rgba(255,255,255,0.25)] font-bold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1] dark:hover:bg-[#26353D]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Action Widgets */}
        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0">
          {/* Live Realtime Active Users Badge */}
          <div 
            title="Realtime Active Engineers preparing DSA on SPYDEX"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0 cursor-default transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-bold">{onlineCount}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 hidden min-[520px]:inline">Live</span>
          </div>

          {/* Theme Toggle Button (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Dark Mode"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-[#DEF2F1]/60 dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-gray-600 dark:text-amber-400 hover:text-[#17252A] dark:hover:text-amber-300 hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-base sm:text-lg transition-transform duration-300">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* If authenticated */}
          {isUserSignedIn ? (
            <>
              {/* Streak pill */}
              <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/70 dark:border-orange-800/60 text-orange-700 dark:text-orange-300 text-xs font-semibold shrink-0 transition-colors">
                <span className="material-symbols-outlined text-sm text-orange-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
                <span>{streak}d</span>
              </div>

              {/* User Profile Avatar / Logout */}
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-[#DEF2F1]/80 dark:bg-[#1D272C] border border-[#2B7A78]/30 dark:border-[#3AAFA9]/30 hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-all cursor-pointer shrink-0 shadow-xs"
                title="Account Settings & Profile"
              >
                <div className="relative">
                  <img
                    src={user.avatar || FALLBACK_AVATAR}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                    className="w-6 h-6 rounded-full object-cover shrink-0 aspect-square ring-1 ring-[#3AAFA9] dark:ring-[#38BDF8]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#12181C]"></span>
                </div>
                <span className="text-xs font-bold text-[#17252A] dark:text-[#F8FAFC] max-w-[85px] truncate inline-block">
                  {user.name.split(' ')[0]}
                </span>
              </button>
            </>
          ) : (
            /* Before Sign-In: Direct Firebase Google Sign-In Button with Dummy Profile avatar preview */
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="btn-brand text-xs !py-1.5 !px-2.5 sm:!px-3.5 flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-sm group shrink-0"
            >
              <img
                src={FALLBACK_AVATAR}
                alt="Profile"
                className="w-4 h-4 rounded-full object-cover ring-1 ring-white/60 shrink-0 group-hover:scale-105 transition-transform aspect-square"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span>Sign in</span>
            </button>
          )}

          {/* Mobile Menu Button (< md) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Navigation Menu"
            title="All Features & Tabs"
            className="md:hidden flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#DEF2F1]/60 dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-gray-700 dark:text-gray-200 hover:text-[#17252A] dark:hover:text-white hover:bg-[#DEF2F1] dark:hover:bg-[#26353D] transition-all cursor-pointer shadow-xs shrink-0"
          >
            <span className="material-symbols-outlined text-base sm:text-lg transition-transform duration-200">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Dropdown Card (< md) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-3 right-3 max-w-sm mx-auto pointer-events-auto animate-scaleUp z-50">
          <div className="bg-[#FEFFFF]/95 dark:bg-[#151D22]/95 backdrop-blur-2xl border border-[#DEF2F1] dark:border-[#2D3E47] rounded-3xl p-3 shadow-2xl space-y-1 ring-1 ring-black/5 dark:ring-white/10">
            {/* User Account Bar in Mobile Drawer */}
            <div className="p-2.5 rounded-2xl bg-[#DEF2F1]/40 dark:bg-[#202C32]/60 border border-[#DEF2F1] dark:border-[#2D3E47] mb-2 flex items-center justify-between">
              {isUserSignedIn ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={user.avatar || FALLBACK_AVATAR}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-[#3AAFA9]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#17252A] dark:text-[#F8FAFC] truncate">{user.name}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Signed In (Online)</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Guest User</span>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="btn-brand text-xs !py-1 !px-3 font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 font-mono">
              <span>Platform Arsenal</span>
              <span className="text-[#2B7A78] dark:text-[#3AAFA9]">5 Core Sheets</span>
            </div>

            {/* Home Option */}
            <button
              onClick={() => {
                onNavigateHome();
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                isViewingHome
                  ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-[#DEF2F1]/60 dark:hover:bg-[#202C32]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-lg">home</span>
                <span>Home Hub</span>
              </div>
              <span className="text-[10px] opacity-70 font-mono">Overview</span>
            </button>

            {/* Feature Tabs */}
            {navTabs.map(tab => {
              const isActive = !isViewingHome && activeTab === tab.id;
              const icon = tab.id === 'guardians' ? 'shield' : tab.id === 'topics' ? 'account_tree' : tab.id === 'companies' ? 'domain' : tab.id === 'ratings' ? 'trending_up' : 'monitoring';
              const subtitle = tab.id === 'guardians' ? '596 Problems' : tab.id === 'topics' ? 'Pattern-Wise' : tab.id === 'companies' ? '660+ Companies' : tab.id === 'ratings' ? 'ZeroTrac Elo' : 'Telemetry';

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onSelectTab && onSelectTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#2B7A78] to-[#3AAFA9] text-white shadow-sm font-bold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-[#DEF2F1]/60 dark:hover:bg-[#202C32]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg">{icon}</span>
                    <span>{tab.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] opacity-70 font-mono">{subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
