'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { checkUserSubscription } from '@/lib/firebase/subscription-service';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const checkStarted = useRef(false);

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check subscription
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && !checkStarted.current) {
      checkStarted.current = true;
      
      const timeout = setTimeout(() => {
        setSubscriptionStatus('inactive');
        router.push('/activate');
      }, 5000);

      checkUserSubscription(user.uid)
        .then((isActive) => {
          clearTimeout(timeout);
          if (isActive) {
            setSubscriptionStatus('active');
          } else {
            setSubscriptionStatus('inactive');
            router.push('/activate');
          }
        })
        .catch(() => {
          clearTimeout(timeout);
          setSubscriptionStatus('inactive');
          router.push('/activate');
        });

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <img src="/logo.png" alt="NUSA" className="w-40 h-20 mx-auto mb-4 animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (subscriptionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <img src="/logo.png" alt="NUSA" className="w-20 h-20 mx-auto mb-4 animate-pulse" />
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memeriksa langganan...</p>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === 'inactive') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main Content - Full Width tanpa Sidebar */}
      <main>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
