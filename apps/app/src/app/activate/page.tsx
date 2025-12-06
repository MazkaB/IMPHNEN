'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { activateWithPromoCode, hasActiveSubscription, checkUserSubscription } from '@/lib/firebase/subscription-service';
import { logout } from '@/lib/firebase/auth-service';
import { Loader2, Gift, CheckCircle, XCircle, LogOut } from 'lucide-react';

export default function ActivatePage() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated } = useAuthStore();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Check subscription directly from Firestore with timeout
  useEffect(() => {
    if (!isLoading && user) {
      // Set timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setCheckingSubscription(false);
      }, 3000);

      checkUserSubscription(user.uid)
        .then((isActive) => {
          clearTimeout(timeout);
          if (isActive) {
            router.replace('/dashboard');
          } else {
            setCheckingSubscription(false);
          }
        })
        .catch(() => {
          clearTimeout(timeout);
          setCheckingSubscription(false);
        });

      return () => clearTimeout(timeout);
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    // If already has active subscription in profile, redirect to dashboard
    if (!isLoading && profile && hasActiveSubscription(profile.subscription)) {
      router.replace('/dashboard');
    }
  }, [profile, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !promoCode.trim()) return;

    setLoading(true);
    setResult(null);

    const res = await activateWithPromoCode(user.uid, promoCode.trim());
    setResult(res);
    setLoading(false);

    if (res.success) {
      // Force full reload to refresh auth state and profile
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1500);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (isLoading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
          <p className="text-neutral-600 text-sm">Memeriksa status langganan...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Aktivasi Akun</h1>
          <p className="text-neutral-600 mt-2">
            Masukkan kode promo untuk mengaktifkan akun Anda
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* User Info */}
          <div className="bg-neutral-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-neutral-500">Login sebagai</p>
            <p className="font-medium text-neutral-900">{profile?.displayName || user?.email}</p>
            <p className="text-sm text-neutral-600">{user?.email}</p>
          </div>

          {/* Status */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-medium text-amber-800">Akun Belum Aktif</p>
                <p className="text-sm text-amber-700 mt-1">
                  Untuk mengakses dashboard, Anda perlu mengaktifkan akun dengan kode promo atau melakukan pembayaran.
                </p>
              </div>
            </div>
          </div>

          {/* Promo Code Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="promoCode" className="block text-sm font-medium text-neutral-700 mb-1">
                Kode Promo
              </label>
              <input
                type="text"
                id="promoCode"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setResult(null);
                }}
                placeholder="Masukkan kode promo"
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none uppercase tracking-wider font-mono text-neutral-900"
                disabled={loading}
              />
              <p className="text-xs text-neutral-500 mt-1">
                💡 Untuk testing, gunakan kode: <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-semibold">HACKATHON</code>
              </p>
            </div>

            {result && (
              <div className={`p-4 rounded-lg flex items-start gap-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {result.message}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !promoCode.trim()}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Aktivasi Sekarang'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-sm text-neutral-500">atau</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Payment Option */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 mb-3">
              Belum punya kode promo?
            </p>
            <Link
              href="/pricing"
              className="inline-block w-full py-3 border-2 border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors"
            >
              Lihat Paket Berlangganan
            </Link>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full mt-4 py-2 text-neutral-500 hover:text-neutral-700 text-sm flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar dari akun ini
          </button>
        </div>

        {/* Help */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Butuh bantuan?{' '}
          <a href="mailto:support@nusa.ai" className="text-green-600 hover:text-green-700">
            Hubungi kami
          </a>
        </p>
      </div>
    </div>
  );
}
