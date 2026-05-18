import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

/**
 * Firebase client configuration.
 *
 * All values come from Vite environment variables (must be prefixed with VITE_).
 * Set them in client/.env — see client/.env.example for the required keys.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent re-initialisation on hot-module reload in development
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Request the user's email and public profile from Google
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Force the account picker to appear every time (good UX for multi-account users)
googleProvider.setCustomParameters({ prompt: 'select_account' });
