'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { updateUserProfile } from '@/lib/firebase/auth-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings, User, Building, Phone, Save } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-gray-600" />
          Pengaturan
        </h1>
        <p className="text-gray-500">
          Kelola profil dan preferensi akun Anda
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm">
                  Perubahan berhasil disimpan!
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="relative">
                <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Usaha
                </label>
                <Input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Telepon
                </label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="pl-10"
                  placeholder="+62812345678"
                />
              </div>

              <Button
                type="submit"
                isLoading={isLoading}
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full"
              >
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Status Akun</p>
              <p className="font-medium text-green-600">Aktif</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Paket</p>
              <p className="font-medium text-gray-900">Gratis</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">WhatsApp Terhubung</p>
              <p className="font-medium text-gray-900">
                {(profile as { whatsappNumber?: string })?.whatsappNumber || 'Belum terhubung'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
