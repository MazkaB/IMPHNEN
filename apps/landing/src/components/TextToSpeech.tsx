'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSection: string;
}

interface Position {
  x: number;
  y: number;
}

const websiteContent = [
  {
    id: 'intro',
    title: 'Selamat Datang',
    text: 'Selamat datang di NUSA AI. Platform AI inklusif untuk UMKM Indonesia. Website ini ramah untuk tunanetra dan dapat dibacakan secara otomatis. Tekan tombol spasi untuk pause atau lanjutkan. Tekan tombol N untuk ke bagian selanjutnya. Tekan tombol P untuk ke bagian sebelumnya.',
  },
  {
    id: 'hero',
    title: 'Tentang NUSA AI',
    text: 'NUSA AI adalah asisten bisnis inklusif berbasis AI untuk UMKM Indonesia. Cukup bicara, kami yang bantu hitung, kami yang bantu promosi. Platform ini memudahkan pencatatan suara, pengelolaan keuangan, dan otomatisasi promosi. Dirancang untuk semua orang, termasuk yang memiliki keterbatasan penglihatan.',
  },
  {
    id: 'features',
    title: 'Fitur Utama',
    text: 'NUSA AI memiliki 6 fitur utama. Pertama, Pencatatan Suara, ucapkan transaksi Anda dan AI akan mencatat otomatis tanpa perlu mengetik. Kedua, Scan Struk OCR, foto bon atau struk belanja dan AI membaca serta mencatat otomatis. Ketiga, WhatsApp Bot, kirim pesan atau voice note ke WhatsApp untuk mencatat transaksi kapan saja. Keempat, Insight Bisnis, dashboard analitik dengan rekomendasi AI untuk memahami tren penjualan. Kelima, Auto Promosi, generate konten promosi otomatis untuk social media. Keenam, Laporan Otomatis, laporan keuangan lengkap tersedia kapan saja.',
  },
  {
    id: 'how-it-works',
    title: 'Cara Kerja',
    text: 'Cara kerja NUSA AI sangat mudah dalam 4 langkah. Langkah pertama, ucapkan atau foto transaksi Anda. Langkah kedua, AI memproses dan memahami konteks transaksi. Langkah ketiga, transaksi tercatat rapi dengan kategori yang benar. Langkah keempat, pantau laporan dan gunakan fitur promosi untuk tingkatkan omzet.',
  },
  {
    id: 'accessibility',
    title: 'Fitur untuk Semua',
    text: 'NUSA AI dirancang untuk semua orang. Untuk tunanetra, tersedia fitur pencatatan suara tanpa perlu melihat layar dengan konfirmasi audio. Untuk lansia, tampilan sederhana dengan tulisan besar dan navigasi jelas. Untuk tunarungu, semua fitur audio memiliki tampilan teks lengkap. Kami percaya setiap UMKM berhak mendapat akses ke teknologi AI.',
  },
  {
    id: 'cta',
    title: 'Mulai Sekarang',
    text: 'Bergabung dengan UMKM yang sudah menggunakan NUSA AI. Gratis selamanya, tanpa kartu kredit, dan daftar hanya 2 menit. Untuk mendaftar, tekan Tab sampai menemukan tombol Mulai Sekarang, lalu tekan Enter. Atau hubungi kami di nomor 0812 3456 789.',
  },
  {
    id: 'navigation',
    title: 'Navigasi Website',
    text: 'Untuk navigasi website ini, gunakan tombol Tab untuk berpindah antar elemen. Tekan Enter untuk mengaktifkan tombol atau link. Menu utama terdiri dari Solusi, Cara Kerja, dan FAQ. Tombol Masuk untuk login, dan tombol Mulai Gratis untuk mendaftar akun baru.',
  },
];

export function TextToSpeech() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    currentSection: '',
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<{ x: number; y: number; posX: number; posY: number }>({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setSpeechSupported(false);
    }
  }, []);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    setPosition({
      x: dragStartPos.current.posX + deltaX,
      y: dragStartPos.current.posY + deltaY,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const speak = useCallback((text: string, sectionTitle: string) => {
    if (!speechSupported) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setState({ isPlaying: true, isPaused: false, currentSection: sectionTitle });
    };
    
    utterance.onend = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };
    
    utterance.onerror = () => {
      setState({ isPlaying: false, isPaused: false, currentSection: '' });
    };
    
    window.speechSynthesis.speak(utterance);
  }, [speechSupported]);

  const playAll = useCallback(() => {
    if (!speechSupported) return;
    setCurrentIndex(0);
    const allText = websiteContent.map(c => `${c.title}. ${c.text}`).join(' ');
    speak(allText, 'Semua Konten');
  }, [speak, speechSupported]);

  const playSection = useCallback((index: number) => {
    if (!speechSupported || index < 0 || index >= websiteContent.length) return;
    setCurrentIndex(index);
    const content = websiteContent[index];
    speak(`${content.title}. ${content.text}`, content.title);
  }, [speak, speechSupported]);

  const pause = useCallback(() => {
    if (!speechSupported) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState(prev => ({ ...prev, isPaused: true }));
    }
  }, [speechSupported]);

  const resume = useCallback(() => {
    if (!speechSupported) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState(prev => ({ ...prev, isPaused: false }));
    }
  }, [speechSupported]);

  const stop = useCallback(() => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setState({ isPlaying: false, isPaused: false, currentSection: '' });
  }, [speechSupported]);

  const nextSection = useCallback(() => {
    const next = Math.min(currentIndex + 1, websiteContent.length - 1);
    playSection(next);
  }, [currentIndex, playSection]);

  const prevSection = useCallback(() => {
    const prev = Math.max(currentIndex - 1, 0);
    playSection(prev);
  }, [currentIndex, playSection]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (state.isPlaying && !state.isPaused) {
            pause();
          } else if (state.isPaused) {
            resume();
          } else {
            playAll();
          }
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          nextSection();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          prevSection();
          break;
        case 'Escape':
          e.preventDefault();
          stop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, pause, resume, playAll, nextSection, prevSection, stop]);

  if (!mounted || !speechSupported) {
    return null;
  }

  return (
    <>
      <div 
        ref={dragRef}
        className="fixed bottom-6 right-6 z-50 select-none"
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        role="region"
        aria-label="Kontrol Text to Speech - Geser untuk memindahkan"
        onMouseDown={handleMouseDown}
        suppressHydrationWarning
      >
        <div className={`bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'w-80' : 'w-auto'}`}>
          {isExpanded && (
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-neutral-900">Pembaca Layar</h3>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-neutral-100 rounded"
                  aria-label="Tutup panel"
                >
                  <svg className="w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {state.isPlaying && (
                <div className="mb-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-700">Sedang membaca:</p>
                  <p className="text-sm font-medium text-green-800">{state.currentSection}</p>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                {!state.isPlaying ? (
                  <button
                    onClick={playAll}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
                    aria-label="Putar semua konten"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Putar Semua
                  </button>
                ) : (
                  <>
                    <button
                      onClick={state.isPaused ? resume : pause}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
                      aria-label={state.isPaused ? 'Lanjutkan' : 'Jeda'}
                    >
                      {state.isPaused ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                      )}
                      {state.isPaused ? 'Lanjut' : 'Jeda'}
                    </button>
                    <button
                      onClick={stop}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
                      aria-label="Berhenti"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h12v12H6z"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                <p className="text-xs text-neutral-500 mb-2">Pilih bagian:</p>
                {websiteContent.map((content, index) => (
                  <button
                    key={content.id}
                    onClick={() => playSection(index)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentIndex === index && state.isPlaying
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {content.title}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">Pintasan keyboard:</p>
                <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-neutral-600">
                  <span>Spasi: Putar/Jeda</span>
                  <span>N: Selanjutnya</span>
                  <span>P: Sebelumnya</span>
                  <span>Esc: Berhenti</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-3 p-4 w-full hover:bg-neutral-50 transition-colors ${isExpanded ? 'border-t border-neutral-100' : ''}`}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? 'Tutup pembaca layar' : 'Buka pembaca layar'}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${state.isPlaying ? 'bg-green-100' : 'bg-green-700'}`}>
              {state.isPlaying ? (
                <div className="flex items-center gap-0.5">
                  <span className="w-1 h-4 bg-green-600 rounded-full animate-pulse" />
                  <span className="w-1 h-6 bg-green-600 rounded-full animate-pulse delay-75" />
                  <span className="w-1 h-3 bg-green-600 rounded-full animate-pulse delay-150" />
                </div>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </div>
            {!isExpanded && (
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-900">Pembaca Layar</p>
                <p className="text-xs text-neutral-500">Klik untuk membuka</p>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {state.isPlaying && `Sedang membaca ${state.currentSection}`}
      </div>
    </>
  );
}
