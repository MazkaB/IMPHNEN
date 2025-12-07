'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2, Save, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Home, ArrowLeft } from 'lucide-react';
import { processDocument, type OCRResult, type DocumentType, getDocumentTypeLabel } from '@/lib/api/ocr-client';

const DASHBOARD_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app';

export default function OCRPage() {
  const [step, setStep] = useState<'upload' | 'process' | 'result'>('upload');
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
    setStep('process');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setError('');
      setStep('process');
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) { setError('Pilih gambar terlebih dahulu'); return; }
    setProcessing(true);
    setError('');
    try {
      const result = await processDocument(selectedFile, documentType);
      setOcrResult(result);
      setStep('result');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memproses OCR');
    } finally {
      setProcessing(false);
    }
  };


  const handleSave = async () => {
    if (!ocrResult) return;
    setSaving(true);
    setError('');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId') || 'anonymous_ocr_user';
      const response = await fetch(`${API_BASE_URL}/api/ocr/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ documentType: ocrResult.documentType, rawText: ocrResult.rawText, parsedData: ocrResult.parsed }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan data');
      }
      setSaved(true);
    } catch (err: unknown) {
      setError('Gagal menyimpan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null); setPreviewUrl(''); setOcrResult(null);
    setDocumentType('auto'); setStep('upload'); setSaved(false); setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 sm:w-6 h-5 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Foto Struk</h1>
                <p className="text-sm text-gray-500 truncate">Scan Otomatis dengan AI</p>
              </div>
            </div>
            <a href={`${DASHBOARD_URL}/dashboard`} className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium flex-shrink-0">
              <Home className="w-5 h-5" /><span className="hidden sm:inline">Dashboard</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Progress */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Langkah {step === 'upload' ? 1 : step === 'process' ? 2 : 3} dari 3</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: step === 'upload' ? '33%' : step === 'process' ? '66%' : '100%' }} />
          </div>
        </div>


        {/* Step 1: Upload */}
        {step === 'upload' && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ambil Foto Struk</h2>
              <p className="text-gray-500">Foto struk belanja, bon, atau dokumen keuangan</p>
            </div>
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}
              className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 cursor-pointer">
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-900 text-lg font-bold mb-1">Ketuk untuk ambil foto</p>
              <p className="text-gray-500">atau drag & drop gambar</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Tips Foto yang Bagus</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {['Pencahayaan cukup', 'Foto lurus tidak miring', 'Hindari bayangan', 'Teks terbaca jelas'].map((tip, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" /><span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Process */}
        {step === 'process' && (
          <section className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Proses Dokumen</h2>
              <p className="text-gray-500">AI akan membaca dan mengekstrak data</p>
            </div>
            {previewUrl && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <img src={previewUrl} alt="Preview" className="w-full max-h-64 object-contain bg-gray-100" />
                <div className="p-4 border-t border-gray-100 text-center">
                  <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" /> Foto siap diproses
                  </p>
                </div>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">Jenis Dokumen</h3>
              <select value={documentType} onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-gray-900">
                <option value="auto">Deteksi Otomatis</option>
                <option value="receipt">Struk Belanja</option>
                <option value="invoice">Invoice/Faktur</option>
                <option value="bank_statement">Rekening Koran</option>
              </select>
            </div>
            <button onClick={handleProcess} disabled={processing}
              className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-3">
              {processing ? <><Loader2 className="w-6 h-6 animate-spin" /> Memproses...</> : 'Proses Sekarang'}
            </button>
            <button onClick={() => setStep('upload')} className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Kembali
            </button>
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"><AlertCircle className="w-5 h-5 text-red-600" /><p className="text-red-600">{error}</p></div>}
          </section>
        )}


        {/* Step 3: Result */}
        {step === 'result' && ocrResult && (
          <section className="space-y-6">
            {saved ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-800">Data Berhasil Disimpan</h2>
                <p className="text-green-700 mt-2">Transaksi sudah tercatat di sistem</p>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-14 h-14 text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Scan Berhasil</h2>
                <p className="text-gray-600 mt-2">Jenis: {getDocumentTypeLabel(ocrResult.documentType)}</p>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Data Terdeteksi</h3>
              {Object.keys(ocrResult.parsed || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(ocrResult.parsed).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 uppercase mb-1">{key}</p>
                      <div className="font-medium text-gray-900">
                        {key.toLowerCase() === 'items' && Array.isArray(value) ? (
                          <div className="space-y-2">
                            {value.map((item: { name?: string; price?: number }, i: number) => (
                              <div key={i} className="flex justify-between p-2 bg-white rounded border border-gray-200">
                                <span>{item.name || '-'}</span>
                                <span className="font-bold">Rp {(item.price || 0).toLocaleString('id-ID')}</span>
                              </div>
                            ))}
                          </div>
                        ) : typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">Tidak ada data terstruktur</p>}
            </div>

            <button onClick={() => setShowRawText(!showRawText)} className="w-full flex items-center justify-between p-4 bg-gray-100 rounded-xl hover:bg-gray-200">
              <span className="font-medium text-gray-700">Lihat Teks Mentah</span>
              {showRawText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showRawText && <pre className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-48 overflow-y-auto">{ocrResult.rawText || 'Tidak ada teks'}</pre>}

            {!saved ? (
              <button onClick={handleSave} disabled={saving} className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-3">
                {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : <><Save className="w-5 h-5" /> Simpan Data</>}
              </button>
            ) : (
              <div className="flex gap-4">
                <button onClick={resetForm} className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  <Camera className="w-5 h-5" /> Scan Lagi
                </button>
                <a href={`${DASHBOARD_URL}/dashboard`} className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-center hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" /> Dashboard
                </a>
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4"><p className="text-red-600">{error}</p></div>}
          </section>
        )}
      </main>
    </div>
  );
}
