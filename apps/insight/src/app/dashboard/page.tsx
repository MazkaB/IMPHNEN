'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useAccounts } from '@/lib/hooks/useAccounts';
import ProfitLossCard from '@/components/dashboard/ProfitLossCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import BestSellerWidget from '@/components/dashboard/BestSellerWidget';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import AccountsTracker from '@/components/dashboard/AccountsTracker';
import PriceRecommendation from '@/components/dashboard/PriceRecommendation';
import PurchaseRecommendation from '@/components/dashboard/PurchaseRecommendation';
import ProductStockOverview from '@/components/dashboard/ProductStockOverview';
import { 
  ChevronLeft, 
  ChevronRight, 
  RefreshCw, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Lightbulb,
  CheckCircle,
  ArrowRight,
  Home,
  Download,
  Share2
} from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { getDashboardUrl, getContentUrl } from '@/lib/urls';

type PeriodType = 'today' | 'week' | 'month';

// Step-by-step insight sections - Typeform style
const insightSteps = [
  {
    id: 'overview',
    title: 'Ringkasan Keuangan',
    subtitle: 'Laba & Rugi Anda',
    icon: DollarSign,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500',
    description: 'Lihat total pemasukan dan pengeluaran bisnis Anda'
  },
  {
    id: 'products',
    title: 'Produk Terlaris',
    subtitle: 'Best Seller',
    icon: Package,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500',
    description: 'Produk mana yang paling laris dan menguntungkan?'
  },
  {
    id: 'trends',
    title: 'Tren Penjualan',
    subtitle: 'Grafik & Statistik',
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500',
    description: 'Bagaimana perkembangan bisnis Anda dari waktu ke waktu?'
  },
  {
    id: 'recommendations',
    title: 'Saran AI',
    subtitle: 'Rekomendasi Cerdas',
    icon: Lightbulb,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500',
    description: 'Tips dan saran untuk meningkatkan bisnis Anda'
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [currentStep, setCurrentStep] = useState(0);

  const getDateRange = (period: PeriodType) => {
    const now = new Date();
    switch (period) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  const { start, end } = getDateRange(period);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid || null, start, end);
  const { products, loading: productsLoading } = useProducts(user?.uid || null);
  const { receivables, payables, loading: accountsLoading } = useAccounts(user?.uid || null);

  const {
    profitLoss,
    salesTrend,
    bestSellers,
    priceRecommendations,
    purchaseRecommendations,
  } = useAnalytics(transactions, products, period);

  const isLoading = transactionsLoading || productsLoading || accountsLoading;

  const nextStep = () => {
    if (currentStep < insightSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (index: number) => setCurrentStep(index);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Main Profit/Loss Summary - Large & Clear */}
            <div className="bg-white rounded-3xl border-2 border-purple-100 p-6 sm:p-8 shadow-sm">
              <div className="text-center mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {profitLoss.netProfit >= 0 ? '🎉 Bisnis Anda UNTUNG!' : '⚠️ Perlu Perhatian'}
                </h3>
                <p className={`text-4xl sm:text-5xl font-bold ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Rp {Math.abs(profitLoss.netProfit).toLocaleString('id-ID')}
                </p>
                <p className="text-gray-500 mt-2">
                  {profitLoss.netProfit >= 0 ? 'Keuntungan Bersih' : 'Kerugian'}
                </p>
              </div>

              {/* Income vs Expense - Visual Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-2xl p-4 sm:p-6 text-center border-2 border-green-200">
                  <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">Pemasukan</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    Rp {profitLoss.totalRevenue.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="bg-red-50 rounded-2xl p-4 sm:p-6 text-center border-2 border-red-200">
                  <DollarSign className="w-10 h-10 text-red-600 mx-auto mb-2" />
                  <p className="text-sm text-red-700 font-medium">Pengeluaran</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">
                    Rp {profitLoss.totalCost.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Simple Explanation */}
              <div className={`p-4 rounded-2xl ${profitLoss.netProfit >= 0 ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
                <div className="flex items-start gap-3">
                  <CheckCircle className={`w-6 h-6 flex-shrink-0 mt-0.5 ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div>
                    <p className={`font-semibold ${profitLoss.netProfit >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                      {profitLoss.netProfit >= 0 
                        ? 'Bagus! Pemasukan lebih besar dari pengeluaran.' 
                        : 'Pengeluaran lebih besar dari pemasukan.'}
                    </p>
                    <p className={`text-sm ${profitLoss.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {profitLoss.netProfit >= 0 
                        ? 'Terus pertahankan dan tingkatkan penjualan!' 
                        : 'Coba kurangi pengeluaran atau tingkatkan penjualan.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory transactions={transactions} loading={isLoading} />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            {/* Best Seller Highlight */}
            {bestSellers.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
                <div className="text-center">
                  <span className="text-5xl sm:text-6xl mb-4 block">🏆</span>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">Produk Terlaris Anda</h3>
                  <p className="text-4xl sm:text-5xl font-bold mb-2">{bestSellers[0]?.productName}</p>
                  <p className="text-white/80 text-lg">
                    Terjual <span className="font-bold">{bestSellers[0]?.quantitySold}</span> unit
                  </p>
                  <p className="text-white/80">
                    Total: <span className="font-bold">Rp {bestSellers[0]?.revenue?.toLocaleString('id-ID') || '0'}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Best Seller List */}
            <BestSellerWidget data={bestSellers} loading={isLoading} />

            {/* Stock Overview */}
            <ProductStockOverview products={products} loading={isLoading} />

            {/* Tip */}
            <div className="bg-yellow-50 rounded-2xl p-4 sm:p-6 border-2 border-yellow-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="font-bold text-yellow-900">Tips:</p>
                  <p className="text-yellow-800">
                    Fokus promosikan produk terlaris Anda untuk meningkatkan penjualan!
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Sales Trend Chart */}
            <SalesTrendChart data={salesTrend} loading={isLoading} />

            {/* Accounts Summary */}
            <AccountsTracker receivables={receivables} payables={payables} loading={isLoading} />

            {/* Trend Insight */}
            <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 border-2 border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">📈 Kesimpulan Tren</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Data Tersedia</p>
                    <p className="text-sm text-gray-600">
                      {salesTrend.length > 1 
                        ? `${salesTrend.length} periode data untuk analisis`
                        : 'Tambahkan lebih banyak transaksi untuk melihat tren'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-900">Piutang</p>
                    <p className="text-sm text-gray-600">
                      Rp {receivables.reduce((sum, r) => sum + r.amount, 0).toLocaleString('id-ID')} belum dibayar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* AI Recommendations */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Lightbulb className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">🤖 Saran AI untuk Anda</h3>
                  <p className="text-white/80">Berdasarkan data bisnis Anda</p>
                </div>
              </div>

              <div className="space-y-4">
                {profitLoss.netProfit >= 0 ? (
                  <>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="font-semibold mb-1">✅ Pertahankan Momentum</p>
                      <p className="text-white/80 text-sm">
                        Bisnis Anda sudah untung Rp {profitLoss.netProfit.toLocaleString('id-ID')}! Terus catat transaksi untuk tracking yang lebih akurat.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="font-semibold mb-1">📈 Tingkatkan Penjualan</p>
                      <p className="text-white/80 text-sm">
                        {bestSellers.length > 0 
                          ? `Fokus promosikan ${bestSellers[0]?.productName} yang sudah terbukti laris.`
                          : 'Gunakan fitur Promosi untuk membuat konten marketing.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="font-semibold mb-1">⚠️ Kurangi Pengeluaran</p>
                      <p className="text-white/80 text-sm">
                        Pengeluaran Anda Rp {profitLoss.totalCost.toLocaleString('id-ID')}. Cek kategori terbesar dan cari cara menghemat.
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-4">
                      <p className="font-semibold mb-1">💰 Tingkatkan Pemasukan</p>
                      <p className="text-white/80 text-sm">
                        Promosikan produk terlaris untuk meningkatkan penjualan.
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

            {/* Price & Purchase Recommendations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceRecommendation data={priceRecommendations} loading={isLoading} />
              <PurchaseRecommendation data={purchaseRecommendations} loading={isLoading} />
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-3xl border-2 border-green-200 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Langkah Selanjutnya</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={`${getContentUrl()}/content-creator`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition-colors border-2 border-orange-200"
                >
                  <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-orange-900">Buat Konten Marketing</p>
                    <p className="text-sm text-orange-700">Promosikan produk Anda</p>
                  </div>
                </a>
                <a
                  href={getDashboardUrl()}
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors border-2 border-blue-200"
                >
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-900">Kembali ke Dashboard</p>
                    <p className="text-sm text-blue-700">Catat transaksi baru</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Completion */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-3xl p-6 sm:p-8 border-2 border-yellow-200 text-center">
              <span className="text-5xl mb-4 block">🎉</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Analisis Selesai!
              </h3>
              <p className="text-gray-600">
                Anda sudah melihat semua insight bisnis. Terus pantau secara rutin!
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen pb-32">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">📊 Analisis Bisnis</h1>
              <p className="text-muted-foreground mt-1">Pahami bisnis Anda langkah demi langkah</p>
            </div>
            <div className="flex items-center gap-2">
              {(['today', 'week', 'month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    period === p 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu' : 'Bulan'}
                </button>
              ))}
            </div>
          </div>

          {/* Progress Card - Typeform Style */}
          <div className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 mb-6 overflow-hidden">
            {/* Progress Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 sm:p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">🎯 Insight Bisnis Anda</h2>
                  <p className="text-white/80 text-sm">Lihat data langkah demi langkah</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-bold">{currentStep + 1}</span>
                  <span className="text-white/60 text-lg">/{insightSteps.length}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / insightSteps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {insightSteps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const StepIcon = step.icon;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => goToStep(index)}
                      className={`
                        relative flex flex-col items-center p-2 sm:p-4 rounded-2xl transition-all
                        ${isCurrent ? 'bg-purple-50 border-2 border-purple-500 scale-105 shadow-lg' : ''}
                        ${isCompleted ? 'bg-gray-50' : ''}
                        ${!isCompleted && !isCurrent ? 'opacity-50' : ''}
                        hover:opacity-100 active:scale-95
                      `}
                    >
                      <div className={`
                        w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2
                        ${isCompleted ? 'bg-green-500' : isCurrent ? step.bgColor : 'bg-gray-300'}
                        transition-all shadow-md
                      `}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        ) : (
                          <StepIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm font-bold text-center ${isCurrent ? 'text-purple-700' : 'text-gray-600'}`}>
                        {step.title.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Step Info */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${insightSteps[currentStep].color} flex items-center justify-center shadow-lg`}>
                  {(() => {
                    const Icon = insightSteps[currentStep].icon;
                    return <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <p className="text-xl sm:text-2xl font-bold text-foreground">
                    {insightSteps[currentStep].title}
                  </p>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {insightSteps[currentStep].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 animate-spin text-purple-500" />
                <span className="ml-3 text-lg text-muted-foreground">Memuat data...</span>
              </div>
            ) : (
              renderStepContent()
            )}
          </div>

          {/* Navigation - Fixed Bottom */}
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
                {insightSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`
                      h-3 rounded-full transition-all
                      ${index === currentStep ? 'w-8 bg-purple-500' : 'w-3 bg-gray-300 hover:bg-gray-400'}
                    `}
                  />
                ))}
              </div>

              <button
                onClick={nextStep}
                disabled={currentStep === insightSteps.length - 1}
                className={`
                  flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg transition-all
                  ${currentStep === insightSteps.length - 1 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95 shadow-lg'}
                `}
              >
                <span className="hidden sm:inline">Lanjut</span>
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {!isLoading && transactions.length === 0 && products.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Belum Ada Data</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Mulai catat transaksi di Dashboard untuk melihat analisis bisnis Anda.
              </p>
              <a 
                href={getDashboardUrl()} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors"
              >
                <Home className="w-5 h-5" />
                Ke Dashboard
              </a>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
