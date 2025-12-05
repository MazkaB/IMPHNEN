'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Lightbulb, Info } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-purple-600" />
          Dashboard Insight AI
        </h1>
        <p className="text-gray-500">
          Analisis dan rekomendasi untuk usaha Anda
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-purple-50 border-purple-100">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-purple-900 mb-1">Fitur dalam Pengembangan</h3>
              <p className="text-sm text-purple-800">
                Fitur Dashboard Insight sedang dikembangkan oleh tim Pancar. Segera hadir!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Tren Penjualan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Grafik tren akan muncul di sini</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
              Rekomendasi AI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Rekomendasi akan muncul berdasarkan data transaksi Anda</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Fitur yang Akan Datang</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📊 Analisis Profit</h3>
              <p className="text-sm text-gray-500">
                Lihat profit harian, mingguan, dan bulanan
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">💡 Rekomendasi Harga</h3>
              <p className="text-sm text-gray-500">
                Saran harga optimal berdasarkan data
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">📈 Prediksi Tren</h3>
              <p className="text-sm text-gray-500">
                Prediksi penjualan untuk perencanaan stok
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
