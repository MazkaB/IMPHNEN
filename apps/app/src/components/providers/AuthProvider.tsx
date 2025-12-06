'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import {
  onAuthChange,
  getUserProfile,
  handleGoogleRedirectResult,
  saveUserProfileIfNotExists,
  UserProfile,
} from '@/lib/firebase/auth-service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (isInitialized.current) return;
    isInitialized.current = true;

    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      // IMPORTANT: Handle Google redirect result FIRST before setting up auth listener
      // This prevents race condition where onAuthStateChanged fires with null
      // before getRedirectResult completes
      try {
        const result = await handleGoogleRedirectResult();
        if (result) {
          console.log('Google redirect handled, user:', result.user.email);
          // Save profile immediately after redirect
          await saveUserProfileIfNotExists(result.user);
        }
      } catch (error) {
        console.error('Error handling Google redirect:', error);
      }

      // Now set up the auth state listener
      unsubscribe = onAuthChange(async (user) => {
        // Set user first - this also sets isAuthenticated
        setUser(user);

        if (user) {
          try {
            // Ensure user profile exists in Firestore
            await saveUserProfileIfNotExists(user);

            const firestoreProfile = await getUserProfile(user.uid);

            // Merge Firestore profile dengan data dari Firebase Auth
            const profile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: firestoreProfile?.displayName || user.displayName || '',
              photoURL: firestoreProfile?.photoURL || user.photoURL || '',
              businessName: firestoreProfile?.businessName || '',
              phoneNumber: firestoreProfile?.phoneNumber || user.phoneNumber || '',
              emailVerified: user.emailVerified,
              provider:
                firestoreProfile?.provider ||
                (user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'),
              subscription: firestoreProfile?.subscription,
              createdAt: firestoreProfile?.createdAt || new Date(),
              updatedAt: firestoreProfile?.updatedAt || new Date(),
            };

            setProfile(profile);
          } catch (error) {
            console.error('Failed to fetch user profile:', error);
          }
        } else {
          setProfile(null);
        }

        // Set loading false AFTER everything is done
        setLoading(false);
      });
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
