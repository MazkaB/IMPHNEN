'use client';

import { useState } from 'react';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TransactionList } from '@/components/transactions/TransactionList';
import { Mic, ArrowLeft, CheckCircle, Home, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

export default function VoicePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTransactionSaved = () => {
    setRefreshKey((prev) => prev + 1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/dashboard"
          className="p-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-white" />
            </div>
            Catat dengan Suara
          </h1>
          <p className="text-gray-500 text-base sm:text-lg mt-1 ml-15">
            Cukup bicara, AI akan mencatat untuk Anda
          </p>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top">
          <div className="bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold text-lg">Transaksi berhasil disimpan!</span>
          </div>
        </div>
      )}

      {/* Tips Section - Large & Clear for Elderly */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 sm:p-8 border-2 border-blue-200 mb-6">
        <h3 className="font-bold text-blue-900 text-xl sm:text-2xl mb-4 flex items-center gap-2">
          💡 Contoh Ucapan
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">&quot;Jual bakso 50 ribu&quot;</p>
              <p className="text-green-600 font-medium">→ Pemasukan</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">&quot;Beli tepung 30 ribu&quot;</p>
              <p className="text-red-600 font-medium">→ Pengeluaran</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">&quot;Terima uang 100 ribu&quot;</p>
              <p className="text-green-600 font-medium">→ Pemasukan</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">&quot;Bayar listrik 200 ribu&quot;</p>
              <p className="text-red-600 font-medium">→ Pengeluaran</p>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Recorder - Centered and Large */}
      <div className="max-w-lg mx-auto mb-8">
        <VoiceRecorder onTransactionSaved={handleTransactionSaved} autoSave={false} />
      </div>

      {/* Recent Transactions */}
      {refreshKey > 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-6 shadow-sm mb-6">
          <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
            📝 Catatan Terakhir
          </h3>
          <TransactionList key={refreshKey} limit={5} showActions={false} />
        </div>
      )}

      {/* Back to Dashboard CTA */}
      <div className="text-center">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors text-lg"
        >
          <Home className="w-6 h-6" />
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
