import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { getAnalytics, isSupported, logEvent, setUserId } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyANnod-4IsVOlBrjE90f8s7aL-cSBLDvno",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spy-dex.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spy-dex",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spy-dex.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "378405065103",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:378405065103:web:446b95d736d4dbdbde7bfa",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.startsWith('AIza') &&
  firebaseConfig.projectId
);

const app = getApps().length > 0 ? getApp() : (isFirebaseConfigured ? initializeApp(firebaseConfig) : null);
const auth = app ? getAuth(app) : null;

if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// Initialize Firebase Analytics only when measurementId is explicitly configured
let analytics = null;
if (app && typeof window !== 'undefined' && firebaseConfig.measurementId) {
  isSupported().then(supported => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
        logEvent(analytics, 'page_view', { page_title: 'SPYDEX DSA Tracker' });
      } catch (err) {
        console.warn('Firebase Analytics setup notice:', err?.message);
      }
    }
  }).catch(() => {});
}

export function trackUserPresence(userId, email) {
  if (analytics && userId) {
    try {
      setUserId(analytics, String(userId));
      logEvent(analytics, 'user_active', {
        user_id: String(userId),
        email: email || '',
        timestamp: new Date().toISOString()
      });
    } catch {}
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

export {
  app,
  auth,
  analytics,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
};
