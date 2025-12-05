'use client';

import { useState } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Mic, Info } from 'lucide-react';

export default function VoicePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Mic className="w-6 h-6 mr-2 text-primary-600" />
          Catat dengan Suara
        </h1>
        <p className="text-gray-500">
          Ucapkan transaksi Anda dalam Bahasa Indonesia
        </p>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">Tips Pencatatan Suara</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sebutkan jenis transaksi: &quot;jual&quot;, &quot;beli&quot;, &quot;bayar&quot;, &quot;terima&quot;</li>
                <li>• Sebutkan jumlah dengan jelas: &quot;50 ribu&quot;, &quot;2 juta&quot;, &quot;500 rb&quot;</li>
                <li>• Contoh: &quot;Jual bakso 30 porsi harga 15 ribu&quot;</li>
                <li>• Contoh: &quot;Beli tepung 10 kilo 150 ribu&quot;</li>
                <li>• Dialek lokal didukung: &quot;ceng&quot;, &quot;gopek&quot;, &quot;ceban&quot;</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Recorder */}
      <div className="max-w-md mx-auto">
        <VoiceRecorder onTransactionSaved={handleTransactionSaved} autoSave={false} />
      </div>

      {/* Recent Voice Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi dari Suara</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList key={refreshKey} limit={5} showActions={false} />
        </CardContent>
      </Card>
    </div>
  );
}
