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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <Link 
              href="/dashboard"
              className="p-2.5 sm:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
              aria-label="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Catat dengan Suara</h1>
                <p className="text-sm text-gray-500 truncate">Bicara, AI akan mencatat</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Transaksi berhasil disimpan</span>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Tips Section */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">Contoh Ucapan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">&quot;Jual bakso 50 ribu&quot;</p>
                <p className="text-green-600 text-sm">Pemasukan</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">&quot;Beli tepung 30 ribu&quot;</p>
                <p className="text-red-600 text-sm">Pengeluaran</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">&quot;Terima uang 100 ribu&quot;</p>
                <p className="text-green-600 text-sm">Pemasukan</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">&quot;Bayar listrik 200 ribu&quot;</p>
                <p className="text-red-600 text-sm">Pengeluaran</p>
              </div>
            </div>
          </div>
        </section>

        {/* Voice Recorder */}
        <section className="max-w-lg mx-auto">
          <VoiceRecorder onTransactionSaved={handleTransactionSaved} autoSave={false} />
        </section>

        {/* Recent Transactions */}
        {refreshKey > 0 && (
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Catatan Terakhir</h2>
            <TransactionList key={refreshKey} limit={5} showActions={false} />
          </section>
        )}

        {/* Back to Dashboard */}
        <div className="text-center pt-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
