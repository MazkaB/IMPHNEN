'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { updateUserProfile } from '@/lib/firebase/auth-service';
import { Settings, User, Building, Phone, Save, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile, setProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    businessName: profile?.businessName || '',
    phoneNumber: profile?.phoneNumber || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!user?.uid) throw new Error('User tidak ditemukan');

      await updateUserProfile(user.uid, formData);
      
      setProfile({
        ...profile!,
        ...formData,
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setError('Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-700 rounded-2xl flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            Pengaturan
          </h1>
          <p className="text-gray-500 text-base sm:text-lg mt-1 ml-15">
            Kelola profil dan preferensi akun Anda
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Perubahan berhasil disimpan!</span>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Profil</h2>
              <p className="text-sm text-gray-500">Informasi pribadi Anda</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-base border-2 border-red-200">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-4 bg-gray-100 border-2 border-gray-200 rounded-2xl text-gray-500 text-lg"
              />
              <p className="text-sm text-gray-400 mt-2">
                Email tidak dapat diubah
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nama Usaha
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Contoh: Warung Bakso Pak Joko"
                  className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nomor Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+62812345678"
                  className="w-full px-4 py-4 pl-12 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg transition-colors disabled:opacity-50 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  Simpan Perubahan
                </>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informasi Akun</h2>
              <p className="text-sm text-gray-500">Status dan paket Anda</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 bg-green-50 rounded-2xl border-2 border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Status Akun</p>
              <p className="text-xl font-bold text-green-600 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Aktif
              </p>
            </div>

            <div className="p-5 bg-blue-50 rounded-2xl border-2 border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">Paket Langganan</p>
              <p className="text-xl font-bold text-blue-600">Premium</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t-2 border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4">Aksi Cepat</h3>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Kembali ke Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
