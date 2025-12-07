'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase/config';
import { getTransactionSummary, getUserTransactions } from '@/lib/firebase/transaction-service';
import { Transaction } from '@/types';
import {
  Mic,
  Camera,
  BarChart3,
  Image,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { getOcrUrl, getInsightUrl, getContentUrl } from '@/lib/urls';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

// Flow steps untuk timeline - konsep SAAS yang nyambung
const flowSteps = [
  {
    id: 'record',
    number: 1,
    title: 'Catat',
    subtitle: 'Record',
    description: 'Input data dengan suara atau foto struk',
    icon: Mic,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500',
  },
  {
    id: 'analyze',
    number: 2,
    title: 'Analisis',
    subtitle: 'Analyze',
    description: 'Lihat insight dan laporan bisnis',
    icon: BarChart3,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
  },
  {
    id: 'promote',
    number: 3,
    title: 'Promosi',
    subtitle: 'Promote',
    description: 'Buat konten marketing otomatis',
    icon: Image,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500',
  },
  {
    id: 'improve',
    number: 4,
    title: 'Tingkatkan',
    subtitle: 'Improve',
    description: 'Dapatkan rekomendasi AI',
    icon: Sparkles,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500',
  },
];

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

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
      
      // Determine current step based on data
      if (transactionsData.length === 0) {
        setCurrentStep(0);
      } else if (transactionsData.length < 3) {
        setCurrentStep(0);
      } else {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < flowSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <RecordStep transactions={transactions} />;
      case 1:
        return <AnalyzeStep summary={summary} transactions={transactions} />;
      case 2:
        return <PromoteStep />;
      case 3:
        return <ImproveStep summary={summary} />;
      default:
        return <RecordStep transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen pb-32">
      {/* Welcome Header - Simple & Large */}
      <div className="text-center py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">
          Halo, {profile?.displayName?.split(' ')[0] || 'Pengusaha'}! 👋
        </h1>
        <p className="text-gray-500 text-lg sm:text-xl mt-2">
          {profile?.businessName || 'Selamat datang di NUSA AI'}
        </p>
      </div>

      {/* Flow Timeline - Typeform Style Progress */}
      <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 mx-2 sm:mx-0 mb-6 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 sm:p-6">
          <div className="flex items-center justify-between text-white">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">🎯 Langkah Sukses Bisnis</h2>
              <p className="text-white/80 text-sm sm:text-base">Ikuti alur ini untuk hasil maksimal</p>
            </div>
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-bold">{currentStep + 1}</span>
              <span className="text-white/60 text-lg">/{flowSteps.length}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / flowSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators - Large Touch Targets */}
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {flowSteps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const StepIcon = step.icon;
              
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(index)}
                  className={`
                    relative flex flex-col items-center p-2 sm:p-4 rounded-2xl transition-all
                    ${isCurrent ? 'bg-green-50 border-2 border-green-500 scale-105 shadow-lg' : ''}
                    ${isCompleted ? 'bg-gray-50' : ''}
                    ${!isCompleted && !isCurrent ? 'opacity-50' : ''}
                    hover:opacity-100 active:scale-95
                  `}
                >
                  <div className={`
                    w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-2
                    ${isCompleted ? 'bg-green-500' : isCurrent ? step.bgColor : 'bg-gray-300'}
                    transition-all shadow-md
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    ) : (
                      <StepIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    )}
                  </div>
                  <span className={`text-xs sm:text-sm font-bold text-center ${isCurrent ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Step Info */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${flowSteps[currentStep].color} flex items-center justify-center shadow-lg`}>
              {(() => {
                const Icon = flowSteps[currentStep].icon;
                return <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {flowSteps[currentStep].title}
              </p>
              <p className="text-gray-500 text-sm sm:text-base">
                {flowSteps[currentStep].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content - Typeform Style Full Screen Section */}
      <div className="mx-2 sm:mx-0 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-4 shadow-2xl z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all
              ${currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95'}
            `}
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          {/* Step Dots */}
          <div className="flex gap-2">
            {flowSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`
                  h-3 rounded-full transition-all
                  ${index === currentStep ? 'w-8 bg-green-500' : 'w-3 bg-gray-300 hover:bg-gray-400'}
                `}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === flowSteps.length - 1}
            className={`
              flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all
              ${currentStep === flowSteps.length - 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-lg'}
            `}
          >
            <span className="hidden sm:inline">Lanjut</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}


// Step 1: Record - Input Data
function RecordStep({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="space-y-6">
      {/* Main Input Options - Very Large Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* Voice Input */}
        <Link href="/voice" className="block">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 sm:p-10 text-white hover:shadow-2xl transition-all hover:scale-102 active:scale-98 cursor-pointer min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">🎤 Bicara</h3>
            <p className="text-white/80 text-center text-base sm:text-lg">
              Cukup bilang &quot;Jual bakso 50 ribu&quot;
            </p>
          </div>
        </Link>

        {/* OCR Input */}
        <a href={getOcrUrl()} target="_blank" rel="noopener noreferrer" className="block">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 sm:p-10 text-white hover:shadow-2xl transition-all hover:scale-102 active:scale-98 cursor-pointer min-h-[200px] flex flex-col items-center justify-center">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Camera className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-2">📷 Foto Struk</h3>
            <p className="text-white/80 text-center text-base sm:text-lg">
              Foto struk belanja atau bon
            </p>
          </div>
        </a>
      </div>

      {/* Recent Transactions - Simple List */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">📝 Catatan Terakhir</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {transactions.length} data
            </span>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'income' ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-base line-clamp-1">
                      {tx.description}
                    </p>
                    <p className="text-sm text-gray-500">{tx.category}</p>
                  </div>
                </div>
                <p className={`font-bold text-lg ${
                  tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {transactions.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-blue-200">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Belum Ada Catatan</h3>
          <p className="text-gray-600 text-base sm:text-lg">
            Mulai catat transaksi pertama Anda dengan bicara atau foto struk
          </p>
        </div>
      )}
    </div>
  );
}

// Step 2: Analyze - View Insights
function AnalyzeStep({ summary, transactions }: { summary: Summary | null; transactions: Transaction[] }) {
  return (
    <div className="space-y-6">
      {/* Quick Summary Cards */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 sm:p-6 border-2 border-green-200">
          <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mb-2" />
          <p className="text-xs sm:text-sm text-green-700 font-medium">Pemasukan</p>
          <p className="text-lg sm:text-2xl font-bold text-green-600">
            Rp {((summary?.totalIncome || 0) / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 sm:p-6 border-2 border-red-200">
          <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 mb-2" />
          <p className="text-xs sm:text-sm text-red-700 font-medium">Pengeluaran</p>
          <p className="text-lg sm:text-2xl font-bold text-red-600">
            Rp {((summary?.totalExpense || 0) / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
          <Wallet className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mb-2" />
          <p className="text-xs sm:text-sm text-blue-700 font-medium">Profit</p>
          <p className={`text-lg sm:text-2xl font-bold ${(summary?.netProfit || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            Rp {((summary?.netProfit || 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* CTA to Full Analysis */}
      <a
        href={getInsightUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white hover:shadow-2xl transition-all hover:scale-102 active:scale-98"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-1">📊 Lihat Analisis Lengkap</h3>
              <p className="text-white/80 text-sm sm:text-base">
                Grafik, tren, dan insight detail bisnis Anda
              </p>
            </div>
          </div>
          <ArrowRight className="w-8 h-8 hidden sm:block" />
        </div>
      </a>

      {/* Insight Preview */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">💡 Insight Cepat</h3>
          <div className="space-y-4">
            {(summary?.netProfit || 0) >= 0 ? (
              <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-green-800">Bisnis Anda UNTUNG! 🎉</p>
                  <p className="text-sm text-green-700">
                    Keuntungan: Rp {(summary?.netProfit || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200">
                <TrendingDown className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Perlu Perhatian</p>
                  <p className="text-sm text-red-700">
                    Pengeluaran lebih besar dari pemasukan
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-800">Total Transaksi</p>
                <p className="text-sm text-blue-700">
                  {summary?.transactionCount || 0} catatan tercatat
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Step 3: Promote - Create Content
function PromoteStep() {
  return (
    <div className="space-y-6">
      {/* Main CTA */}
      <a
        href={`${getContentUrl()}/content-creator`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 sm:p-10 text-white hover:shadow-2xl transition-all hover:scale-102 active:scale-98"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/20 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Image className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">🎨 Buat Konten Marketing</h3>
          <p className="text-white/80 text-base sm:text-lg max-w-md">
            AI akan buatkan gambar dan caption untuk promosi produk Anda
          </p>
          <div className="mt-6 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
            <span className="font-semibold">Mulai Sekarang</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </a>

      {/* Features */}
      <div className="bg-white rounded-3xl border-2 border-orange-100 p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">✨ Fitur Konten</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
            <span className="text-2xl">🖼️</span>
            <div>
              <p className="font-bold text-gray-900">Gambar Otomatis</p>
              <p className="text-sm text-gray-600">AI pilihkan gambar yang cocok</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-bold text-gray-900">Caption Siap Pakai</p>
              <p className="text-sm text-gray-600">Tinggal copy dan paste</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
            <span className="text-2xl">💾</span>
            <div>
              <p className="font-bold text-gray-900">Download Mudah</p>
              <p className="text-sm text-gray-600">Simpan ke galeri HP</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="font-bold text-gray-900">Best Seller</p>
              <p className="text-sm text-gray-600">Promosikan produk terlaris</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Improve - AI Recommendations
function ImproveStep({ summary }: { summary: Summary | null }) {
  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">🤖 Rekomendasi AI</h3>
            <p className="text-white/80">Tips untuk meningkatkan bisnis</p>
          </div>
        </div>

        <div className="space-y-4">
          {(summary?.netProfit || 0) >= 0 ? (
            <>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="font-semibold mb-1">✅ Pertahankan Momentum</p>
                <p className="text-white/80 text-sm">
                  Bisnis Anda sudah untung! Terus catat transaksi untuk tracking yang lebih akurat.
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="font-semibold mb-1">📈 Tingkatkan Penjualan</p>
                <p className="text-white/80 text-sm">
                  Gunakan fitur Promosi untuk membuat konten marketing dan menarik lebih banyak pelanggan.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="font-semibold mb-1">⚠️ Kurangi Pengeluaran</p>
                <p className="text-white/80 text-sm">
                  Cek kategori pengeluaran terbesar di Analisis dan cari cara untuk menghemat.
                </p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="font-semibold mb-1">💰 Tingkatkan Pemasukan</p>
                <p className="text-white/80 text-sm">
                  Promosikan produk terlaris Anda untuk meningkatkan penjualan.
                </p>
              </div>
            </>
          )}
          <div className="bg-white/10 rounded-2xl p-4">
            <p className="font-semibold mb-1">📊 Analisis Rutin</p>
            <p className="text-white/80 text-sm">
              Cek insight bisnis minimal seminggu sekali untuk memantau perkembangan.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-3xl border-2 border-green-100 p-6 sm:p-8">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">🚀 Aksi Cepat</h3>
        <div className="grid grid-cols-2 gap-4">
          <a
            href={getInsightUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 bg-purple-50 rounded-2xl hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <span className="font-semibold text-purple-900 text-center">Lihat Analisis</span>
          </a>
          <a
            href={`${getContentUrl()}/content-creator`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors"
          >
            <Image className="w-8 h-8 text-orange-600 mb-2" />
            <span className="font-semibold text-orange-900 text-center">Buat Konten</span>
          </a>
          <Link
            href="/voice"
            className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors"
          >
            <Mic className="w-8 h-8 text-blue-600 mb-2" />
            <span className="font-semibold text-blue-900 text-center">Catat Suara</span>
          </Link>
          <a
            href={getOcrUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
          >
            <Camera className="w-8 h-8 text-green-600 mb-2" />
            <span className="font-semibold text-green-900 text-center">Foto Struk</span>
          </a>
        </div>
      </div>

      {/* Completion Message */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Selamat! Anda sudah menyelesaikan semua langkah
        </h3>
        <p className="text-gray-600">
          Terus gunakan NUSA AI untuk membantu bisnis Anda berkembang
        </p>
      </div>
    </div>
  );
}
