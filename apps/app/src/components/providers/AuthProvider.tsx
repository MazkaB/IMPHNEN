'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { onAuthChange, getUserProfile, UserProfile } from '@/lib/firebase/auth-service';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
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
          // Throw error jika gagal fetch profile
          console.error('Failed to fetch user profile:', error);
          throw error;
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
