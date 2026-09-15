import { useState } from 'react';
import { useAuth, DUMMY_PROFILE_AVATARS, FALLBACK_AVATAR } from '../context/AuthContext';
import SpiderLogo from './SpiderLogo';

export default function AuthModal() {
  const { 
    user, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginWithGoogle, 
    loginWithGoogleRedirect,
    loginWithEmail, 
    registerWithEmail, 
    updateAvatar,
    logout,
    authError,
    setAuthError
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isConfigError, setIsConfigError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async (useRedirect = false) => {
    setErrorMsg('');
    setIsConfigError(false);
    setLoading(true);
    try {
      if (useRedirect) {
        await loginWithGoogleRedirect();
      } else {
        const res = await loginWithGoogle();
        if (res?.redirect) {
          setErrorMsg('Popup was blocked by your browser. Redirecting to Google Sign-In...');
        }
      }
    } catch (err) {
      console.error('Firebase Google Auth Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. The Google popup was closed before completing.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMsg('Google sign-in popup was blocked by your browser. Click the button below to sign in via full redirect.');
      } else if (err.code === 'auth/configuration-not-found') {
        setIsConfigError(true);
        setErrorMsg('Firebase Authentication is not activated yet in Firebase Console for project "spy-dex".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google Sign-in is not enabled in Firebase Console. Enable it under Authentication → Sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg(`This domain (${window.location.hostname}) is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.`);
      } else {
        setErrorMsg(err.message || 'Failed to authenticate with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsConfigError(false);
    setLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
    } catch (err) {
      console.error('Firebase Email Auth Error:', err);
      if (err.code === 'auth/configuration-not-found') {
        setIsConfigError(true);
        setErrorMsg('Firebase Authentication is not activated yet in Firebase Console for project "spy-dex".');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email/Password sign-in is not enabled in Firebase Console. Go to Firebase Console → Authentication → Sign-in method and enable "Email/Password".');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try signing in instead.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters long.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#FEFFFF] dark:bg-[#182226] rounded-3xl shadow-[0_25px_60px_rgba(23,37,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-[#DEF2F1] dark:border-[#2D3E47] overflow-hidden flex flex-col max-h-[92vh] theme-transition"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#DEF2F1]/80 dark:border-[#2D3E47] bg-[#DEF2F1]/20 dark:bg-[#202C32]/60">
          <div className="flex items-center gap-2.5">
            <SpiderLogo size={32} />
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#17252A] dark:text-[#F8FAFC] tracking-tight">
                SPYDEX
              </h3>
              <span className="text-[10px] font-mono text-[#2B7A78] dark:text-[#3AAFA9] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firebase Authentication · spy-dex</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#17252A] dark:hover:text-[#F8FAFC] hover:bg-[#DEF2F1] dark:hover:bg-[#202C32] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* User Already Signed In */}
          {!user.isGuest ? (
            <div className="space-y-5 text-center py-2">
              <div className="relative inline-block">
                <img 
                  src={user.avatar || FALLBACK_AVATAR} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                  className="w-20 h-20 rounded-full mx-auto border-2 border-[#3AAFA9] dark:border-[#3AAFA9] shadow-md object-cover shrink-0 aspect-square ring-2 ring-[#DEF2F1] dark:ring-[#2D3E47]"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#182226] flex items-center justify-center text-[10px] text-white">
                  ✓
                </span>
              </div>
              <div>
                <h4 className="font-heading font-bold text-lg text-[#17252A] dark:text-[#F8FAFC]">
                  {user.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  {user.email || 'Signed in via SPYDEX'}
                </p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Full Platform Unlocked · Session Active</span>
                </div>
              </div>

              {/* Avengers Avatar Selector Gallery */}
              <div className="p-4 bg-slate-50 dark:bg-[#202C32]/60 border border-[#DEF2F1] dark:border-[#2D3E47] rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17252A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#2B7A78] dark:text-[#3AAFA9]">shield</span>
                    <span>Choose Avengers Avatar</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#2B7A78] dark:text-[#3AAFA9] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Saved to Cloud</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {DUMMY_PROFILE_AVATARS.map(av => {
                    const isSelected = user.avatar === av.url;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => updateAvatar(av.url)}
                        title={`${av.name} (${av.hero})`}
                        className={`group relative rounded-xl p-1.5 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          isSelected 
                            ? 'bg-[#DEF2F1] dark:bg-[#26353D] ring-2 ring-[#2B7A78] dark:ring-[#3AAFA9] shadow-sm scale-105' 
                            : 'hover:bg-slate-200/60 dark:hover:bg-[#26353D] hover:scale-105 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="relative">
                          <img 
                            src={av.url} 
                            alt={av.name} 
                            className="w-10 h-10 rounded-full object-cover shrink-0 aspect-square shadow-sm"
                            onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                          />
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2B7A78] dark:bg-[#3AAFA9] rounded-full text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white dark:ring-[#182226]">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-bold text-[#17252A] dark:text-[#CBD5E1] truncate max-w-[50px] text-center leading-tight">
                          {av.name.replace('Captain America', 'Cap').replace('Doctor Strange', 'Strange').replace('Black Panther', 'Panther').replace('Black Widow', 'Widow')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  onClick={() => setIsAuthModalOpen(false)}
                  className="btn-brand w-full !py-2.5 text-sm font-semibold cursor-pointer"
                >
                  Continue to Workspace
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sign Out of Account
                </button>
              </div>
            </div>
          ) : (
            /* Sign In / Register View */
            <>
              {/* Configuration Not Found Alert Box */}
              {isConfigError ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-2.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <span className="material-symbols-outlined text-base text-amber-600">info</span>
                    <span>1-Step Firebase Activation Needed</span>
                  </div>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Firebase project <strong>spy-dex</strong> is connected, but Authentication has not been clicked <strong>"Get started"</strong> in the Firebase Console yet.
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-amber-800 dark:text-amber-300 font-medium pl-1">
                    <li>Go to Firebase Console → <strong>Authentication</strong></li>
                    <li>Click <strong>"Get started"</strong> button</li>
                    <li>Enable <strong>Google</strong> under <strong>Sign-in method</strong></li>
                  </ol>
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-1.5">
                    <a
                      href="https://console.firebase.google.com/project/spy-dex/authentication"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors text-center"
                    >
                      <span>Open Firebase Console</span>
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </a>
                  </div>
                </div>
              ) : errorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex flex-col gap-2.5 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                    <div className="flex-1 leading-relaxed">{errorMsg}</div>
                  </div>
                  {errorMsg.toLowerCase().includes('popup') && (
                    <button
                      type="button"
                      onClick={() => handleGoogleSignIn(true)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2B7A78] hover:bg-[#205c5a] text-white font-semibold transition-colors cursor-pointer text-xs self-start shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_browser</span>
                      <span>Sign In with Google (Redirect Mode)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Notice with Spider-Man Profile Preview */}
              <div className="text-center pb-1 flex flex-col items-center">
                <div className="relative mb-2">
                  <img 
                    src={FALLBACK_AVATAR}
                    alt="Spider-Man Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#EF4444] shadow-md ring-2 ring-[#DEF2F1] dark:ring-[#2D3E47]"
                    onError={(e) => { e.currentTarget.src = FALLBACK_AVATAR; }}
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.2 rounded-full bg-[#17252A] dark:bg-[#12181C] text-[9px] text-white font-mono font-bold whitespace-nowrap shadow-sm border border-transparent dark:border-[#2D3E47]">
                    SPIDER-MAN
                  </span>
                </div>
                <h4 className="text-base font-bold text-[#17252A] dark:text-[#F8FAFC] mt-1">
                  Sign In to SPYDEX
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Sign in to unlock all 596 Guardians problems, 660+ company radars &amp; ZeroTrac ratings.
                </p>
              </div>

              {/* 1. Official Google One-Click Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(false)}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-[#2D3E47] hover:border-[#3AAFA9] bg-white dark:bg-[#202C32] hover:bg-slate-50 dark:hover:bg-[#26353D] shadow-sm text-sm font-semibold text-[#17252A] dark:text-[#F8FAFC] flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 group"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleGoogleSignIn(true)}
                    disabled={loading}
                    className="text-[11px] text-[#2B7A78] dark:text-[#3AAFA9] hover:underline cursor-pointer font-medium inline-flex items-center gap-1"
                  >
                    <span>Having trouble with popups? Tap for Direct Google Sign-In</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </button>
                </div>
              </div>

              {/* Clean Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#DEF2F1] dark:border-[#2D3E47] w-full"></div>
                <span className="bg-[#FEFFFF] dark:bg-[#182226] px-3 text-[11px] font-mono uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
                  or sign in with email
                </span>
                <div className="border-t border-[#DEF2F1] dark:border-[#2D3E47] w-full"></div>
              </div>

              {/* Mode Toggle (Sign In / Register) */}
              <div className="flex rounded-xl bg-[#DEF2F1]/50 dark:bg-[#202C32]/70 p-1 border border-[#DEF2F1] dark:border-[#2D3E47]">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); setIsConfigError(false); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white dark:bg-[#182226] text-[#17252A] dark:text-[#F8FAFC] shadow-sm font-bold border border-transparent dark:border-[#2D3E47]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); setIsConfigError(false); }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white dark:bg-[#182226] text-[#17252A] dark:text-[#F8FAFC] shadow-sm font-bold border border-transparent dark:border-[#2D3E47]'
                      : 'text-gray-500 dark:text-gray-400 hover:text-[#17252A] dark:hover:text-[#F8FAFC]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {mode === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Full Name</label>
                    <div className="relative flex items-center">
                      <span className="material-symbols-outlined absolute left-3 text-gray-400 text-lg">
                        person
                      </span>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tushar Sharma"
                        className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-xl focus:outline-none focus:border-[#3AAFA9] dark:focus:border-[#3AAFA9] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Email Address</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-lg">
                      mail
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@domain.com"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-xl focus:outline-none focus:border-[#3AAFA9] dark:focus:border-[#3AAFA9] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-gray-400 text-lg">
                      lock
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-[#202C32] border border-[#DEF2F1] dark:border-[#2D3E47] text-[#17252A] dark:text-[#F8FAFC] rounded-xl focus:outline-none focus:border-[#3AAFA9] dark:focus:border-[#3AAFA9] placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-brand w-full !py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Connecting with Firebase...</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In with Firebase' : 'Create SPYDEX Account'}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security notice */}
              <div className="text-center text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed font-mono">
                Project: spy-dex · Powered by Google Firebase
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
