'use client';

const steps = [
  {
    number: '1',
    title: 'Ucapkan atau Foto',
    description: 'Bicara ke aplikasi atau foto struk belanja. Tidak perlu mengetik apapun.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'AI Memproses',
    description: 'Teknologi AI memahami konteks dan mengkategorikan transaksi secara otomatis.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'Tercatat Rapi',
    description: 'Semua transaksi tersimpan dengan kategori yang benar dan mudah ditelusuri.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '4',
    title: 'Pantau & Kembangkan',
    description: 'Lihat laporan, dapatkan insight, dan gunakan fitur promosi untuk tingkatkan omzet.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
            Empat langkah sederhana
          </h2>
          <p className="text-base sm:text-lg text-neutral-600">
            Mulai kelola keuangan usaha dalam hitungan menit, tanpa perlu belajar aplikasi rumit.
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200" />
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 mb-3 sm:mb-6">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white border-2 border-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-green-600 shadow-lg shadow-green-100">
                    <div className="scale-75 sm:scale-100">{step.icon}</div>
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                    {step.number}
                  </div>
                </div>
                <h3 className="text-sm sm:text-lg font-semibold text-neutral-900 mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 sm:mt-16 md:mt-20">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-2xl">
            <div className="grid lg:grid-cols-7 gap-4 sm:gap-6 items-center">
              <div className="lg:col-span-3 bg-white/10 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Anda Bicara</p>
                    <p className="text-neutral-400 text-xs">Voice Input</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/10">
                  <p className="text-white text-sm sm:text-lg italic">"Jual nasi goreng 20 porsi, harga 15 ribu"</p>
                </div>
                <div className="flex items-center gap-2 mt-3 sm:mt-4">
                  <div className="flex gap-1">
                    <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
                    <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse delay-75" />
                    <span className="w-1 h-4 bg-blue-400 rounded-full animate-pulse delay-150" />
                    <span className="w-1 h-6 bg-blue-400 rounded-full animate-pulse delay-100" />
                    <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse delay-200" />
                  </div>
                  <span className="text-neutral-400 text-sm">Merekam...</span>
                </div>
              </div>

              <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
                <div className="flex flex-row lg:flex-col items-center gap-2">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                    <svg className="w-5 h-5 sm:w-7 sm:h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-neutral-400 text-xs font-medium">AI</span>
                </div>
              </div>

              <div className="lg:col-span-3 bg-green-500/20 backdrop-blur rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-green-500/30">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">Tercatat Otomatis</p>
                    <p className="text-green-300 text-xs">Transaksi Berhasil</p>
                  </div>
                </div>
                <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Produk</span>
                    <span className="text-white font-medium">Nasi Goreng</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Jumlah</span>
                    <span className="text-white font-medium">20 porsi</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-300">Harga Satuan</span>
                    <span className="text-white font-medium">Rp15.000</span>
                  </div>
                  <div className="border-t border-white/20 pt-2 sm:pt-3 mt-2 sm:mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-300 font-medium text-sm sm:text-base">Total Penjualan</span>
                      <span className="text-lg sm:text-2xl font-bold text-green-400">+Rp300.000</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
