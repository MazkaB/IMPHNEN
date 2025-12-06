'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { checkUserSubscription } from '@/lib/firebase/subscription-service';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2 } from 'lucide-react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
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
      
      // Timeout fallback - redirect to activate after 5 seconds
      const timeout = setTimeout(() => {
        console.log('Subscription check timeout, redirecting to activate');
        setSubscriptionStatus('inactive');
        router.push('/activate');
      }, 5000);

      checkUserSubscription(user.uid)
        .then((isActive) => {
          clearTimeout(timeout);
          console.log('Subscription check result:', isActive);
          if (isActive) {
            setSubscriptionStatus('active');
          } else {
            setSubscriptionStatus('inactive');
            router.push('/activate');
          }
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error('Subscription check error:', error);
          // On error, redirect to activate
          setSubscriptionStatus('inactive');
          router.push('/activate');
        });

      return () => clearTimeout(timeout);
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-500">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (subscriptionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-gray-500">Memeriksa langganan...</p>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === 'inactive') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className={`transition-all duration-300 pt-14 lg:pt-0 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
