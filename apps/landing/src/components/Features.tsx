'use client';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Pencatatan Suara',
    description: 'Ucapkan transaksi Anda, AI akan mencatat otomatis. Tidak perlu mengetik, cocok untuk yang sibuk atau kesulitan melihat layar.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Scan Struk OCR',
    description: 'Foto bon atau struk belanja, AI membaca dan mencatat otomatis. Digitalisasi arsip tanpa ketik manual.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: 'WhatsApp Bot',
    description: 'Kirim pesan atau voice note ke WhatsApp kapan saja. Catat transaksi dari mana saja, kapan saja.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Insight Bisnis',
    description: 'Dashboard analitik dengan rekomendasi AI. Pahami tren penjualan dan peluang untuk meningkatkan omzet.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    title: 'Auto Promosi',
    description: 'Generate konten promosi otomatis untuk social media. Tingkatkan jangkauan tanpa repot bikin konten.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Laporan Otomatis',
    description: 'Laporan keuangan lengkap tersedia kapan saja. Tahu untung rugi tanpa hitung manual.',
  },
];

export function Features() {
  return (
    <section id="solusi" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white" aria-labelledby="features-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8 sm:mb-12 md:mb-16">
          <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
            Semua yang UMKM butuhkan dalam satu platform
          </h2>
          <p className="text-base sm:text-lg text-neutral-600">
            Dirancang khusus untuk kemudahan pelaku usaha Indonesia, termasuk yang tidak terbiasa dengan teknologi.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <article key={index} className="group p-4 sm:p-6 rounded-xl border border-neutral-200 hover:border-green-200 hover:bg-green-50/30 transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
