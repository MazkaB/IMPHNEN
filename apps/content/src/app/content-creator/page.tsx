'use client';

import { useState, useEffect } from 'react';
import { generateContent } from './actions';
import { Image, Download, Copy, Loader2, Sparkles, CheckCircle, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDashboardUrl } from '@/lib/urls';

interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  salesCount?: number;
}

interface ProductData {
  best_seller: Product[];
  recommendation: Product[];
  expired: Product[];
}

// Step configuration for Typeform-style flow
const steps = [
  { id: 'type', title: 'Pilih Jenis', description: 'Jenis konten apa yang ingin dibuat?' },
  { id: 'product', title: 'Pilih Produk', description: 'Produk mana yang ingin dipromosikan?' },
  { id: 'generate', title: 'Buat Konten', description: 'AI akan membuatkan konten untuk Anda' },
  { id: 'result', title: 'Download', description: 'Simpan gambar dan copy caption' },
];

export default function ContentCreatorPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [inputType, setInputType] = useState<'best_seller' | 'recommendation' | 'expired'>('best_seller');
  const [discount, setDiscount] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ caption: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [products, setProducts] = useState<ProductData | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { getProductsFromTransactions } = await import('@/lib/firebase/product-service');
      const data = await getProductsFromTransactions();
      if (data.best_seller?.length > 0 || data.recommendation?.length > 0 || data.expired?.length > 0) {
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const getProductList = () => {
    if (products) {
      const productList = products[inputType];
      if (productList && productList.length > 0) {
        return productList.map((p) => `${p.name} - ${p.description}`);
      }
    }
    return [];
  };

  const formatItem = (item: string, discountVal: number | '') => {
    if ((inputType !== 'expired' && inputType !== 'recommendation') || discountVal === '') return item;
    const patterns = /(Diskon \d+%|\d+% off|Buy 1 Get 1 Free|Hemat \d+%)/gi;
    if (item.match(patterns)) {
      return item.replace(patterns, () => `Diskon ${discountVal}%`);
    }
    return `${item} - Diskon ${discountVal}%`;
  };

  const handleGenerate = async () => {
    if (!selectedInput) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const finalInput = formatItem(selectedInput, discount);
      const res = await generateContent(inputType, finalInput, originalPrice, discount);

      if (res.success && res.caption && (res.imageUrl || res.unsplashUrl)) {
        setResult({
          caption: res.caption,
          imageUrl: res.imageUrl || res.unsplashUrl || '',
        });
        setCurrentStep(3); // Go to result step
      } else {
        setError(res.error || 'Gagal generate content. Silakan coba lagi.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem. Cek koneksi internet Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = result.imageUrl;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `konten-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
  };

  const handleCopyCaption = () => {
    if (result?.caption) {
      navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetForm = () => {
    setSelectedInput('');
    setResult(null);
    setError(null);
    setCurrentStep(0);
    setDiscount('');
    setOriginalPrice('');
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const modeConfig = {
    best_seller: { label: '🏆 Best Seller', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500', desc: 'Produk terlaris Anda' },
    recommendation: { label: '💡 Rekomendasi', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500', desc: 'Produk yang disarankan' },
    expired: { label: '🔥 Promo/Diskon', color: 'from-red-500 to-orange-500', bgColor: 'bg-red-500', desc: 'Produk dengan diskon' },
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pilih Jenis Konten</h2>
              <p className="text-gray-500">Konten seperti apa yang ingin Anda buat?</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {(['best_seller', 'recommendation', 'expired'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setInputType(mode); setSelectedInput(''); nextStep(); }}
                  className={`
                    p-6 sm:p-8 rounded-3xl border-2 transition-all text-left
                    bg-gradient-to-br ${modeConfig[mode].color} text-white
                    hover:shadow-2xl hover:scale-102 active:scale-98
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl sm:text-5xl">{modeConfig[mode].label.split(' ')[0]}</span>
                    <div>
                      <span className="font-bold text-xl sm:text-2xl block">{modeConfig[mode].label.split(' ').slice(1).join(' ')}</span>
                      <span className="text-white/80">{modeConfig[mode].desc}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Pilih Produk</h2>
              <p className="text-gray-500">Produk mana yang ingin dipromosikan?</p>
            </div>

            {/* Price & Discount for Promo */}
            {(inputType === 'expired' || inputType === 'recommendation') && (
              <div className="bg-orange-50 rounded-2xl p-4 sm:p-6 border-2 border-orange-200 mb-6">
                <h3 className="font-bold text-orange-900 mb-4">💰 Atur Harga & Diskon (Opsional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga Asli</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={originalPrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setOriginalPrice(val === '' ? '' : Number(val));
                        }}
                        placeholder="50000"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 pl-12 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diskon</label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={discount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setDiscount(val === '' ? '' : Number(val));
                        }}
                        placeholder="20"
                        className="w-full border-2 border-gray-200 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">%</span>
                    </div>
                  </div>
                </div>
                {originalPrice && discount && (
                  <div className="mt-4 p-4 bg-green-100 rounded-xl text-center">
                    <p className="text-sm text-green-700">Harga Setelah Diskon:</p>
                    <p className="text-2xl font-bold text-green-800">
                      Rp {(Number(originalPrice) - (Number(originalPrice) * Number(discount) / 100)).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Product List */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <span className="ml-3 text-gray-500 text-lg">Memuat produk...</span>
              </div>
            ) : getProductList().length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">📦</div>
                <p className="text-gray-600 text-lg">Belum ada produk</p>
                <p className="text-gray-500">Tambahkan transaksi di Dashboard dulu</p>
                <a
                  href={getDashboardUrl()}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Ke Dashboard
                </a>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {getProductList().map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setSelectedInput(item); nextStep(); }}
                    className={`
                      w-full flex items-center gap-4 p-5 sm:p-6 rounded-2xl border-2 transition-all text-left
                      bg-white border-gray-200 hover:border-orange-400 hover:bg-orange-50 active:scale-98
                    `}
                  >
                    <div className={`w-12 h-12 ${modeConfig[inputType].bgColor} rounded-xl flex items-center justify-center text-white text-xl`}>
                      {idx + 1}
                    </div>
                    <span className="text-lg font-medium text-gray-900">
                      {formatItem(item, discount)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Buat Konten</h2>
              <p className="text-gray-500">AI akan membuatkan gambar dan caption untuk Anda</p>
            </div>

            {/* Selected Product Preview */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 sm:p-8 border-2 border-orange-200">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 ${modeConfig[inputType].bgColor} rounded-2xl flex items-center justify-center`}>
                  <span className="text-2xl text-white">{modeConfig[inputType].label.split(' ')[0]}</span>
                </div>
                <div>
                  <p className="text-sm text-orange-600 font-medium">{modeConfig[inputType].label}</p>
                  <p className="text-xl font-bold text-gray-900">{formatItem(selectedInput, discount)}</p>
                </div>
              </div>
              
              {originalPrice && discount && (
                <div className="bg-white rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 line-through">Rp {Number(originalPrice).toLocaleString('id-ID')}</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rp {(Number(originalPrice) - (Number(originalPrice) * Number(discount) / 100)).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm text-orange-600 font-medium mt-1">Diskon {discount}%</p>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-6 sm:py-8 rounded-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl text-xl sm:text-2xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Membuat Konten...
                </>
              ) : (
                <>
                  <Sparkles className="w-8 h-8" />
                  Buat Konten Sekarang
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-center">
                ⚠️ {error}
              </div>
            )}
          </div>
        );

      case 3:
        return result ? (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-green-100 border-2 border-green-300 rounded-3xl p-6 sm:p-8 text-center">
              <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-green-800">Konten Berhasil Dibuat! 🎉</h2>
              <p className="text-green-700 mt-2 text-lg">Download gambar dan copy caption di bawah</p>
            </div>

            {/* Image Result */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-lg">
              <div className="relative aspect-square sm:aspect-[4/5] bg-gray-100">
                <img
                  src={result.imageUrl}
                  alt="Generated Content"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 py-5 sm:py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xl transition-colors shadow-lg"
                >
                  <Download className="w-7 h-7" />
                  Download Gambar
                </button>
              </div>
            </div>

            {/* Caption Result */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">📝 Caption</h3>
                <button
                  onClick={handleCopyCaption}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-lg transition-all
                    ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                  `}
                >
                  {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Tersalin!' : 'Copy'}
                </button>
              </div>
              <textarea
                readOnly
                value={result.caption}
                className="w-full h-48 sm:h-56 bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-gray-800 text-lg leading-relaxed resize-none focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={resetForm}
                className="flex-1 flex items-center justify-center gap-2 py-5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg transition-colors shadow-lg"
              >
                <Sparkles className="w-6 h-6" />
                Buat Konten Lagi
              </button>
              <a
                href={getDashboardUrl()}
                className="flex-1 flex items-center justify-center gap-2 py-5 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-2xl text-lg transition-colors border-2 border-gray-300"
              >
                <Home className="w-6 h-6" />
                Kembali ke Dashboard
              </a>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Image className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900">Buat Konten</h1>
              <p className="text-sm text-gray-500">Marketing Otomatis</p>
            </div>
          </div>
          <a
            href={getDashboardUrl()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {/* Progress Indicator */}
        {currentStep < 3 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">Langkah {currentStep + 1} dari {steps.length}</span>
              <span className="text-sm font-medium text-orange-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        {renderStepContent()}
      </div>

      {/* Navigation - Fixed Bottom (only show when not on result step) */}
      {currentStep < 3 && (
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
              {steps.slice(0, 3).map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-3 rounded-full transition-all
                    ${index === currentStep ? 'w-8 bg-orange-500' : index < currentStep ? 'w-3 bg-orange-300' : 'w-3 bg-gray-300'}
                  `}
                />
              ))}
            </div>

            <div className="w-24 sm:w-32" /> {/* Spacer for alignment */}
          </div>
        </div>
      )}
    </main>
  );
}
