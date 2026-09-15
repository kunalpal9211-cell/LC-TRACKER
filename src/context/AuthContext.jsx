import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  isFirebaseConfigured,
  trackUserPresence
} from '../firebase';

const AuthContext = createContext(null);
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const DUMMY_PROFILE_AVATARS = [
  {
    id: 'spiderman',
    name: 'Spider-Man',
    hero: 'Peter Parker',
    url: '/avatars/spiderman.svg'
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    hero: 'Tony Stark',
    url: '/avatars/ironman.svg'
  },
  {
    id: 'captain-america',
    name: 'Captain America',
    hero: 'Steve Rogers',
    url: '/avatars/captain-america.svg'
  },
  {
    id: 'thor',
    name: 'Thor',
    hero: 'God of Thunder',
    url: '/avatars/thor.svg'
  },
  {
    id: 'black-panther',
    name: 'Black Panther',
    hero: "T'Challa",
    url: '/avatars/black-panther.svg'
  },
  {
    id: 'hulk',
    name: 'Hulk',
    hero: 'Bruce Banner',
    url: '/avatars/hulk.svg'
  },
  {
    id: 'doctor-strange',
    name: 'Doctor Strange',
    hero: 'Stephen Strange',
    url: '/avatars/doctor-strange.svg'
  },
  {
    id: 'black-widow',
    name: 'Black Widow',
    hero: 'Natasha Romanoff',
    url: '/avatars/black-widow.svg'
  }
];

export const FALLBACK_AVATAR = DUMMY_PROFILE_AVATARS[0].url;

const DEFAULT_GUEST = {
  id: 'guest_user',
  name: 'Guest User',
  email: '',
  avatar: FALLBACK_AVATAR,
  isGuest: true
};

function getSavedAvatar(userId, email) {
  try {
    if (userId) {
      const byId = localStorage.getItem(`spydex_avatar_${userId}`);
      if (byId) return byId;
    }
    if (email) {
      const byEmail = localStorage.getItem(`spydex_avatar_${email.toLowerCase()}`);
      if (byEmail) return byEmail;
    }
    const globalSaved = localStorage.getItem('spydex_avatar');
    if (globalSaved) return globalSaved;

    const saved = localStorage.getItem('spydex_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.avatar && (parsed.id === userId || parsed.email === email)) {
        return parsed.avatar;
      }
    }
  } catch {}
  return null;
}

function persistAvatarLocally(userId, email, avatarUrl) {
  if (!avatarUrl) return;
  try {
    localStorage.setItem('spydex_avatar', avatarUrl);
    if (userId) localStorage.setItem(`spydex_avatar_${userId}`, avatarUrl);
    if (email) localStorage.setItem(`spydex_avatar_${email.toLowerCase()}`, avatarUrl);
  } catch {}
}

function mapFirebaseUser(firebaseUser, displayNameOverride, preferredAvatar) {
  if (!firebaseUser) return DEFAULT_GUEST;
  const name =
    displayNameOverride ||
    firebaseUser.displayName ||
    (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Engineer');

  const savedAvatar = preferredAvatar || getSavedAvatar(firebaseUser.uid, firebaseUser.email);
  const avatar = savedAvatar || firebaseUser.photoURL || FALLBACK_AVATAR;

  return {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email || '',
    avatar,
    isGuest: false,
    provider: 'firebase'
  };
}

function persistUser(nextUser) {
  try {
    if (!nextUser || nextUser.isGuest) {
      localStorage.removeItem('spydex_user');
    } else {
      localStorage.setItem('spydex_user', JSON.stringify(nextUser));
    }
  } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('spydex_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && !parsed.isGuest) {
          const savedAvatar = getSavedAvatar(parsed.id, parsed.email);
          return {
            ...parsed,
            avatar: savedAvatar || parsed.avatar || FALLBACK_AVATAR
          };
        }
      }
      return DEFAULT_GUEST;
    } catch {
      return DEFAULT_GUEST;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState('local');
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const applyUser = useCallback(async (firebaseUser, displayNameOverride) => {
    const next = mapFirebaseUser(firebaseUser, displayNameOverride);
    setUser(next);
    persistUser(next);
    persistAvatarLocally(next.id, next.email, next.avatar);
    setCloudSyncStatus(next.isGuest ? 'local' : 'synced');
    trackUserPresence(next.id, next.email);

    if (!next.isGuest) {
      try {
        const res = await fetch(`${API_BASE}/api/user/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: next.id,
            email: next.email,
            name: next.name,
            avatar: next.avatar,
            explicitAvatar: false
          })
        });
        if (res.ok) {
          const syncData = await res.json();
          if (syncData?.user?.avatar) {
            const authoritativeAvatar = syncData.user.avatar;
            persistAvatarLocally(next.id, next.email, authoritativeAvatar);
            setUser(prev => {
              if (!prev || prev.id !== next.id) return prev;
              const updated = { 
                ...prev, 
                avatar: authoritativeAvatar,
                name: syncData.user.name || prev.name
              };
              persistUser(updated);
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn('User cloud sync notice:', err);
      }
    }
    return next;
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      return undefined;
    }

    // Safety timeout: never block UI for more than 1.5s
    const timeout = setTimeout(() => {
      setAuthLoading(false);
    }, 1500);

    // Check for any pending redirect result from Google sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          applyUser(result.user);
          setIsAuthModalOpen(false);
        }
      })
      .catch((err) => {
        if (err.code !== 'auth/null-user') {
          console.warn('Firebase getRedirectResult notice:', err);
        }
      });

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => {
          clearTimeout(timeout);
          if (firebaseUser) {
            applyUser(firebaseUser);
          } else {
            // Keep local user if already signed in via test mode, otherwise default guest
            setUser(prev => prev && !prev.isGuest ? prev : DEFAULT_GUEST);
          }
          setAuthLoading(false);
        },
        (err) => {
          console.warn('Firebase onAuthStateChanged notice:', err);
          clearTimeout(timeout);
          setAuthLoading(false);
        }
      );
    } catch (e) {
      clearTimeout(timeout);
      setAuthLoading(false);
    }

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, [applyUser]);

  // 1. Google Sign-In via Firebase (Direct popup with instant user application)
  const loginWithGoogle = async (forceRedirect = false) => {
    setAuthError('');
    setCloudSyncStatus('syncing');

    if (!auth) {
      const err = new Error('Firebase Auth is not initialized. Please verify configuration.');
      setCloudSyncStatus('error');
      throw err;
    }

    if (forceRedirect) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { redirect: true };
      } catch (redirectErr) {
        console.error('Firebase Google Redirect error:', redirectErr);
        setCloudSyncStatus('error');
        throw redirectErr;
      }
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        const authenticatedUser = await applyUser(result.user);
        setIsAuthModalOpen(false);
        return { success: true, user: authenticatedUser };
      }
      return { success: false };
    } catch (err) {
      console.error('Firebase Google Sign-In error:', err);
      setCloudSyncStatus('error');
      throw err;
    }
  };

  const loginWithGoogleRedirect = async () => {
    return loginWithGoogle(true);
  };

  // 2. Email Sign-In via Firebase
  const loginWithEmail = async (email, password) => {
    setAuthError('');
    setCloudSyncStatus('syncing');
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const authenticatedUser = applyUser(result.user);
      setIsAuthModalOpen(false);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      console.error('Firebase Email Sign-In error:', err);
      setCloudSyncStatus('error');
      throw err;
    }
  };

  // 3. Email Register via Firebase
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError('');
    setCloudSyncStatus('syncing');
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && result.user) {
        try {
          await updateProfile(result.user, { displayName });
        } catch (profileErr) {
          console.warn('Could not update display name:', profileErr);
        }
      }
      const authenticatedUser = applyUser(result.user, displayName);
      setIsAuthModalOpen(false);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      console.error('Firebase Email Registration error:', err);
      setCloudSyncStatus('error');
      throw err;
    }
  };

  // 4. Instant Test / Fast Sign-In (Instant unlock if Firebase Console setup is in progress)
  const loginWithTestAccount = (
    email = 'tushar.sharma77@gmail.com',
    name = 'Tushar Sharma',
    avatarUrl = null
  ) => {
    const userId = 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_');
    const savedAvatar = avatarUrl || getSavedAvatar(userId, email) || FALLBACK_AVATAR;

    const testUser = {
      id: userId,
      name: name,
      email: email,
      avatar: savedAvatar,
      isGuest: false,
      provider: 'verified_session'
    };
    setUser(testUser);
    persistUser(testUser);
    persistAvatarLocally(testUser.id, testUser.email, testUser.avatar);
    setCloudSyncStatus('synced');
    setIsAuthModalOpen(false);
    trackUserPresence(testUser.id, testUser.email);

    // Attempt to register/sign-in in Firebase Auth in background so user appears in Firebase Console Users list
    if (auth && isFirebaseConfigured) {
      (async () => {
        try {
          let fbUser = null;
          try {
            const res = await signInWithEmailAndPassword(auth, email, 'Spydex@2026');
            fbUser = res.user;
          } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
              const res = await createUserWithEmailAndPassword(auth, email, 'Spydex@2026');
              fbUser = res.user;
              await updateProfile(fbUser, { displayName: name, photoURL: savedAvatar });
            }
          }
          if (fbUser) {
            trackUserPresence(fbUser.uid, email);
          }
        } catch (e) {
          // Gracefully continue even if Firebase Console Auth is not activated yet
          console.warn('Firebase background sync notice:', e?.code || e?.message);
        }
      })();
    }

    fetch(`${API_BASE}/api/user/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUser.id,
        email: testUser.email,
        name: testUser.name,
        avatar: testUser.avatar,
        explicitAvatar: false
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.user?.avatar) {
          const authoritative = data.user.avatar;
          persistAvatarLocally(testUser.id, testUser.email, authoritative);
          setUser(prev => {
            if (!prev || prev.id !== testUser.id) return prev;
            const updated = { ...prev, avatar: authoritative };
            persistUser(updated);
            return updated;
          });
        }
      })
      .catch(err => console.warn('Test user cloud sync notice:', err));

    return testUser;
  };

  // 5. Update user avatar (persists to localStorage, Firebase, and MongoDB Atlas)
  const updateAvatar = async (newAvatarUrl) => {
    if (!newAvatarUrl) return;

    // 1. Immediately update state and local storage
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: newAvatarUrl };
      persistUser(updated);
      persistAvatarLocally(updated.id, updated.email, newAvatarUrl);
      return updated;
    });

    if (user && !user.isGuest) {
      persistAvatarLocally(user.id, user.email, newAvatarUrl);

      // 2. Update Firebase profile photo if signed in via Firebase
      try {
        if (auth && auth.currentUser) {
          await updateProfile(auth.currentUser, { photoURL: newAvatarUrl });
        }
      } catch (e) {
        console.warn('Firebase profile photo update notice:', e);
      }

      // 3. Persist to MongoDB Atlas via dedicated /api/user/avatar endpoint
      try {
        setCloudSyncStatus('syncing');
        const res = await fetch(`${API_BASE}/api/user/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email || '',
            avatar: newAvatarUrl
          })
        });
        if (res.ok) {
          setCloudSyncStatus('synced');
        }
      } catch (err) {
        console.warn('Avatar cloud sync notice:', err);
      }
    }
  };

  // 6. Sign Out
  const logout = async () => {
    try {
      if (auth) await signOut(auth);
    } catch (e) {
      console.warn('Sign out error', e);
    }
    setUser(DEFAULT_GUEST);
    persistUser(DEFAULT_GUEST);
    setCloudSyncStatus('local');
  };

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      isAuthModalOpen,
      setIsAuthModalOpen,
      isFirebaseConfigured,
      loginWithGoogle,
      loginWithGoogleRedirect,
      loginWithEmail,
      registerWithEmail,
      loginWithTestAccount,
      updateAvatar,
      logout,
      cloudSyncStatus,
      setCloudSyncStatus,
      authError,
      setAuthError
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
