'use client';

import { useState, useRef } from 'react';
import { FileText, Upload, Camera, Loader2, Save, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { processDocument, type OCRResult, type DocumentType } from '@/lib/api/ocr-client';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function OCRPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('auto');
  const [showRawText, setShowRawText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setOcrResult(null);
      setError('');
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

      alert('Data berhasil disimpan!');
      resetForm();
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      auto: '🤖 Deteksi Otomatis',
      receipt: '🧾 Struk Belanja',
      invoice: '📄 Invoice/Faktur',
      purchase_order: '📋 Purchase Order',
      bank_statement: '🏦 Rekening Koran',
      stock_card: '📦 Kartu Stok',
      contract: '📜 Kontrak/Surat',
    };
    return labels[type] || type;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-gray-900">NUSA AI - OCR</h1>
              <p className="text-xs sm:text-sm text-gray-500">Digitalisasi Dokumen Universal</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
          Upload foto dokumen (struk, invoice, rekening koran, dll) untuk digitalisasi otomatis dengan AI
        </p>

        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Upload Gambar
            </h2>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-green-400 transition-colors cursor-pointer mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-36 sm:max-h-48 mx-auto rounded-lg shadow" />
              ) : (
                <>
                  <Camera className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-600 mb-1 text-sm sm:text-base">Drag & drop atau klik untuk upload</p>
                  <p className="text-xs sm:text-sm text-gray-400">Format: JPG, PNG (Max 10MB)</p>
                </>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Dokumen:</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="auto">🤖 Deteksi Otomatis</option>
                <option value="receipt">🧾 Struk Belanja</option>
                <option value="invoice">📄 Invoice/Faktur</option>
                <option value="purchase_order">📋 Purchase Order</option>
                <option value="bank_statement">🏦 Rekening Koran</option>
                <option value="stock_card">📦 Kartu Stok</option>
                <option value="contract">📜 Kontrak/Surat</option>
              </select>
              {documentType === 'auto' && (
                <p className="text-xs text-gray-500 mt-1">AI akan mendeteksi jenis dokumen secara otomatis</p>
              )}
            </div>

            <button
              onClick={handleProcess}
              disabled={!selectedFile || processing}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Proses OCR
                </>
              )}
            </button>
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">📋 Tips Scan</h2>
            <ul className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Foto harus jelas dan pencahayaan cukup</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Foto dokumen secara lurus (tidak miring)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Hindari bayangan pada teks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Gunakan resolusi yang cukup tinggi</span>
              </li>
            </ul>

            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white rounded-lg shadow-sm">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">Powered by:</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">PaddleOCR + Gemini AI</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Smart Document Processing</p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-700">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* OCR Result */}
        {ocrResult && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold">📄 Hasil Scan</h2>
                <span className="text-[10px] sm:text-xs bg-green-100 text-green-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium">
                  {getDocumentTypeLabel(ocrResult.documentType)}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-green-600 bg-green-50 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full flex items-center gap-1 w-fit">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" /> Berhasil
              </span>
            </div>

            {/* Parsed Data */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Data Terstruktur</h3>
              {Object.keys(ocrResult.parsed || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(ocrResult.parsed).map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{key}</p>
                      <div className="text-sm font-medium">
                        {key.toLowerCase() === 'items' && Array.isArray(value) ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left font-semibold">Nama Item</th>
                                  <th className="px-3 py-2 text-center font-semibold">Qty</th>
                                  <th className="px-3 py-2 text-right font-semibold">Harga</th>
                                  <th className="px-3 py-2 text-right font-semibold">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {value.map((item: { name?: string; quantity?: number; price?: number }, i: number) => {
                                  const qty = item.quantity || 1;
                                  const price = item.price || 0;
                                  return (
                                    <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                                      <td className="px-3 py-2">{item.name || '-'}</td>
                                      <td className="px-3 py-2 text-center">{qty}</td>
                                      <td className="px-3 py-2 text-right">Rp {price.toLocaleString('id-ID')}</td>
                                      <td className="px-3 py-2 text-right font-semibold">Rp {(qty * price).toLocaleString('id-ID')}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : Array.isArray(value) ? (
                          <div className="space-y-1">
                            {value.map((item, i) => (
                              <div key={i} className="text-xs bg-blue-50 p-2 rounded">
                                {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                              </div>
                            ))}
                          </div>
                        ) : typeof value === 'object' ? (
                          <pre className="text-xs overflow-auto">{JSON.stringify(value, null, 2)}</pre>
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
              className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
              <span className="font-medium text-gray-700">📝 Lihat Teks Mentah</span>
              {showRawText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showRawText && (
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto mb-4">
                {ocrResult.rawText || 'Tidak ada teks terdeteksi'}
              </pre>
            )}

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan ke Arsip
                </>
              )}
            </button>
          </div>
        )}

        {/* Info Footer */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 sm:p-6 rounded-xl">
          <h3 className="font-bold mb-2 flex items-center gap-2 text-sm sm:text-base">ℹ️ Informasi</h3>
          <p className="text-xs sm:text-sm opacity-90">
            Sistem ini menggunakan <strong>PaddleOCR + Gemini AI</strong> untuk mendeteksi teks dari berbagai jenis dokumen.
            Data hasil scan akan disimpan ke database untuk arsip digital Anda.
          </p>
        </div>
      </div>
    </main>
  );
}
