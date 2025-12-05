'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Image, Instagram, MessageCircle, Video, Info } from 'lucide-react';

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Image className="w-6 h-6 mr-2 text-orange-600" />
          Auto Content Creator
        </h1>
        <p className="text-gray-500">
          Generate konten marketing otomatis
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-orange-50 border-orange-100">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-orange-900 mb-1">Fitur dalam Pengembangan</h3>
              <p className="text-sm text-orange-800">
                Fitur Auto Content Creator sedang dikembangkan oleh tim Agung. Segera hadir!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Instagram className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instagram</h3>
            <p className="text-sm text-gray-500">
              Poster produk & caption menarik
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500">
              Broadcast & status promosi
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">TikTok</h3>
            <p className="text-sm text-gray-500">
              Script video & hashtag viral
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Fitur yang Akan Datang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">🎨 Poster Generator</h3>
              <p className="text-sm text-gray-500">
                Generate poster produk otomatis dengan AI
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">✍️ Caption Writer</h3>
              <p className="text-sm text-gray-500">
                Caption marketing sesuai segmentasi pelanggan
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📅 Content Calendar</h3>
              <p className="text-sm text-gray-500">
                Jadwal posting otomatis
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📊 Analytics</h3>
              <p className="text-sm text-gray-500">
                Analisis performa konten
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
