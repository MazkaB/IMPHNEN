'use client';

import { useEffect, ReactNode, useRef } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { onAuthChange, getUserProfile, UserProfile } from '@/lib/firebase/auth-service';

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

    const unsubscribe = onAuthChange(async (user) => {
      // Set user first - this also sets isAuthenticated
      setUser(user);

      if (user) {
        try {
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
            provider: firestoreProfile?.provider || (user.providerData[0]?.providerId === 'google.com' ? 'google' : 'email'),
            createdAt: firestoreProfile?.createdAt || new Date(),
            updatedAt: firestoreProfile?.updatedAt || new Date(),
          };
          
          setProfile(profile);
        } catch (error) {
          // Log error but don't throw - user is still authenticated
          console.error('Failed to fetch user profile:', error);
        }
      } else {
        setProfile(null);
      }

      // Set loading false AFTER everything is done
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
