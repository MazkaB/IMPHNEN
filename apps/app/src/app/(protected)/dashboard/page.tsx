'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { getTransactionSummary, getUserTransactions } from '@/lib/firebase/transaction-service';
import { Transaction } from '@/types';
import {
  Mic,
  Camera,
  BarChart3,
  Image,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Wallet,
  Settings,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';
import { getOcrUrl, getInsightUrl, getContentUrl } from '@/lib/urls';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userId = auth?.currentUser?.uid;
      if (!userId) return;

      const [summaryData, transactionsData] = await Promise.all([
        getTransactionSummary(userId),
        getUserTransactions(userId, 10),
      ]);
      
      setSummary(summaryData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                Halo, {profile?.displayName?.split(' ')[0] || 'Pengusaha'}
              </h1>
              <p className="text-sm sm:text-base text-gray-500 truncate">
                {profile?.businessName || 'Selamat datang di NUSA'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Link
                href="/settings"
                className="p-2.5 sm:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Pengaturan"
              >
                <Settings className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 sm:p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                aria-label="Keluar"
              >
                <LogOut className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <section aria-label="Ringkasan Keuangan">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Bulan Ini</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex sm:block items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center sm:mb-3 flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-sm text-gray-500">Pemasukan</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {isLoading ? '...' : formatCurrency(summary?.totalIncome || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex sm:block items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center sm:mb-3 flex-shrink-0">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-sm text-gray-500">Pengeluaran</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {isLoading ? '...' : formatCurrency(summary?.totalExpense || 0)}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 flex sm:block items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center sm:mb-3 flex-shrink-0">
                <Wallet className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1 sm:flex-none">
                <p className="text-sm text-gray-500">Keuntungan</p>
                <p className={`text-lg sm:text-xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '...' : formatCurrency(summary?.netProfit || 0)}
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Step 1: Input Data */}
        <section aria-label="Catat Transaksi">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 1: Catat Transaksi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Link href="/voice" className="block">
              <div className="bg-white border border-gray-200 hover:border-gray-400 rounded-xl p-4 sm:p-6 transition-colors h-full flex sm:block items-center gap-4">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gray-900 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0">
                  <Mic className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">Bicara</h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Cukup bilang &quot;Jual bakso 50 ribu&quot;
                  </p>
                </div>
              </div>
            </Link>

            <a href={getOcrUrl()} target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-white border border-gray-200 hover:border-gray-400 rounded-xl p-4 sm:p-6 transition-colors h-full flex sm:block items-center gap-4">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gray-900 rounded-xl flex items-center justify-center sm:mb-4 flex-shrink-0">
                  <Camera className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">Foto Struk</h3>
                  <p className="text-sm sm:text-base text-gray-500">
                    Foto struk belanja atau bon
                  </p>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* Step 2: View Analytics */}
        <section aria-label="Lihat Analisis">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 2: Lihat Analisis</h2>
          <a
            href={`${getInsightUrl()}/dashboard?userId=${auth?.currentUser?.uid || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 hover:border-gray-400 rounded-xl p-4 sm:p-6 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">Dashboard Analytics</h3>
                  <p className="text-sm sm:text-base text-gray-500 truncate sm:whitespace-normal">
                    Grafik, tren, dan insight bisnis
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400 flex-shrink-0" />
            </div>
          </a>
        </section>

        {/* Step 3: Create Content */}
        <section aria-label="Buat Konten">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Langkah 3: Promosi</h2>
          <a
            href={`${getContentUrl()}/content-creator?userId=${auth?.currentUser?.uid || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 hover:border-gray-400 rounded-xl p-4 sm:p-6 transition-colors"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Image className="w-6 sm:w-7 h-6 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">Buat Konten Marketing</h3>
                  <p className="text-sm sm:text-base text-gray-500 truncate sm:whitespace-normal">
                    AI buatkan gambar dan caption
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 sm:w-6 h-5 sm:h-6 text-gray-400 flex-shrink-0" />
            </div>
          </a>
        </section>


        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <section aria-label="Transaksi Terakhir">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Catatan Terakhir</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'income' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {tx.type === 'income' ? (
                          <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">{tx.category}</p>
                      </div>
                    </div>
                    <p className={`font-bold text-sm sm:text-base whitespace-nowrap ${
                      tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && transactions.length === 0 && (
          <section className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Catatan</h3>
            <p className="text-gray-500 mb-6">
              Mulai catat transaksi pertama Anda
            </p>
            <Link
              href="/voice"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Mic className="w-5 h-5" />
              Mulai Catat dengan Suara
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}
