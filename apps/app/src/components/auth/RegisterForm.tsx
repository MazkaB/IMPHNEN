'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerWithEmail } from '@/lib/firebase/auth-service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mail, Lock, User, Building, Eye, EyeOff } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    businessName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.displayName) {
      return 'Semua field wajib diisi';
    }

    if (formData.password.length < 8) {
      return 'Password minimal 8 karakter';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Password tidak cocok';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Format email tidak valid';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await registerWithEmail(
        formData.email,
        formData.password,
        formData.displayName,
        formData.businessName
      );
      router.push('/dashboard');
    } catch (err: unknown) {
      console.error('Register error:', err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Email sudah terdaftar');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password terlalu lemah');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Daftar Akun</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              name="displayName"
              placeholder="Nama Lengkap"
              value={formData.displayName}
              onChange={handleChange}
              className="pl-10"
              required
              autoComplete="name"
              aria-label="Nama Lengkap"
            />
          </div>

          <div className="relative">
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              name="businessName"
              placeholder="Nama Usaha (opsional)"
              value={formData.businessName}
              onChange={handleChange}
              className="pl-10"
              autoComplete="organization"
              aria-label="Nama Usaha"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="Password (min. 8 karakter)"
              value={formData.password}
              onChange={handleChange}
              className="pl-10 pr-10"
              required
              autoComplete="new-password"
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

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="pl-10"
              required
              autoComplete="new-password"
              aria-label="Konfirmasi Password"
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Daftar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
