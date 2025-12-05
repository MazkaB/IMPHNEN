'use client';

export function DemoSection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-xl border border-neutral-200 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
          <div className="absolute -top-3 left-4 sm:left-6 px-2 sm:px-3 py-1 bg-green-700 text-white text-[10px] sm:text-xs font-medium rounded-full">
            Demo Pencatatan Suara
          </div>
          
          <div className="space-y-3 sm:space-y-4 mt-2">
            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 bg-neutral-50 rounded-lg sm:rounded-xl rounded-tl-none p-3 sm:p-4">
                <p className="text-neutral-700 text-sm sm:text-base">"Jual kerupuk 10 bungkus, harga lima ribu"</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg sm:rounded-xl rounded-tl-none p-3 sm:p-4 border border-green-100">
                <p className="text-xs sm:text-sm text-green-800 font-medium mb-1 sm:mb-2">Tercatat</p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                  <div>
                    <p className="text-neutral-900 font-semibold text-sm sm:text-base">Kerupuk 10 bungkus</p>
                    <p className="text-xs sm:text-sm text-neutral-500">Penjualan Produk</p>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-green-700">+Rp50.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
