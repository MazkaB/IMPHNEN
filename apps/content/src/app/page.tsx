'use client';

import Link from 'next/link';
import { Image, Instagram, MessageCircle, Video, ArrowRight, Sparkles, Home } from 'lucide-react';
import { getDashboardUrl } from '@/lib/urls';
import { AuthGuard } from '@/components/providers/AuthProvider';

function ContentHomePageContent() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Image className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-xl text-gray-900">Auto Content Creator</span>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Pembukuan AI</p>
            </div>
          </Link>
          <Link 
            href={getDashboardUrl()}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base hidden sm:inline">Dashboard</span>
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-100 rounded-full mb-4 sm:mb-6">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-1.5 sm:mr-2" />
            <span className="text-sm sm:text-lg font-semibold text-orange-700">Powered by AI</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Buat Konten Marketing
            <br />
            <span className="text-orange-600">Dalam Hitungan Detik</span>
          </h1>
          
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-10">
            Generate poster produk dan caption marketing otomatis untuk 
            Instagram, WhatsApp, dan TikTok. Tidak perlu skill desain!
          </p>

          <Link
            href="/content-creator"
            className="inline-flex items-center justify-center bg-orange-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl text-base sm:text-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-600/25"
          >
            Mulai Buat Konten
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
          </Link>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 mb-10 sm:mb-16">
          <article className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Instagram className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Instagram</h3>
            <p className="text-sm sm:text-lg text-gray-600">
              Poster produk estetik dan caption menarik untuk feed & story
            </p>
          </article>

          <article className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <MessageCircle className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">WhatsApp</h3>
            <p className="text-sm sm:text-lg text-gray-600">
              Broadcast message dan status promosi yang engaging
            </p>
          </article>

          <article className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 text-center border-2 border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all">
            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Video className="w-7 h-7 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">TikTok</h3>
            <p className="text-sm sm:text-lg text-gray-600">
              Script video dan hashtag viral untuk konten TikTok
            </p>
          </article>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 border-2 border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Fitur Unggulan
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-orange-50 rounded-xl sm:rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🎨</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Poster Generator</h3>
                <p className="text-gray-600 text-sm sm:text-base">Generate poster produk profesional dengan AI dalam hitungan detik</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-blue-50 rounded-xl sm:rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">✍️</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Caption Writer</h3>
                <p className="text-gray-600 text-sm sm:text-base">Caption marketing persuasif dengan emoji dan hashtag relevan</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-purple-50 rounded-xl sm:rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">🏷️</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Promo & Diskon</h3>
                <p className="text-gray-600 text-sm sm:text-base">Buat konten promo dengan harga coret dan diskon otomatis</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6 bg-green-50 rounded-xl sm:rounded-2xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl">📥</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Download Langsung</h3>
                <p className="text-gray-600 text-sm sm:text-base">Download gambar dan copy caption langsung ke clipboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 sm:mt-16 text-center">
          <Link
            href="/content-creator"
            className="inline-flex items-center justify-center bg-orange-600 text-white font-semibold py-4 sm:py-5 px-8 sm:px-10 rounded-xl text-base sm:text-xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/25"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Coba Sekarang - Gratis!
          </Link>
          <p className="mt-3 sm:mt-4 text-gray-500 text-sm sm:text-base">
            Dikerjakan oleh: <strong>Agung</strong>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-6 sm:py-8 px-4 sm:px-6 mt-10 sm:mt-16">
        <div className="max-w-6xl mx-auto text-center text-sm sm:text-base">
          <p>© 2025 Pembukuan AI - Auto Content Creator</p>
        </div>
      </footer>
    </main>
  );
}

export default function ContentHomePage() {
  return (
    <AuthGuard>
      <ContentHomePageContent />
    </AuthGuard>
  );
}
