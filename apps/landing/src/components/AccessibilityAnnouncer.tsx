'use client';

import { useEffect, useState } from 'react';

export function AccessibilityAnnouncer() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const playWelcome = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    setHasInteracted(true);
    
    const welcomeText = `Selamat datang di NUSA AI. Platform AI inklusif untuk UMKM Indonesia. 
    Website ini dilengkapi fitur pembaca layar untuk tunanetra. 
    Tekan tombol Tab untuk navigasi. 
    Atau klik tombol Pembaca Layar di pojok kanan bawah untuk mendengarkan penjelasan lengkap website ini.
    Tekan tombol Spasi kapan saja untuk memulai atau menjeda pembacaan.`;
    
    const utterance = new SpeechSynthesisUtterance(welcomeText);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const dismiss = () => {
    setShowWelcome(false);
    setHasInteracted(true);
  };

  if (!showWelcome || hasInteracted) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </div>
          <h2 id="welcome-title" className="text-2xl font-bold text-neutral-900 mb-2">
            Selamat Datang di NUSA AI
          </h2>
          <p className="text-neutral-600">
            Website ini dilengkapi fitur aksesibilitas untuk tunanetra
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Pembaca Layar</p>
              <p className="text-sm text-neutral-600">Dengarkan penjelasan website secara otomatis</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Navigasi Keyboard</p>
              <p className="text-sm text-neutral-600">Tab untuk navigasi, Spasi untuk putar/jeda</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">Kontras Tinggi</p>
              <p className="text-sm text-neutral-600">Desain dengan kontras yang jelas</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={playWelcome}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-green-700 hover:bg-green-800 text-white font-medium rounded-xl transition-colors text-lg"
            autoFocus
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Dengarkan Penjelasan
          </button>
          <button
            onClick={dismiss}
            className="w-full px-6 py-3 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            Lewati, Lanjutkan ke Website
          </button>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-4">
          Tekan Escape untuk menutup dialog ini
        </p>
      </div>
    </div>
  );
}
