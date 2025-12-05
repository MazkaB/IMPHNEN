'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmail, verifyLoginLink, checkIsSignInLink } from '@/lib/firebase/auth-service';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'email-input'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');
      const currentUrl = window.location.href;

      // Check if it's email link sign-in
      if (checkIsSignInLink(currentUrl)) {
        try {
          const result = await verifyLoginLink(currentUrl);
          if (result) {
            setStatus('success');
            setMessage('Login berhasil! Mengalihkan ke dashboard...');
            setTimeout(() => router.push('/dashboard'), 2000);
          }
        } catch (err: unknown) {
          const error = err as Error;
          if (error.message?.includes('Email tidak ditemukan')) {
            setStatus('email-input');
            setMessage('Masukkan email yang Anda gunakan untuk login.');
          } else {
            setStatus('error');
            setMessage(error.message || 'Link tidak valid atau sudah kadaluarsa.');
          }
        }
        return;
      }

      // Handle email verification
      if (mode === 'verifyEmail' && oobCode) {
        try {
          await verifyEmail(oobCode);
          setStatus('success');
          setMessage('Email berhasil diverifikasi! Anda sekarang bisa login.');
        } catch {
          setStatus('error');
          setMessage('Link verifikasi tidak valid atau sudah kadaluarsa.');
        }
        return;
      }

      // Handle password reset redirect
      if (mode === 'resetPassword' && oobCode) {
        router.push(`/auth/reset-password?oobCode=${oobCode}`);
        return;
      }

      setStatus('error');
      setMessage('Link tidak valid.');
    };

    handleVerification();
  }, [searchParams, router]);


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('emailForSignIn', email);
    }

    try {
      const result = await verifyLoginLink(window.location.href);
      if (result) {
        setStatus('success');
        setMessage('Login berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => router.push('/dashboard'), 2000);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStatus('error');
      setMessage(error.message || 'Gagal verifikasi.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Memverifikasi...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Berhasil!</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Ke Halaman Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Gagal</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Kembali ke Login
            </Link>
          </>
        )}

        {status === 'email-input' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Konfirmasi Email</h2>
            <p className="text-neutral-600 mb-6">{message}</p>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                placeholder="email@contoh.com"
              />
              <button
                type="submit"
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Verifikasi
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">Memuat...</p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyContent />
    </Suspense>
  );
}
