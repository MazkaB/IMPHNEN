'use client';

const features = [
  {
    title: 'Pencatatan Suara',
    description: 'Catat transaksi tanpa perlu melihat layar. Konfirmasi audio untuk setiap aksi.',
    audience: 'Tunanetra',
  },
  {
    title: 'Tampilan Sederhana',
    description: 'Interface dengan tulisan besar dan navigasi yang jelas. Tidak perlu belajar aplikasi rumit.',
    audience: 'Lansia',
  },
  {
    title: 'Alternatif Teks',
    description: 'Semua fitur audio memiliki tampilan teks lengkap untuk yang kesulitan mendengar.',
    audience: 'Tunarungu',
  },
  {
    title: 'Bahasa Lokal',
    description: 'Mendukung Bahasa Indonesia dan dialek daerah untuk kemudahan komunikasi.',
    audience: 'Semua Pengguna',
  },
];

export function Accessibility() {
  return (
    <section id="aksesibilitas" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-green-800" aria-labelledby="accessibility-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20 items-center">
          <div>
            <h2 id="accessibility-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
              Teknologi untuk semua orang
            </h2>
            <p className="text-base sm:text-lg text-green-100 mb-6 sm:mb-8 leading-relaxed">
              Kami percaya setiap UMKM berhak mendapat akses ke teknologi AI, 
              tanpa memandang kemampuan fisik atau usia. NUSA AI dirancang inklusif 
              agar tidak ada yang tertinggal.
            </p>
            <blockquote className="border-l-4 border-green-400 pl-4 sm:pl-6">
              <p className="italic text-green-100 mb-2 text-sm sm:text-base">
                "Setiap orang berhak mengelola keuangan usahanya dengan mudah, apapun kondisinya."
              </p>
              <cite className="text-green-300 text-xs sm:text-sm not-italic font-medium">— Mazka Buana Hidayat</cite>
            </blockquote>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-6 border border-white/20">
                <span className="inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 bg-green-700 text-green-100 text-[10px] sm:text-xs font-medium rounded-full mb-2 sm:mb-3">
                  {feature.audience}
                </span>
                <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-green-200 text-xs sm:text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
