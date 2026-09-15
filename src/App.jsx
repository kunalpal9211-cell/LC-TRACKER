import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider, useProgress } from './context/ProgressContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import GuardiansSheet from './components/GuardiansSheet';
import TopicSheet from './components/TopicSheet';
import CompanyWise from './components/CompanyWise';
import RatingWise from './components/RatingWise';
import StatsHub from './components/StatsHub';
import AuthModal from './components/AuthModal';
import NotesModal from './components/NotesModal';
import ScrollTopBar from './components/ScrollTopBar';

const VALID_TABS = ['guardians', 'topics', 'companies', 'ratings', 'stats'];

function MainApp() {
  const { user, setIsAuthModalOpen } = useAuth();
  const [activeTab, setActiveTab] = useState('guardians'); // 'guardians' | 'topics' | 'companies' | 'ratings' | 'stats'
  const [activeNoteProblem, setActiveNoteProblem] = useState(null);
  const { notes, saveNote } = useProgress();

  const isUserSignedIn = Boolean(user && !user.isGuest);

  const [isViewingHome, setIsViewingHome] = useState(() => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (VALID_TABS.includes(hash)) return false;
      if (hash === 'home') return true;
      const stored = sessionStorage.getItem('spydex_viewing_home');
      if (stored !== null) return stored === 'true';
    } catch {}
    return !Boolean(user && !user.isGuest);
  });

  const navigateToTab = (tab) => {
    if (tab) {
      setActiveTab(tab);
      window.location.hash = tab;
    }
    setIsViewingHome(false);
    try {
      sessionStorage.setItem('spydex_viewing_home', 'false');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setIsViewingHome(true);
    window.location.hash = 'home';
    try {
      sessionStorage.setItem('spydex_viewing_home', 'true');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync state with URL hash (e.g. #topics, #guardians, #home)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (hash === 'home') {
        setIsViewingHome(true);
      } else if (VALID_TABS.includes(hash)) {
        setActiveTab(hash);
        setIsViewingHome(false);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const showHomePage = isViewingHome;

  return (
    <div className="relative min-h-screen bg-[#FEFFFF] dark:bg-[#12181C] text-[#17252A] dark:text-[#F8FAFC] overflow-x-hidden font-body antialiased flex flex-col selection:bg-[#3AAFA9] dark:selection:bg-[#0284C7] selection:text-white">
      {/* High-Performance Atmospheric Studio & Galaxy Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#FEFFFF] dark:bg-[#12181C]">
        <div className="absolute inset-0 bg-grid opacity-75 dark:opacity-30" />
        {/* Subtle Spiderweb Coordinate Radar Mesh */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[840px] h-[840px] pointer-events-none opacity-[0.06] dark:opacity-[0.05]">
          <svg className="w-full h-full text-[#2B7A78] dark:text-slate-400" viewBox="0 0 100 100" fill="none">
            <polygon points="50,6 81.1,18.9 94,50 81.1,81.1 50,94 18.9,81.1 6,50 18.9,18.9" stroke="currentColor" strokeWidth="0.6" />
            <polygon points="50,15 74.7,25.3 85,50 74.7,74.7 50,85 25.3,74.7 15,50 25.3,25.3" stroke="currentColor" strokeWidth="0.6" />
            <polygon points="50,26 67,33 74,50 67,67 50,74 33,67 26,50 33,33" stroke="currentColor" strokeWidth="0.6" />
            <polygon points="50,38 58.5,41.5 62,50 58.5,58.5 50,62 41.5,58.5 38,50 41.5,41.5" stroke="currentColor" strokeWidth="0.6" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.6" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.6" />
            <line x1="14.6" y1="14.6" x2="85.4" y2="85.4" stroke="currentColor" strokeWidth="0.6" />
            <line x1="85.4" y1="14.6" x2="14.6" y2="85.4" stroke="currentColor" strokeWidth="0.6" />
          </svg>
        </div>
        {/* High-Performance AROCK-Style Studio Vignette (Zero GPU Lag) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[520px] bg-[radial-gradient(ellipse_85%_65%_at_50%_-10%,rgba(58,175,169,0.22),transparent_70%)] dark:bg-[radial-gradient(ellipse_85%_65%_at_50%_-10%,rgba(58,72,79,0.65),transparent_75%)] pointer-events-none" />
        <div className="absolute top-48 -left-32 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(58,175,169,0.14),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(45,62,71,0.4),transparent_70%)] pointer-events-none" />
        <div className="absolute top-64 -right-32 w-[520px] h-[520px] bg-[radial-gradient(circle,rgba(43,122,120,0.12),transparent_70%)] dark:bg-[radial-gradient(circle,rgba(35,48,56,0.35),transparent_70%)] pointer-events-none" />
      </div>

      {/* Scroll Progress Slide Bar & Floating Up Button */}
      <ScrollTopBar />

      {/* Floating Pill Header */}
      <Header 
        onNavigateHome={navigateToHome} 
        isUserSignedIn={isUserSignedIn}
        isViewingHome={showHomePage}
        onSelectTab={navigateToTab}
        activeTab={activeTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-24 pb-12 sm:pb-16">
        {showHomePage ? (
          /* Home Page with Interactive Hero, Company Radar, and Feature Cards */
          <HomePage 
            isUserSignedIn={isUserSignedIn}
            onExplore={navigateToTab} 
          />
        ) : (
          /* Workspace (Guardians, Topics, Companies, Ratings, Stats) */
          <>
            {/* Mobile Workspace Quick Tab Strip */}
            <div className="md:hidden sticky top-[4.25rem] z-30 px-3 pb-3 flex justify-center pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-1 overflow-x-auto max-w-full px-2 py-1.5 rounded-full bg-[#FEFFFF]/90 dark:bg-[#151D22]/90 backdrop-blur-xl border border-[#DEF2F1] dark:border-[#2D3E47] shadow-sm no-scrollbar">
                {[
                  { id: 'guardians', label: 'Guardians', icon: 'shield' },
                  { id: 'topics', label: 'Topics', icon: 'account_tree' },
                  { id: 'companies', label: 'Companies', icon: 'domain' },
                  { id: 'ratings', label: 'Ratings', icon: 'trending_up' },
                  { id: 'stats', label: 'Stats', icon: 'monitoring' }
                ].map(t => {
                  const isActive = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigateToTab(t.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2B7A78] text-white shadow-xs font-bold'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-[#DEF2F1]/50 dark:hover:bg-[#202C32]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{t.icon}</span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTab === 'guardians' && (
              <GuardiansSheet 
                onOpenNotes={(p) => setActiveNoteProblem(p)} 
              />
            )}
            {activeTab === 'topics' && (
              <TopicSheet 
                onOpenNotes={(p) => setActiveNoteProblem(p)} 
              />
            )}
            {activeTab === 'companies' && (
              <CompanyWise 
                onOpenNotes={(p) => setActiveNoteProblem(p)} 
              />
            )}
            {activeTab === 'ratings' && (
              <RatingWise 
                onOpenNotes={(p) => setActiveNoteProblem(p)} 
              />
            )}
            {activeTab === 'stats' && (
              <StatsHub />
            )}

            {/* Workspace Footer */}
            <footer className="mt-16 pt-6 border-t border-[#DEF2F1] dark:border-[#1F243A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <p className="font-mono text-[11px] text-gray-400 dark:text-gray-500">© 2026 SPYDEX · High-Performance DSA Preparation Suite</p>
              <a
                href="https://www.linkedin.com/in/tushar-sharma-702069305/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-[#151D22] hover:bg-white dark:hover:bg-[#16192A] border border-[#DEF2F1] dark:border-[#2D3E47] hover:border-[#0077B5]/40 text-gray-700 dark:text-gray-300 hover:text-[#0077B5] transition-all group font-medium shadow-xs"
              >
                <svg className="w-3.5 h-3.5 fill-[#0077B5] shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z"/>
                </svg>
                <span>Created by <strong className="text-gray-900 dark:text-gray-100 group-hover:text-[#0077B5] font-semibold">Tushar Sharma</strong></span>
                <span className="material-symbols-outlined text-[13px] text-gray-400 group-hover:text-[#0077B5] transition-transform group-hover:translate-x-0.5">open_in_new</span>
              </a>
            </footer>
          </>
        )}
      </main>

      {/* Modals */}
      <AuthModal />
      {activeNoteProblem && (
        <NotesModal
          problem={activeNoteProblem}
          initialNote={notes[activeNoteProblem.slug] || ''}
          onSave={(slug, text) => saveNote(slug, text)}
          onClose={() => setActiveNoteProblem(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProgressProvider>
          <MainApp />
        </ProgressProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
