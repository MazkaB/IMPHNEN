'use client';

import { useState } from 'react';
import Link from 'next/link';
import { dummyData } from './dummy-data';
import { generateContent } from './actions';
import { Image, ArrowLeft, Download, Copy, Loader2, Sparkles, CheckCircle } from 'lucide-react';

export default function ContentCreatorPage() {
  const [selectedInput, setSelectedInput] = useState<string>('');
  const [inputType, setInputType] = useState<'best_seller' | 'recommendation' | 'expired'>('best_seller');
  const [discount, setDiscount] = useState<number | ''>('');
  const [originalPrice, setOriginalPrice] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ caption: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        link.download = `content-${Date.now()}.png`;
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

  const modeConfig = {
    best_seller: { label: '🏆 Best Seller', color: 'bg-purple-600', border: 'border-purple-500' },
    recommendation: { label: '💡 Rekomendasi', color: 'bg-blue-600', border: 'border-blue-500' },
    expired: { label: '⚠️ Promo/Diskon', color: 'bg-red-600', border: 'border-red-500' },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link 
              href="/content"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Kembali</span>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Content Creator</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Input Form */}
          <div className="w-full lg:w-1/2 space-y-6">
            {/* Step 1: Mode */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center text-sm mr-3">1</span>
                Pilih Mode Konten
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {(['best_seller', 'recommendation', 'expired'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => { setInputType(mode); setDiscount(''); setOriginalPrice(''); }}
                    className={`p-4 rounded-xl border-2 transition-all text-base font-semibold ${
                      inputType === mode
                        ? `${modeConfig[mode].color} ${modeConfig[mode].border} text-white shadow-lg`
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {modeConfig[mode].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Price & Discount (Conditional) */}
            {(inputType === 'expired' || inputType === 'recommendation') && (
              <div className={`rounded-2xl p-6 border-2 ${
                inputType === 'expired' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
              }`}>
                <h2 className={`text-xl font-bold mb-4 flex items-center ${
                  inputType === 'expired' ? 'text-red-700' : 'text-blue-700'
                }`}>
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm mr-3 text-white ${
                    inputType === 'expired' ? 'bg-red-500' : 'bg-blue-500'
                  }`}>2</span>
                  Atur Harga & Diskon
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Harga Asli (Opsional)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={originalPrice}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setOriginalPrice(val === '' ? '' : Number(val));
                        }}
                        placeholder="50000"
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 pl-12 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diskon (%)</label>
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
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
                    </div>
                  </div>

                  {originalPrice && discount && (
                    <div className={`p-4 rounded-xl border-2 ${
                      inputType === 'expired' ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'
                    }`}>
                      <p className="text-sm text-gray-600 mb-1">Harga Akhir:</p>
                      <p className={`text-2xl font-bold ${
                        inputType === 'expired' ? 'text-red-700' : 'text-blue-700'
                      }`}>
                        Rp {(Number(originalPrice) - (Number(originalPrice) * Number(discount) / 100)).toLocaleString('id-ID')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Select Product */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-8 h-8 bg-gray-700 text-white rounded-lg flex items-center justify-center text-sm mr-3">
                  {inputType === 'expired' || inputType === 'recommendation' ? '3' : '2'}
                </span>
                Pilih Produk
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {dummyData[inputType].map((item, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer border-2 transition-all ${
                      selectedInput === item
                        ? 'bg-orange-50 border-orange-500'
                        : 'bg-gray-50 border-transparent hover:bg-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="data-input"
                      value={item}
                      checked={selectedInput === item}
                      onChange={(e) => setSelectedInput(e.target.value)}
                      className="mt-1 w-5 h-5 accent-orange-500"
                    />
                    <span className={`text-base ${selectedInput === item ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {formatItem(item, discount)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedInput || loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-5 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-orange-600/25 text-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Sedang Membuat Konten...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Konten
                </>
              )}
            </button>
          </div>

          {/* RIGHT: Result Preview */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-24 bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-xl min-h-[600px] flex flex-col">
              <div className="bg-gray-50 p-4 border-b-2 border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900">Preview Hasil</h3>
                {result && (
                  <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Selesai
                  </span>
                )}
              </div>

              <div className="flex-1 p-6 flex flex-col gap-6">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-base">
                    ⚠️ {error}
                  </div>
                )}

                {!result && !loading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 space-y-4 border-2 border-dashed border-gray-200 rounded-2xl m-4 p-8">
                    <div className="text-6xl">🎨</div>
                    <p className="text-center text-lg max-w-xs">
                      Pilih produk dan klik Generate untuk melihat hasil di sini
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                    <div className="relative w-24 h-24">
                      <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
                      <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-gray-900 font-semibold text-xl">Sedang Membuat...</p>
                      <p className="text-gray-500">Menulis caption & membuat gambar</p>
                    </div>
                  </div>
                )}

                {result && (
                  <div className="space-y-6 animate-in fade-in">
                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden border-2 border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={result.imageUrl}
                        alt="Generated Content"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                    </div>

                    {/* Caption */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-base font-semibold text-gray-700">Caption:</label>
                        <button
                          onClick={handleCopyCaption}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                            copied 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Tersalin!' : 'Copy'}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={result.caption}
                        className="w-full h-48 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-gray-800 focus:outline-none resize-none text-base leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
