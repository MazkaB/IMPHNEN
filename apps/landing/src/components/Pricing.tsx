'use client';

import { useState } from 'react';
import { Check, Sparkles, X } from 'lucide-react';

const PROMO_CODE = 'TUMBUHBERSAMA25';
const WHATSAPP_NUMBER = '6281325956349';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
  badge?: string;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Cocok untuk UMKM yang baru memulai',
    price: 49000,
    period: '/bulan',
    features: [
      'Pencatatan suara hingga 100 transaksi/bulan',
      'Scan struk OCR 50 dokumen/bulan',
      'Laporan keuangan dasar',
      'Akses dashboard',
      'Support via WhatsApp',
    ],
    notIncluded: [
      'WhatsApp Bot',
      'Insight AI',
      'Auto Konten',
      'Laporan lanjutan',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Untuk UMKM yang ingin berkembang',
    price: 99000,
    originalPrice: 149000,
    period: '/bulan',
    popular: true,
    badge: 'Paling Populer',
    features: [
      'Pencatatan suara unlimited',
      'Scan struk OCR unlimited',
      'WhatsApp Bot untuk pencatatan',
      'Insight AI & rekomendasi bisnis',
      'Laporan keuangan lengkap',
      'Export PDF & Excel',
      'Support prioritas',
    ],
    notIncluded: [
      'Auto Konten',
      'Multi-user',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solusi lengkap untuk bisnis besar',
    price: 199000,
    originalPrice: 299000,
    period: '/bulan',
    badge: 'Best Value',
    features: [
      'Semua fitur Business',
      'Auto Konten untuk promosi',
      'Multi-user (hingga 5 akun)',
      'API access',
      'Dedicated account manager',
      'Training & onboarding',
      'Custom report',
      'SLA 99.9% uptime',
    ],
  },
];

export function Pricing() {
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoError('Kode promo tidak valid');
      setPromoApplied(false);
    }
  };

  const getPrice = (plan: Plan) => {
    if (promoApplied && plan.id === 'starter') {
      return 0;
    }
    return plan.price;
  };

  const generateWhatsAppLink = (plan: Plan) => {
    const price = getPrice(plan);
    const promoText = promoApplied && plan.id === 'starter' 
      ? `\n\nSaya menggunakan kode promo: ${PROMO_CODE}` 
      : '';
    
    const message = encodeURIComponent(
      `Halo NUSA AI!\n\nSaya tertarik dengan paket *${plan.name}*\n` +
      `Harga: Rp ${price.toLocaleString('id-ID')}${plan.period}\n\n` +
      `Fitur yang saya dapatkan:\n${plan.features.map(f => `- ${f}`).join('\n')}` +
      `${promoText}\n\nMohon informasi lebih lanjut untuk proses berlangganan. Terima kasih!`
    );
    
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  };

  return (
    <section id="harga" className="py-12 sm:py-16 md:py-20 lg:py-28 bg-neutral-50" aria-labelledby="pricing-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 id="pricing-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4">
            Pilih Paket yang Sesuai
          </h2>
          <p className="text-base sm:text-lg text-neutral-600">
            Harga terjangkau untuk semua skala UMKM. Mulai dari yang gratis hingga fitur lengkap.
          </p>
        </div>

        {/* Promo Code Input */}
        <div className="max-w-md mx-auto mb-8 sm:mb-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-neutral-900 text-sm sm:text-base">Punya Kode Promo?</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  setPromoError('');
                }}
                placeholder="Masukkan kode promo"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm sm:text-base"
              />
              <button
                onClick={handleApplyPromo}
                className="px-4 sm:px-6 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
              >
                Terapkan
              </button>
            </div>
            {promoApplied && (
              <p className="mt-2 text-green-600 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" />
                Kode promo berhasil diterapkan! Paket Starter menjadi GRATIS.
              </p>
            )}
            {promoError && (
              <p className="mt-2 text-red-600 text-sm">{promoError}</p>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan) => {
            const currentPrice = getPrice(plan);
            const isDiscounted = promoApplied && plan.id === 'starter';
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 border-2 transition-all ${
                  plan.popular
                    ? 'border-green-500 shadow-xl shadow-green-500/10 scale-[1.02]'
                    : 'border-neutral-200 hover:border-green-300 hover:shadow-lg'
                }`}
              >
                {/* Badge */}
                {(plan.badge || isDiscounted) && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                    isDiscounted 
                      ? 'bg-amber-500 text-white' 
                      : plan.popular 
                        ? 'bg-green-600 text-white' 
                        : 'bg-neutral-800 text-white'
                  }`}>
                    {isDiscounted ? '🎉 GRATIS!' : plan.badge}
                  </div>
                )}

                {/* Plan Info */}
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">{plan.name}</h3>
                  <p className="text-neutral-500 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  {(plan.originalPrice || isDiscounted) && (
                    <p className="text-neutral-400 line-through text-sm sm:text-base">
                      Rp {(isDiscounted ? plan.price : plan.originalPrice)?.toLocaleString('id-ID')}
                    </p>
                  )}
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-neutral-900">
                      {currentPrice === 0 ? 'Gratis' : `Rp ${currentPrice.toLocaleString('id-ID')}`}
                    </span>
                    {currentPrice > 0 && (
                      <span className="text-neutral-500 text-sm sm:text-base">{plan.period}</span>
                    )}
                  </div>
                  {isDiscounted && (
                    <p className="text-amber-600 text-xs sm:text-sm mt-1 font-medium">
                      Dengan kode: {PROMO_CODE}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 sm:space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-700 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded?.map((feature, idx) => (
                    <li key={`not-${idx}`} className="flex items-start gap-2 sm:gap-3 opacity-50">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="text-neutral-500 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <a
                  href={generateWhatsAppLink(plan)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    plan.popular
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                  }`}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Pilih {plan.name}
                </a>
              </div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-neutral-500 text-sm sm:text-base">
            Semua paket termasuk <span className="font-medium text-neutral-700">garansi 7 hari uang kembali</span>
          </p>
          <p className="text-neutral-400 text-xs sm:text-sm mt-2">
            Pembayaran melalui transfer bank atau e-wallet
          </p>
        </div>
      </div>
    </section>
  );
}
