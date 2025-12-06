'use client';

import Link from 'next/link';
import { Check, ArrowLeft } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    price: 'Rp 49.000',
    period: '/bulan',
    description: 'Untuk UMKM yang baru memulai',
    features: [
      'Input transaksi via suara',
      'Hingga 100 transaksi/bulan',
      'Laporan keuangan dasar',
      'Export PDF',
    ],
    cta: 'Pilih Basic',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'Rp 99.000',
    period: '/bulan',
    description: 'Untuk UMKM yang berkembang',
    features: [
      'Semua fitur Basic',
      'Transaksi unlimited',
      'OCR struk & nota',
      'Integrasi WhatsApp',
      'Laporan insight AI',
      'Export Excel & PDF',
      'Prioritas support',
    ],
    cta: 'Pilih Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Untuk bisnis dengan kebutuhan khusus',
    features: [
      'Semua fitur Pro',
      'Multi-user & role',
      'API access',
      'Custom integration',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Hubungi Kami',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          href="/activate"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Pilih Paket yang Tepat
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Mulai kelola keuangan bisnis Anda dengan lebih mudah. 
            Pilih paket yang sesuai dengan kebutuhan UMKM Anda.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 relative ${
                plan.popular ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Paling Populer
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-neutral-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-neutral-900">
                    {plan.price}
                  </span>
                  <span className="text-neutral-500">{plan.period}</span>
                </div>
                <p className="text-sm text-neutral-600 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-700 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-2 border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Promo Code Info */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl p-6 max-w-md mx-auto shadow-md">
            <h3 className="font-semibold text-neutral-900 mb-2">Punya Kode Promo?</h3>
            <p className="text-sm text-neutral-600 mb-4">
              Masukkan kode promo Anda untuk mendapatkan akses gratis
            </p>
            <Link
              href="/activate"
              className="inline-block px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Gunakan Kode Promo
            </Link>
          </div>
        </div>

        {/* Contact */}
        <p className="text-center text-sm text-neutral-500 mt-8">
          Ada pertanyaan? Hubungi kami di{' '}
          <a href="mailto:support@nusa.ai" className="text-green-600 hover:text-green-700">
            support@nusa.ai
          </a>
        </p>
      </div>
    </div>
  );
}
