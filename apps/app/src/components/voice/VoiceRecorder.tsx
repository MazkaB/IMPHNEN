'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Loader2, Check, X, RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { auth } from '@/lib/firebase/config';

interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  confidence: number;
}

interface VoiceRecorderProps {
  onTransactionSaved?: (transactionId: string) => void;
  autoSave?: boolean;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}


export function VoiceRecorder({ onTransactionSaved, autoSave = false }: VoiceRecorderProps) {
  const { isAuthenticated } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) setSpeechSupported(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!isAuthenticated) { setError('Silakan login terlebih dahulu'); return; }
    if (!speechSupported) { setError('Browser tidak mendukung pengenalan suara. Gunakan Chrome atau Edge.'); return; }

    try {
      setError(null); setTranscription(null); setInterimTranscript('');
      setParsedTransaction(null); setConfirmationMessage(null);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = '', final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) final += result[0].transcript;
          else interim += result[0].transcript;
        }
        if (final) setTranscription(prev => (prev || '') + final);
        setInterimTranscript(interim);
      };

      recognition.onerror = (event) => {
        if (event.error === 'no-speech') setError('Tidak ada suara terdeteksi.');
        else if (event.error === 'audio-capture') setError('Mikrofon tidak ditemukan.');
        else if (event.error === 'not-allowed') setError('Izin mikrofon ditolak.');
        else setError('Gagal mengenali suara.');
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcription || interimTranscript) {
          const finalText = (transcription || '') + interimTranscript;
          if (finalText.trim()) processTranscription(finalText.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } catch { setError('Gagal memulai pengenalan suara.'); }
  }, [isAuthenticated, speechSupported, transcription, interimTranscript]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      const finalText = (transcription || '') + interimTranscript;
      if (finalText.trim()) processTranscription(finalText.trim());
      else setError('Tidak ada suara terdeteksi.');
    }
  }, [isRecording, transcription, interimTranscript]);


  const processTranscription = async (text: string) => {
    setIsProcessing(true); setError(null); setTranscription(text); setInterimTranscript('');
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Tidak dapat mengambil token autentikasi');

      const response = await fetch('/api/voice/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transcription: text, autoSave }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Gagal memproses teks');

      setParsedTransaction(result.data.parsed);
      if (result.data.autoSaved && result.data.transactionId) {
        setConfirmationMessage(result.data.confirmationMessage);
        onTransactionSaved?.(result.data.transactionId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses teks');
    } finally { setIsProcessing(false); }
  };

  const saveTransaction = async () => {
    if (!parsedTransaction) return;
    setIsProcessing(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) throw new Error('Tidak dapat mengambil token autentikasi');

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...parsedTransaction, source: 'voice', rawInput: transcription }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Gagal menyimpan transaksi');

      setConfirmationMessage('Transaksi berhasil disimpan');
      onTransactionSaved?.(result.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    } finally { setIsProcessing(false); }
  };

  const resetState = () => {
    setTranscription(null); setInterimTranscript(''); setParsedTransaction(null);
    setError(null); setConfirmationMessage(null);
  };


  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="text-center">
        {/* Main Recording Button */}
        <div className="relative inline-block mb-6">
          {isRecording && (
            <div className="absolute inset-0 bg-gray-900 rounded-full animate-ping opacity-30" />
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing || !speechSupported}
            className={`
              relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center
              transition-all duration-200 focus:outline-none focus:ring-4 shadow-lg
              ${isRecording ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200' : 'bg-gray-900 hover:bg-gray-800 focus:ring-gray-300'}
              ${isProcessing || !speechSupported ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            aria-label={isRecording ? 'Berhenti merekam' : 'Mulai merekam'}
          >
            {isProcessing ? (
              <Loader2 className="w-14 h-14 text-white animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-14 h-14 text-white" />
            ) : (
              <Mic className="w-14 h-14 text-white" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <p className="text-lg font-medium text-gray-700 mb-4">
          {!speechSupported ? 'Browser tidak mendukung' : isRecording ? 'Mendengarkan... Tekan untuk berhenti'
            : isProcessing ? 'Memproses suara...' : 'Tekan tombol untuk bicara'}
        </p>

        {/* Live Transcription */}
        {(isRecording || interimTranscript) && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4">
            <p className="text-sm text-gray-500 mb-1">Mendengarkan...</p>
            <p className="text-lg text-gray-800">
              {transcription}<span className="text-gray-400">{interimTranscript}</span>
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4">
            <p className="font-medium">{error}</p>
            <button onClick={resetState} className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg font-medium">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Transcription Result */}
        {transcription && !isRecording && !confirmationMessage && !error && (
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-4 text-left">
            <p className="text-sm text-gray-500 mb-1">Anda bilang:</p>
            <p className="text-lg font-medium text-gray-900">&quot;{transcription}&quot;</p>
          </div>
        )}

        {/* Parsed Transaction */}
        {parsedTransaction && !confirmationMessage && (
          <div className="space-y-4 mb-4">
            <div className={`p-6 rounded-xl border ${parsedTransaction.type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-lg font-bold mb-2 ${parsedTransaction.type === 'income' ? 'text-green-700' : 'text-red-700'}`}>
                {parsedTransaction.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
              </p>
              <p className="text-3xl font-bold text-gray-900">Rp {parsedTransaction.amount.toLocaleString('id-ID')}</p>
              <p className="text-gray-700 mt-2">{parsedTransaction.description}</p>
              <p className="text-gray-500 text-sm">Kategori: {parsedTransaction.category}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={saveTransaction} disabled={isProcessing}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl disabled:opacity-50">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Simpan
              </button>
              <button onClick={resetState} className="py-4 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Confirmation */}
        {confirmationMessage && (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-white" />
            </div>
            <p className="text-xl font-bold text-green-800 mb-2">Berhasil</p>
            <p className="text-green-700">{confirmationMessage}</p>
            <button onClick={resetState} className="mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl mx-auto">
              <RotateCcw className="w-5 h-5" /> Catat Lagi
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
