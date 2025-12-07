'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateContent } from './actions';
import { Image, Download, Copy, Loader2, Sparkles, CheckCircle, Home, ArrowLeft, Plus, Package, Trash2 } from 'lucide-react';
import { getDashboardUrl } from '@/lib/urls';

interface SavedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: number;
}

function ContentCreatorContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [step, setStep] = useState<'select' | 'input' | 'generate' | 'result'>('select');
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ caption: string; imageUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedProducts, setSavedProducts] = useState<SavedProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';

  // Load saved products from Firestore via API
  useEffect(() => {
    if (!userId) {
      setLoadingProducts(false);
      return;
    }
    
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products?userId=${userId}`);
        const data = await res.json();
        if (data.success && data.products) {
          setSavedProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchProducts();
  }, [userId, API_URL]);

  // Save product to Firestore via API
  const saveProduct = async () => {
    if (!productName || !productPrice || !userId) return;
    
    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: productName,
          description: productDesc,
          price: parseInt(productPrice),
        }),
      });
      
      const data = await res.json();
      if (data.success) {
        // Refresh products list
        const refreshRes = await fetch(`${API_URL}/api/products?userId=${userId}`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setSavedProducts(refreshData.products);
        }
      }
    } catch (err) {
      console.error('Failed to save product:', err);
    }
  };

  // Delete product from Firestore via API
  const deleteProduct = async (id: string) => {
    if (!userId) return;
    
    try {
      await fetch(`${API_URL}/api/products?id=${id}&userId=${userId}`, {
        method: 'DELETE',
      });
      setSavedProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Select saved product
  const selectProduct = (product: SavedProduct) => {
    setProductName(product.name);
    setProductDesc(product.description);
    setProductPrice(product.price.toString());
    setStep('generate');
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num ? parseInt(num).toLocaleString('id-ID') : '';
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setProductPrice(raw);
  };

  const canProceed = productName.trim().length > 0 && productPrice.length > 0;

  const handleGenerate = async () => {
    if (!canProceed) return;
    setLoading(true); setResult(null); setError(null);
    
    const price = parseInt(productPrice);
    const productInfo = productDesc 
      ? `${productName} - ${productDesc} - Harga Rp ${price.toLocaleString('id-ID')}`
      : `${productName} - Harga Rp ${price.toLocaleString('id-ID')}`;
    
    try {
      const res = await generateContent('best_seller', productInfo, price, '');
      if (res.success && res.caption && res.imageUrl) {
        setResult({ caption: res.caption, imageUrl: res.imageUrl });
        setStep('result');
      } else setError(res.error || 'Gagal generate content. Silakan coba lagi.');
    } catch { setError('Terjadi kesalahan sistem.'); }
    finally { setLoading(false); }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = result.imageUrl;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) { 
        ctx.drawImage(image, 0, 0); 
        const link = document.createElement('a'); 
        link.href = canvas.toDataURL('image/png'); 
        link.download = `konten-${productName}-${Date.now()}.png`; 
        link.click(); 
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
    setProductName('');
    setProductDesc('');
    setProductPrice('');
    setResult(null); 
    setError(null); 
    setStep('select'); 
  };

  // Save product when proceeding to generate
  const handleProceedToGenerate = async () => {
    await saveProduct();
    setStep('generate');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Image className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Buat Konten</h1>
                <p className="text-sm text-gray-500 truncate">Marketing Otomatis</p>
              </div>
            </div>
            <a href={getDashboardUrl()} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium flex-shrink-0">
              <Home className="w-5 h-5" /><span className="hidden sm:inline">Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {step !== 'result' && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                Langkah {step === 'select' ? 1 : step === 'input' ? 2 : 3} dari 3
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-900 rounded-full transition-all" style={{ 
                width: step === 'select' ? '33%' : step === 'input' ? '66%' : '100%' 
              }} />
            </div>
          </div>
        )}

        {/* Step 1: Select or Add Product */}
        {step === 'select' && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Produk</h2>
              <p className="text-gray-500">Pilih produk tersimpan atau tambah baru</p>
            </div>

            {/* Add New Product Button */}
            <button
              onClick={() => setStep('input')}
              className="w-full p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center justify-center gap-3 font-bold"
            >
              <Plus className="w-5 h-5" /> Tambah Produk Baru
            </button>

            {/* Saved Products List */}
            {loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Memuat produk...</span>
              </div>
            ) : savedProducts.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500">Produk Tersimpan</p>
                {savedProducts.map((product) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => selectProduct(product)}
                        className="flex-1 text-left flex items-center gap-3 min-w-0"
                      >
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 sm:w-6 h-5 sm:h-6 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{product.name}</p>
                          <p className="text-gray-500 text-xs sm:text-sm truncate">{product.description || `Rp ${product.price.toLocaleString('id-ID')}`}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base hidden sm:block">Rp {product.price.toLocaleString('id-ID')}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteProduct(product.id); }}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white border border-gray-200 rounded-xl">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada produk tersimpan</p>
                <p className="text-gray-400 text-sm">Klik tombol di atas untuk menambah produk</p>
              </div>
            )}
          </section>
        )}

        {/* Step 2: Input Product */}
        {step === 'input' && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Detail Produk</h2>
              <p className="text-gray-500">Masukkan informasi produk yang ingin dipromosikan</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Contoh: Bakso Urat Spesial"
                  className="w-full border border-gray-200 rounded-xl p-4 text-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              {/* Product Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi <span className="text-gray-400">(Opsional)</span>
                </label>
                <textarea
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                  placeholder="Contoh: Bakso jumbo dengan urat sapi pilihan, kuah kaldu gurih"
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              </div>

              {/* Product Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(productPrice)}
                    onChange={handlePriceChange}
                    placeholder="15.000"
                    className="w-full border border-gray-200 rounded-xl p-4 pl-12 text-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Preview Card */}
            {canProceed && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Preview</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{productName}</p>
                    {productDesc && <p className="text-gray-500 text-sm">{productDesc}</p>}
                  </div>
                  <p className="text-xl font-bold text-gray-900">Rp {formatCurrency(productPrice)}</p>
                </div>
              </div>
            )}

            <button 
              onClick={handleProceedToGenerate} 
              disabled={!canProceed}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Plus className="w-5 h-5" /> Simpan & Lanjut
            </button>

            <button 
              onClick={() => setStep('select')} 
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Kembali
            </button>
          </section>
        )}

        {/* Step 2: Generate */}
        {step === 'generate' && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Konten</h2>
              <p className="text-gray-500">AI akan membuatkan gambar dan caption</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 mb-1">Produk</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{productName}</p>
                  {productDesc && <p className="text-sm text-gray-500 mt-1 truncate">{productDesc}</p>}
                </div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 flex-shrink-0">Rp {formatCurrency(productPrice)}</p>
              </div>
            </div>
            
            <button onClick={handleGenerate} disabled={loading}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Membuat Konten...</> : <><Sparkles className="w-6 h-6" /> Buat Konten Sekarang</>}
            </button>
            
            <button onClick={() => setStep('select')} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Pilih Produk Lain
            </button>
            
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-center">{error}</div>}
          </section>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <section className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800">Konten Berhasil Dibuat</h2>
              <p className="text-green-700 mt-2">Download gambar dan copy caption di bawah</p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img src={result.imageUrl} alt="Generated Content" className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <button onClick={handleDownload} className="w-full flex items-center justify-center gap-3 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl">
                  <Download className="w-6 h-6" /> Download Gambar
                </button>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Caption</h3>
                <button onClick={handleCopyCaption} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Tersalin' : 'Copy'}
                </button>
              </div>
              <textarea readOnly value={result.caption} className="w-full h-40 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 resize-none" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button onClick={resetForm} className="flex-1 py-3.5 sm:py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" /> Buat Lagi
              </button>
              <a href={getDashboardUrl()} className="flex-1 py-3.5 sm:py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-center hover:bg-gray-50 flex items-center justify-center gap-2">
                <Home className="w-5 h-5" /> Dashboard
              </a>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default function ContentCreatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    }>
      <ContentCreatorContent />
    </Suspense>
  );
}
