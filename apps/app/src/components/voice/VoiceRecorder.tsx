'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Check, X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
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

export function VoiceRecorder({ onTransactionSaved, autoSave = false }: VoiceRecorderProps) {
  const { isAuthenticated } = useAuthStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [parsedTransaction, setParsedTransaction] = useState<ParsedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Silakan login terlebih dahulu');
      return;
    }

    try {
      setError(null);
      setTranscription(null);
      setParsedTransaction(null);
      setConfirmationMessage(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Gagal mengakses mikrofon. Pastikan izin sudah diberikan.');
    }
  }, [isAuthenticated]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = await auth?.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Tidak dapat mengambil token autentikasi');
      }

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('autoSave', autoSave.toString());

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal memproses audio');
      }

      setTranscription(result.data.transcription);
      setParsedTransaction(result.data.parsed);

      if (result.data.autoSaved && result.data.transactionId) {
        setConfirmationMessage(result.data.confirmationMessage);
        onTransactionSaved?.(result.data.transactionId);
      }
    } catch (err) {
      console.error('Audio processing error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memproses audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveTransaction = async () => {
    if (!parsedTransaction) return;

    setIsProcessing(true);
    try {
      const token = await auth?.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Tidak dapat mengambil token autentikasi');
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...parsedTransaction,
          source: 'voice',
          rawInput: transcription,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal menyimpan transaksi');
      }

      setConfirmationMessage('Transaksi berhasil disimpan!');
      onTransactionSaved?.(result.data.id);
    } catch (err) {
      console.error('Save transaction error:', err);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setTranscription(null);
    setParsedTransaction(null);
    setError(null);
    setConfirmationMessage(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center">
          {/* Main Recording Button - Very Large for Elderly */}
          <div className="relative inline-block mb-6">
            {isRecording && (
              <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-50" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`
                relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center
                transition-all duration-200 focus:outline-none focus:ring-4 shadow-xl
                ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 scale-110'
                  : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-300'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={isRecording ? 'Berhenti merekam' : 'Mulai merekam'}
            >
              {isProcessing ? (
                <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              ) : (
                <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
              )}
            </button>
          </div>

          {/* Status Text - Large */}
          <p className="text-lg sm:text-xl font-medium text-gray-700 mb-4">
            {isRecording
              ? '🔴 Sedang merekam... Tekan untuk berhenti'
              : isProcessing
              ? '⏳ Memproses suara Anda...'
              : '🎤 Tekan tombol untuk mulai bicara'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl mb-4 text-base" role="alert">
              ⚠️ {error}
              <button 
                onClick={resetState}
                className="block w-full mt-3 text-center text-red-600 font-medium"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Transcription Result */}
          {transcription && !confirmationMessage && (
            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-xl mb-4 text-left">
              <p className="text-sm text-gray-500 mb-2">Anda bilang:</p>
              <p className="text-lg sm:text-xl font-medium text-gray-900">&quot;{transcription}&quot;</p>
            </div>
          )}

          {/* Parsed Transaction - Large Cards */}
          {parsedTransaction && !confirmationMessage && (
            <div className="space-y-4 mb-4">
              <div className={`p-4 sm:p-6 rounded-xl border-2 ${
                parsedTransaction.type === 'income' 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="text-center mb-4">
                  <span className="text-4xl sm:text-5xl">
                    {parsedTransaction.type === 'income' ? '💰' : '💸'}
                  </span>
                  <p className={`text-lg font-bold mt-2 ${
                    parsedTransaction.type === 'income' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {parsedTransaction.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Rp {parsedTransaction.amount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-lg text-gray-700 mt-2">
                    {parsedTransaction.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Kategori: {parsedTransaction.category}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Large */}
              <div className="flex gap-3">
                <Button
                  onClick={saveTransaction}
                  isLoading={isProcessing}
                  leftIcon={<Check className="w-5 h-5" />}
                  className="flex-1 py-4 text-lg font-bold bg-green-600 hover:bg-green-700"
                >
                  ✓ Simpan
                </Button>
                <Button
                  variant="secondary"
                  onClick={resetState}
                  leftIcon={<X className="w-5 h-5" />}
                  className="py-4 text-lg"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {confirmationMessage && (
            <div className="bg-green-50 border-2 border-green-300 text-green-800 p-6 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <p className="text-xl font-bold mb-2">Berhasil! 🎉</p>
                <p className="text-lg">{confirmationMessage}</p>
                <Button
                  variant="secondary"
                  onClick={resetState}
                  leftIcon={<RotateCcw className="w-5 h-5" />}
                  className="mt-4 py-3 text-lg"
                >
                  Catat Lagi
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
