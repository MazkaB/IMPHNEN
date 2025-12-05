'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section 
      className="relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 lg:pt-40 lg:pb-32 overflow-hidden" 
      aria-labelledby="hero-heading"
      aria-describedby="hero-description"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-white pointer-events-none" />
      <div className="absolute top-20 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-green-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 id="hero-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-4 sm:mb-6">
            Kelola Bisnis dengan
            <span className="block text-green-700">Cukup Bicara</span>
          </h1>

          <p id="hero-description" className="text-base sm:text-lg md:text-xl text-neutral-600 leading-relaxed mb-6 sm:mb-8 max-w-2xl">
            NUSA AI membantu UMKM Indonesia mencatat transaksi, memahami keuangan, 
            dan meningkatkan omzet melalui promosi otomatis. Dirancang untuk semua, 
            termasuk yang memiliki keterbatasan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Link
              href="http://localhost:3001/register"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
            >
              Mulai Sekarang
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="#cara-kerja"
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 bg-white border border-neutral-300 hover:border-neutral-400 text-neutral-700 font-medium rounded-lg transition-colors text-sm sm:text-base"
            >
              Lihat Demo
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-8 gap-y-3 sm:gap-y-4 text-xs sm:text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Gratis untuk UMKM</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Bahasa Indonesia</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Ramah Aksesibilitas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
