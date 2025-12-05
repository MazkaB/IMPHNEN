'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, resetPassword } from '@/lib/firebase/auth-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginUser(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Login error:', err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/user-not-found') {
        setError('Email tidak terdaftar');
      } else if (firebaseError.code === 'auth/wrong-password') {
        setError('Password salah');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Format email tidak valid');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Terlalu banyak percobaan. Coba lagi nanti.');
      } else {
        setError('Gagal login. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Masukkan email terlebih dahulu');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Gagal mengirim email reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Masuk</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          {resetSent && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
              Email reset password telah dikirim. Cek inbox Anda.
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoComplete="email"
              aria-label="Email"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10"
              required
              autoComplete="current-password"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Masuk
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Lupa password?
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
