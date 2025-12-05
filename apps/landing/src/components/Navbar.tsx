'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getLoginUrl, getRegisterUrl } from '@/lib/urls';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8" aria-label="Navigasi utama">
        <div className="flex justify-between items-center h-20">
          <Link href="/" aria-label="NUSA AI - Halaman Utama">
            <img src="/logo.png" alt="NUSA AI" className="w-25 h-14 md:w-30 md:h-20 rounded-lg object-cover" />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#solusi" className="text-sm font-medium text-neutral-600 hover:text-green-700 transition-colors">
              Solusi
            </a>
            <a href="#cara-kerja" className="text-sm font-medium text-neutral-600 hover:text-green-700 transition-colors">
              Cara Kerja
            </a>
            <a href="#harga" className="text-sm font-medium text-neutral-600 hover:text-green-700 transition-colors">
              Harga
            </a>
            <a href="#faq" className="text-sm font-medium text-neutral-600 hover:text-green-700 transition-colors">
              FAQ
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link
              href={getLoginUrl()}
              className="text-sm font-medium text-neutral-700 hover:text-green-700 transition-colors px-4 py-2"
            >
              Masuk
            </Link>
            <Link
              href={getRegisterUrl()}
              className="text-sm font-medium text-white bg-green-700 hover:bg-green-800 px-5 py-2.5 rounded-lg transition-colors"
            >
              Mulai Gratis
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200 bg-white">
            <div className="flex flex-col gap-2">
              <a href="#solusi" onClick={() => setIsOpen(false)} className="px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg">Solusi</a>
              <a href="#cara-kerja" onClick={() => setIsOpen(false)} className="px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg">Cara Kerja</a>
              <a href="#harga" onClick={() => setIsOpen(false)} className="px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg">Harga</a>
              <a href="#faq" onClick={() => setIsOpen(false)} className="px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg">FAQ</a>
              <hr className="my-2 border-neutral-200" />
              <Link href={getLoginUrl()} className="px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-lg">Masuk</Link>
              <Link href={getRegisterUrl()} className="mx-4 py-3 text-center text-white bg-green-700 rounded-lg">Mulai Gratis</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
