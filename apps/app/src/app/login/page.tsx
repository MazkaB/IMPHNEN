'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithEmail, signInWithGoogle, sendLoginLink, sendPasswordReset, handleGoogleRedirectResult, onAuthChange } from '@/lib/firebase/auth-service';
import { getLandingUrl } from '@/lib/urls';

type LoginMode = 'password' | 'email-link' | 'forgot-password';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Handle Google redirect result dan auth state
  useEffect(() => {
    // Check redirect result first
    handleGoogleRedirectResult().catch(() => {});
    
    // Listen to auth state - jika sudah login, redirect ke dashboard
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        window.location.href = '/dashboard';
      } else {
        setCheckingAuth(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Show loading saat checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      window.location.href = '/dashboard';
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Password salah.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Email atau password salah.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan. Coba lagi nanti.');
      } else {
        setError(err.message || 'Gagal login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      // Akan redirect ke Google, tidak perlu handle result di sini
      await signInWithGoogle();
      // Loading akan tetap true karena user akan di-redirect
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      setError(firebaseError.message || 'Gagal login dengan Google.');
      setLoading(false);
    }
  };

  const handleSendLoginLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendLoginLink(email);
      setSuccess('Link login telah dikirim ke email Anda. Cek inbox atau folder spam.');
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim link.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess('Link reset password telah dikirim ke email Anda.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar.');
      } else {
        setError(err.message || 'Gagal mengirim link reset.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-8 sm:py-12">
      {/* Back to Home Button */}
      <Link
        href={getLandingUrl()}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg shadow-sm border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:shadow-md transition-all z-10"
      >
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-xs sm:text-sm font-medium">Kembali</span>
      </Link>

      <div className="max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <Link href={getLandingUrl()} className="inline-block mb-4 sm:mb-6">
            <img src="/logo.png" alt="NUSA AI" className="w-25 h-14 md:w-30 md:h-20 rounded-lg object-cover" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
            {mode === 'password' && 'Masuk ke Akun'}
            {mode === 'email-link' && 'Login dengan Email'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h1>
          <p className="text-neutral-600 mt-2 text-sm sm:text-base">
            {mode === 'password' && 'Selamat datang kembali'}
            {mode === 'email-link' && 'Kami akan kirim link login ke email Anda'}
            {mode === 'forgot-password' && 'Masukkan email untuk reset password'}
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-neutral-700 mb-6">{success}</p>
              <button
                onClick={() => { setSuccess(''); setMode('password'); }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Kembali ke Login
              </button>
            </div>
          ) : (
            <>
              {mode === 'password' && (
                <>
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 border-2 border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium text-neutral-700">Masuk dengan Google</span>
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-sm text-neutral-500">atau</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="email@contoh.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        required
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        placeholder="Password Anda"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                  </form>

                  <div className="flex justify-between mt-4 text-sm">
                    <button
                      onClick={() => setMode('email-link')}
                      className="text-green-600 hover:text-green-700"
                    >
                      Login tanpa password
                    </button>
                    <button
                      onClick={() => setMode('forgot-password')}
                      className="text-neutral-600 hover:text-neutral-700"
                    >
                      Lupa password?
                    </button>
                  </div>
                </>
              )}

              {mode === 'email-link' && (
                <form onSubmit={handleSendLoginLink} className="space-y-4">
                  <div>
                    <label htmlFor="email-link" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email-link"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="email@contoh.com"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Link Login'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('password')}
                    className="w-full py-3 text-neutral-600 hover:text-neutral-700 font-medium"
                  >
                    Kembali ke login biasa
                  </button>
                </form>
              )}

              {mode === 'forgot-password' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label htmlFor="email-reset" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email-reset"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      required
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="email@contoh.com"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('password')}
                    className="w-full py-3 text-neutral-600 hover:text-neutral-700 font-medium"
                  >
                    Kembali ke login
                  </button>
                </form>
              )}
            </>
          )}

          <p className="text-center text-sm text-neutral-600 mt-6">
            Belum punya akun?{' '}
            <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Daftar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
