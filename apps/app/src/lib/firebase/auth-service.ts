'use client';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User,
  UserCredential,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  ActionCodeSettings,
  applyActionCode,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

export type SubscriptionStatus = 'inactive' | 'active' | 'trial' | 'expired';
export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export interface Subscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  activatedAt?: Date;
  expiresAt?: Date;
  promoCode?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  businessName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  provider: 'email' | 'google';
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper to ensure auth is initialized
const getAuth = () => {
  if (!auth) throw new Error('Firebase Auth belum diinisialisasi');
  return auth;
};

// Helper to ensure db is initialized
const getDb = () => {
  if (!db) throw new Error('Firebase Firestore belum diinisialisasi');
  return db;
};

const getActionCodeSettings = (): ActionCodeSettings => ({
  url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app'}/auth/verify`,
  handleCodeInApp: true,
});

// Register dengan Email & Password
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string,
  businessName?: string
): Promise<UserCredential> => {
  if (!email || !password || !displayName) throw new Error('Email, password, dan nama wajib diisi');
  if (password.length < 8) throw new Error('Password minimal 8 karakter');

  const firebaseAuth = getAuth();
  const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
  await updateProfile(userCredential.user, { displayName });
  await sendEmailVerification(userCredential.user, getActionCodeSettings());
  await saveUserProfile(userCredential.user, 'email', businessName);

  return userCredential;
};

// Login/Register dengan Google - langsung pakai redirect (lebih reliable)
export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  // Langsung pakai redirect - lebih reliable daripada popup yang sering stuck karena COOP
  await signInWithRedirect(getAuth(), googleProvider);
  return null;
};

// Handle redirect result (call this on page load)
export const handleGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(getAuth());
    if (result) {
      await handleGoogleAuthResult(result);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    return null;
  }
};

// Helper to handle Google auth result
const handleGoogleAuthResult = async (userCredential: UserCredential): Promise<void> => {
  try {
    const existingProfile = await getUserProfile(userCredential.user.uid);
    if (!existingProfile) {
      await saveUserProfile(userCredential.user, 'google');
    }
  } catch (error) {
    console.warn('Failed to save profile, will retry later:', error);
  }
};

// Login dengan Email & Password
export const loginWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!email || !password) throw new Error('Email dan password wajib diisi');
  return signInWithEmailAndPassword(getAuth(), email, password);
};

// Kirim link login ke email (passwordless)
export const sendLoginLink = async (email: string): Promise<void> => {
  if (!email) throw new Error('Email wajib diisi');
  await sendSignInLinkToEmail(getAuth(), email, getActionCodeSettings());
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('emailForSignIn', email);
  }
};

// Verifikasi link login dari email
export const verifyLoginLink = async (url: string): Promise<UserCredential | null> => {
  const firebaseAuth = getAuth();
  if (!isSignInWithEmailLink(firebaseAuth, url)) return null;

  let email = typeof window !== 'undefined' ? window.localStorage.getItem('emailForSignIn') || '' : '';
  if (!email) throw new Error('Email tidak ditemukan. Silakan masukkan email Anda.');

  const userCredential = await signInWithEmailLink(firebaseAuth, email, url);
  if (typeof window !== 'undefined') window.localStorage.removeItem('emailForSignIn');

  const existingProfile = await getUserProfile(userCredential.user.uid);
  if (!existingProfile) await saveUserProfile(userCredential.user, 'email');

  return userCredential;
};

// Cek apakah URL adalah sign-in link
export const checkIsSignInLink = (url: string): boolean => {
  if (!auth) return false;
  return isSignInWithEmailLink(auth, url);
};

// Kirim ulang email verifikasi
export const resendVerificationEmail = async (): Promise<void> => {
  const firebaseAuth = getAuth();
  if (!firebaseAuth.currentUser) throw new Error('User belum login');
  await sendEmailVerification(firebaseAuth.currentUser, getActionCodeSettings());
};

// Verifikasi email dengan action code
export const verifyEmail = async (actionCode: string): Promise<void> => {
  await applyActionCode(getAuth(), actionCode);
};

// Kirim email reset password
export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!email) throw new Error('Email wajib diisi');
  await sendPasswordResetEmail(getAuth(), email, getActionCodeSettings());
};

// Logout
export const logout = async (): Promise<void> => {
  return firebaseSignOut(getAuth());
};

// Simpan user profile ke Firestore
const saveUserProfile = async (user: User, provider: 'email' | 'google', businessName?: string): Promise<void> => {
  await setDoc(doc(getDb(), 'users', user.uid), {
    uid: user.uid,
    email: user.email?.toLowerCase() || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    businessName: businessName || '',
    phoneNumber: user.phoneNumber || '',
    emailVerified: user.emailVerified,
    provider,
    subscription: {
      status: 'inactive',
      plan: 'free',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

// Get user profile dari Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docSnap = await getDoc(doc(getDb(), 'users', uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    // Handle offline state - return null instead of throwing
    console.warn('Failed to get user profile, might be offline:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  await setDoc(doc(getDb(), 'users', uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    // Return no-op unsubscribe if auth not initialized
    console.warn('Firebase Auth not initialized, skipping auth state listener');
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = (): User | null => {
  try {
    return getAuth().currentUser;
  } catch {
    return null;
  }
};

// Check if email is verified
export const isEmailVerified = (): boolean => {
  try {
    return getAuth().currentUser?.emailVerified || false;
  } catch {
    return false;
  }
};
