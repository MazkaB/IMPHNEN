'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useSidebarStore } from '@/store/sidebar-store';
import { checkUserSubscription } from '@/lib/firebase/subscription-service';
import { Sidebar } from '@/components/layout/Sidebar';
import { Loader2, Home, Mic, BarChart3, Image, Settings, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { getOcrUrl, getInsightUrl, getContentUrl } from '@/lib/urls';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, profile } = useAuthStore();
  const { isCollapsed } = useSidebarStore();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'active' | 'inactive'>('checking');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white text-2xl font-bold">N</span>
          </div>
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (subscriptionStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto" />
          <p className="mt-4 text-gray-600 text-lg">Memeriksa langganan...</p>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === 'inactive') return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Header - Clean & Simple */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="font-bold text-lg text-gray-900">NUSA AI</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4 space-y-2">
            <div className="p-3 bg-gray-50 rounded-xl mb-4">
              <p className="font-semibold text-gray-900">{profile?.displayName}</p>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link
              href="/voice"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/voice' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <Mic className="w-5 h-5" />
              <span className="font-medium">Catat Suara</span>
            </Link>
            <a
              href={getInsightUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analisis</span>
            </a>
            <a
              href={`${getContentUrl()}/content-creator`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Image className="w-5 h-5" />
              <span className="font-medium">Buat Konten</span>
            </a>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/settings' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Pengaturan</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 lg:pt-0 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
