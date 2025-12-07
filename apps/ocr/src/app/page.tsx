'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, Camera, Loader2, Save, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Home, ChevronLeft, ChevronRight } from 'lucide-react';
import { processDocument, type OCRResult, type DocumentType, getDocumentTypeLabel } from '@/lib/api/ocr-client';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { AuthGuard } from '@/components/providers/AuthProvider';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';

// Step configuration
const steps = [
  { id: 'upload', title: 'Ambil Foto', description: 'Foto struk atau bon Anda' },
  { id: 'process', title: 'Proses', description: 'AI akan membaca dokumen' },
  { id: 'result', title: 'Simpan', description: 'Periksa dan simpan data' },
];

function OCRPageContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('auto');
  const [showRawText, setShowRawText] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrResult(null);
    setError('');
    setCurrentStep(1);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setError('');
      setCurrentStep(1);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      setError('Silakan pilih gambar terlebih dahulu');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const result = await processDocument(selectedFile, documentType);
      setOcrResult(result);
      setCurrentStep(2);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memproses OCR';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!ocrResult) return;

    if (!db) {
      setError('Firebase belum diinisialisasi');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await addDoc(collection(db, 'ocr_archives'), {
        documentType: ocrResult.documentType,
        rawText: ocrResult.rawText,
        parsedData: ocrResult.parsed,
        userId: 'demo_user',
        createdAt: Timestamp.now(),
        processedAt: new Date().toISOString(),
      });

      setSaved(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan data';
      setError('Gagal menyimpan data: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setOcrResult(null);
    setDocumentType('auto');
    setCurrentStep(0);
    setSaved(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ambil Foto Struk</h2>
              <p className="text-gray-500 text-lg">Foto struk belanja, bon, atau dokumen keuangan</p>
            </div>

            {/* Upload Area - Large Touch Target */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-3 border-dashed border-green-300 rounded-3xl p-8 sm:p-12 text-center hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
              </div>
              <p className="text-gray-900 text-xl sm:text-2xl font-bold mb-2">
                Ketuk untuk ambil foto
              </p>
              <p className="text-gray-500 text-lg">atau drag & drop gambar di sini</p>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-6 sm:p-8 border-2 border-green-200">
              <h3 className="font-bold text-green-900 text-xl mb-4">💡 Tips Foto yang Bagus:</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  'Pastikan pencahayaan cukup',
                  'Foto lurus, tidak miring',
                  'Hindari bayangan pada teks',
                  'Pastikan teks terbaca jelas'
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Proses Dokumen</h2>
              <p className="text-gray-500 text-lg">AI akan membaca dan mengekstrak data</p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-lg">
                <img src={previewUrl} alt="Preview" className="w-full max-h-64 sm:max-h-80 object-contain bg-gray-100" />
                <div className="p-4 border-t border-gray-100">
                  <p className="text-green-600 font-semibold text-center flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Foto siap diproses
                  </p>
                </div>
              </div>
            )}

            {/* Document Type Selection */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-4 sm:p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">📄 Jenis Dokumen</h3>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
              >
                <option value="auto">🤖 Deteksi Otomatis (Disarankan)</option>
                <option value="receipt">🧾 Struk Belanja</option>
                <option value="invoice">📄 Invoice/Faktur</option>
                <option value="bank_statement">🏦 Rekening Koran</option>
                <option value="stock_card">📦 Kartu Stok</option>
              </select>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={processing}
              className="w-full py-6 sm:py-8 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-3xl transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl text-xl sm:text-2xl"
            >
              {processing ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <FileText className="w-8 h-8" />
                  Proses Sekarang
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700">Error</p>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return ocrResult ? (
          <div className="space-y-6">
            {/* Success/Saved Header */}
            {saved ? (
              <div className="bg-green-100 border-2 border-green-300 rounded-3xl p-6 sm:p-8 text-center">
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-green-800">Data Berhasil Disimpan! 🎉</h2>
                <p className="text-green-700 mt-2 text-lg">Transaksi sudah tercatat di sistem</p>
              </div>
            ) : (
              <div className="bg-blue-100 border-2 border-blue-300 rounded-3xl p-6 sm:p-8 text-center">
                <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">Scan Berhasil! 🎉</h2>
                <p className="text-blue-700 mt-2 text-lg">
                  Jenis: <span className="font-semibold">{getDocumentTypeLabel(ocrResult.documentType)}</span>
                </p>
              </div>
            )}

            {/* Parsed Data */}
            <div className="bg-white rounded-3xl border-2 border-gray-200 p-4 sm:p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Data Terdeteksi</h3>
              {Object.keys(ocrResult.parsed || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(ocrResult.parsed).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-sm text-gray-500 uppercase tracking-wide mb-1 font-medium">{key}</p>
                      <div className="text-lg font-semibold text-gray-900">
                        {key.toLowerCase() === 'items' && Array.isArray(value) ? (
                          <div className="space-y-2">
                            {value.map((item: { name?: string; quantity?: number; price?: number }, i: number) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200">
                                <span>{item.name || '-'}</span>
                                <span className="font-bold text-green-600">Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        ) : typeof value === 'object' ? (
                          <pre className="text-sm overflow-auto bg-white p-3 rounded-xl">{JSON.stringify(value, null, 2)}</pre>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-4">Tidak ada data terstruktur</p>
              )}
            </div>

            {/* Raw Text Toggle */}
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              <span className="font-medium text-gray-700">📝 Lihat Teks Mentah</span>
              {showRawText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showRawText && (
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 max-h-48 overflow-y-auto">
                {ocrResult.rawText || 'Tidak ada teks terdeteksi'}
              </pre>
            )}

            {/* Action Buttons */}
            {!saved ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-5 sm:py-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-3 text-xl shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6" />
                    Simpan Data
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={resetForm}
                  className="flex-1 py-5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <Camera className="w-6 h-6" />
                  Scan Lagi
                </button>
                <a
                  href={`${DASHBOARD_URL}/dashboard`}
                  className="flex-1 py-5 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-2xl text-center hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <Home className="w-6 h-6" />
                  Ke Dashboard
                </a>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-gray-900">Foto Struk</h1>
              <p className="text-sm text-gray-500">Scan Otomatis</p>
            </div>
          </div>
          <a
            href={`${DASHBOARD_URL}/dashboard`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-32">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Langkah {currentStep + 1} dari {steps.length}</span>
            <span className="text-sm font-medium text-green-600">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span 
                key={step.id}
                className={`text-xs sm:text-sm font-medium ${index <= currentStep ? 'text-green-600' : 'text-gray-400'}`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>

      {/* Navigation - Fixed Bottom */}
      {currentStep > 0 && currentStep < 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-4 shadow-2xl z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
              <span className="hidden sm:inline">Kembali</span>
            </button>

            {/* Step Dots */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`
                    h-3 rounded-full transition-all
                    ${index === currentStep ? 'w-8 bg-green-500' : index < currentStep ? 'w-3 bg-green-300' : 'w-3 bg-gray-300'}
                  `}
                />
              ))}
            </div>

            <div className="w-24 sm:w-32" />
          </div>
        </div>
      )}
    </main>
  );
}

export default function OCRPage() {
  return (
    <AuthGuard>
      <OCRPageContent />
    </AuthGuard>
  );
}
