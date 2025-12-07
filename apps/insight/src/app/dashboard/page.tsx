'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, TrendingUp, TrendingDown, Package, DollarSign, BarChart3, Home, ChevronLeft, ChevronRight, Lightbulb, Tag, ShoppingCart } from 'lucide-react';

type PeriodType = 'today' | 'week' | 'month';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';
const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';

interface ProfitLoss {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
}

interface BestSeller {
  productName: string;
  quantitySold: number;
  revenue: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  category: string;
}

interface AIRecommendation {
  type: string;
  title: string;
  suggestion: string;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profitLoss, setProfitLoss] = useState<ProfitLoss>({ totalRevenue: 0, totalCost: 0, netProfit: 0, profitMargin: 0 });
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const urlUserId = searchParams.get('userId');
  const hasData = transactions.length > 0;

  // Fetch data from main app API
  useEffect(() => {
    if (!urlUserId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/analytics?userId=${urlUserId}&period=${period}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setProfitLoss(result.data.profitLoss);
          setBestSellers(result.data.bestSellers || []);
          setTransactions(result.data.transactions || []);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [urlUserId, period]);

  // Fetch AI recommendations with 24h cache
  useEffect(() => {
    if (!hasData || !urlUserId) return;
    
    const CACHE_KEY = `ai_recommendations_${urlUserId}`;
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    const fetchAI = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          if (now - timestamp < CACHE_DURATION) {
            // Cache still valid
            setAiRecommendations(data);
            return;
          }
        } catch {
          // Invalid cache, continue to fetch
        }
      }
      
      setLoadingAI(true);
      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions, profitLoss, bestSellers }),
        });
        const data = await response.json();
        if (data.success && data.recommendations) {
          setAiRecommendations(data.recommendations);
          // Save to cache with timestamp
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: data.recommendations,
            timestamp: Date.now(),
          }));
        }
      } catch (error) {
        console.error('Failed to fetch AI recommendations:', error);
      } finally {
        setLoadingAI(false);
      }
    };

    fetchAI();
  }, [hasData, urlUserId, transactions.length]);

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const slides = ['overview', 'products', 'recommendations'];
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'price': return <DollarSign className="w-5 h-5 text-blue-600" />;
      case 'stock': return <Package className="w-5 h-5 text-orange-600" />;
      case 'promo': return <Tag className="w-5 h-5 text-green-600" />;
      case 'saving': return <ShoppingCart className="w-5 h-5 text-purple-600" />;
      default: return <Lightbulb className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gray-600 mx-auto" />
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 truncate">{hasData ? 'Data Real-time' : 'Belum Ada Data'}</p>
              </div>
            </div>
            <a href={`${DASHBOARD_URL}/dashboard`} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium flex-shrink-0">
              <Home className="w-5 h-5" /><span className="hidden sm:inline">Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {!urlUserId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-yellow-700">Akses halaman ini dari Dashboard NUSA untuk melihat data bisnis Anda.</p>
          </div>
        )}

        {/* Period Selector */}
        <div className="bg-white border border-gray-200 rounded-xl p-1 flex">
          {(['today', 'week', 'month'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg font-bold text-sm sm:text-base transition-all ${period === p ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
              {p === 'today' ? 'Hari Ini' : p === 'week' ? 'Minggu' : 'Bulan'}
            </button>
          ))}
        </div>

        {/* Slide Navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevSlide} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-6 bg-gray-900' : 'w-2 bg-gray-300'}`} />
            ))}
          </div>
          <button onClick={nextSlide} className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Slide 0: Overview */}
        {currentSlide === 0 && (
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Ringkasan Keuangan</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <div className="w-9 sm:w-10 h-9 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                  <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-500">Pemasukan</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(profitLoss.totalRevenue)}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <div className="w-9 sm:w-10 h-9 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center mb-2 sm:mb-3">
                  <TrendingDown className="w-4 sm:w-5 h-4 sm:h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-500">Pengeluaran</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(profitLoss.totalCost)}</p>
              </div>
            </div>
            <div className={`bg-white border rounded-xl p-4 sm:p-6 ${profitLoss.netProfit >= 0 ? 'border-green-200' : 'border-red-200'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Keuntungan Bersih</p>
                  <p className={`text-xl sm:text-3xl font-bold ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profitLoss.netProfit)}
                  </p>
                </div>
                <div className={`w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${profitLoss.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <DollarSign className={`w-6 sm:w-7 h-6 sm:h-7 ${profitLoss.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                Margin: <span className="font-bold text-gray-900">{profitLoss.profitMargin.toFixed(1)}%</span>
              </p>
            </div>
          </section>
        )}


        {/* Slide 1: Products */}
        {currentSlide === 1 && (
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Produk Terlaris</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {bestSellers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {bestSellers.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                        }`}>{index + 1}</div>
                        <div>
                          <p className="font-bold text-gray-900">{product.productName}</p>
                          <p className="text-gray-500 text-sm">{product.quantitySold} terjual</p>
                        </div>
                      </div>
                      <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada data produk</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Slide 2: AI Recommendations */}
        {currentSlide === 2 && (
          <section className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Rekomendasi AI</h2>
            
            {loadingAI ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Menganalisis data bisnis...</p>
              </div>
            ) : aiRecommendations.length > 0 ? (
              <div className="space-y-4">
                {aiRecommendations.map((rec, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        rec.type === 'price' ? 'bg-blue-50' : rec.type === 'stock' ? 'bg-orange-50' : rec.type === 'promo' ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        {getRecommendationIcon(rec.type)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{rec.title}</p>
                        <p className="text-gray-600 mt-1">{rec.suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tambahkan transaksi untuk mendapatkan rekomendasi AI</p>
              </div>
            )}

            {hasData && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Ringkasan</p>
                    <p className="text-gray-600 mt-1">
                      {profitLoss.netProfit >= 0 
                        ? `Keuntungan ${formatCurrency(profitLoss.netProfit)} dengan margin ${profitLoss.profitMargin.toFixed(1)}%.`
                        : `Kerugian ${formatCurrency(Math.abs(profitLoss.netProfit))}. Fokus kurangi pengeluaran.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
