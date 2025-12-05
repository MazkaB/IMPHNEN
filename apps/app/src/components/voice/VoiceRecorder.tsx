'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2, Check, X } from 'lucide-react';
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
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="px-3 sm:px-6">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Catat dengan Suara</h2>
          
          {/* Recording Button */}
          <div className="relative inline-block mb-4 sm:mb-6">
            {isRecording && (
              <div className="absolute inset-0 bg-red-500 rounded-full recording-pulse" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`
                relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center
                transition-all duration-200 focus:outline-none focus:ring-4
                ${isRecording
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300'
                  : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-300'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={isRecording ? 'Berhenti merekam' : 'Mulai merekam'}
            >
              {isProcessing ? (
                <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              )}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            {isRecording
              ? 'Sedang merekam... Tekan untuk berhenti'
              : isProcessing
              ? 'Memproses audio...'
              : 'Tekan untuk mulai merekam'}
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4" role="alert">
              {error}
            </div>
          )}

          {/* Transcription Result */}
          {transcription && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-gray-500 mb-1">Transkripsi:</p>
              <p className="text-gray-800">&quot;{transcription}&quot;</p>
            </div>
          )}

          {/* Parsed Transaction */}
          {parsedTransaction && !confirmationMessage && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4 text-left">
              <p className="text-sm text-blue-600 mb-2">Hasil Analisis:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Tipe:</span>{' '}
                  {parsedTransaction.type === 'income' ? '💰 Pemasukan' : '💸 Pengeluaran'}
                </p>
                <p>
                  <span className="font-medium">Jumlah:</span>{' '}
                  Rp {parsedTransaction.amount.toLocaleString('id-ID')}
                </p>
                <p>
                  <span className="font-medium">Deskripsi:</span>{' '}
                  {parsedTransaction.description}
                </p>
                <p>
                  <span className="font-medium">Kategori:</span>{' '}
                  {parsedTransaction.category}
                </p>
                <p className="text-xs text-gray-500">
                  Confidence: {Math.round(parsedTransaction.confidence * 100)}%
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={saveTransaction}
                  isLoading={isProcessing}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="flex-1"
                >
                  Simpan
                </Button>
                <Button
                  variant="secondary"
                  onClick={resetState}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          {confirmationMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
              <Check className="w-6 h-6 mx-auto mb-2" />
              <p>{confirmationMessage}</p>
              <Button
                variant="secondary"
                onClick={resetState}
                className="mt-3"
                size="sm"
              >
                Catat Lagi
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
