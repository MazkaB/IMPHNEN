'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { auth, db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FileText, Upload, Camera, Loader2, Save, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type DocumentType = 'auto' | 'receipt' | 'invoice' | 'purchase_order' | 'bank_statement' | 'stock_card' | 'contract';

interface OCRResult {
  documentType: DocumentType;
  rawText: string;
  parsed: Record<string, unknown>;
}

export default function OCRPage() {
  const { user } = useAuthStore();
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
    if (file.size > 10 * 1024 * 1024) {
      setError('File terlalu besar. Maksimal 10MB.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setOcrResult(null);
    setError('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File terlalu besar. Maksimal 10MB.');
        return;
      }
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
      const token = await auth?.currentUser?.getIdToken();
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Gagal memproses OCR');
      }

      setOcrResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memproses OCR');
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!ocrResult || !db || !user) return;

    setSaving(true);
    setError('');

    try {
      await addDoc(collection(db, 'ocr_archives'), {
        documentType: ocrResult.documentType,
        rawText: ocrResult.rawText,
        parsedData: ocrResult.parsed,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert('Data berhasil disimpan ke arsip!');
      resetForm();
    } catch (err) {
      setError('Gagal menyimpan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setOcrResult(null);
    setDocumentType('auto');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      auto: '🤖 Deteksi Otomatis', receipt: '🧾 Struk Belanja', invoice: '📄 Invoice/Faktur',
      purchase_order: '📋 Purchase Order', bank_statement: '🏦 Rekening Koran',
      stock_card: '📦 Kartu Stok', contract: '📜 Kontrak/Surat',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-green-600" />
          Scan Struk (OCR)
        </h1>
        <p className="text-gray-500">Digitalisasi dokumen dengan Gemini Vision AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader><CardTitle>Upload Gambar</CardTitle></CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer"
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow" />
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1">Drag & drop atau klik untuk upload</p>
                  <p className="text-sm text-gray-400">Format: JPG, PNG (Max 10MB)</p>
                </>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Dokumen:</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="auto">🤖 Deteksi Otomatis</option>
                <option value="receipt">🧾 Struk Belanja</option>
                <option value="invoice">📄 Invoice/Faktur</option>
                <option value="purchase_order">📋 Purchase Order</option>
                <option value="bank_statement">🏦 Rekening Koran</option>
                <option value="stock_card">📦 Kartu Stok</option>
                <option value="contract">📜 Kontrak/Surat</option>
              </select>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={handleProcess} disabled={!selectedFile || processing} className="flex-1" isLoading={processing}>
                {processing ? 'Memproses...' : 'Proses OCR'}
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} leftIcon={<Camera className="w-4 h-4" />}>
                Ambil Foto
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-3">📋 Tips Scan</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />Foto harus jelas dan pencahayaan cukup</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />Foto dokumen secara lurus (tidak miring)</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />Hindari bayangan pada teks</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />Gunakan resolusi yang cukup tinggi</li>
            </ul>
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
              <p className="text-xs text-gray-500">Powered by:</p>
              <p className="font-bold text-green-600">Gemini 2.0 Flash Vision</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div><p className="font-medium text-red-700">Error</p><p className="text-red-600 text-sm">{error}</p></div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {ocrResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                📄 Hasil Scan
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{getDocumentTypeLabel(ocrResult.documentType)}</span>
              </CardTitle>
              <span className="text-sm text-green-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Berhasil</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Parsed Data */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📊 Data Terstruktur</h3>
              {Object.keys(ocrResult.parsed || {}).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(ocrResult.parsed).map(([key, value]) => (
                    <div key={key} className="bg-white p-3 rounded-lg border">
                      <p className="text-xs text-gray-500 uppercase">{key}</p>
                      <div className="text-sm font-medium">
                        {key.toLowerCase() === 'items' && Array.isArray(value) ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-2 py-1 text-left">Item</th>
                                  <th className="px-2 py-1 text-center">Qty</th>
                                  <th className="px-2 py-1 text-right">Harga</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(value as Array<{name?: string; quantity?: number; price?: number}>).map((item, i) => (
                                  <tr key={i} className="border-t">
                                    <td className="px-2 py-1">{item.name || '-'}</td>
                                    <td className="px-2 py-1 text-center">{item.quantity || 1}</td>
                                    <td className="px-2 py-1 text-right">Rp {(item.price || 0).toLocaleString('id-ID')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-gray-400 text-center py-4">Tidak ada data terstruktur</p>}
            </div>

            {/* Raw Text Toggle */}
            <button onClick={() => setShowRawText(!showRawText)} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 mb-4">
              <span className="font-medium text-gray-700">📝 Lihat Teks Mentah</span>
              {showRawText ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            {showRawText && (
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg border max-h-48 overflow-y-auto mb-4">
                {ocrResult.rawText || 'Tidak ada teks'}
              </pre>
            )}

            <Button onClick={handleSave} disabled={saving} isLoading={saving} className="w-full" leftIcon={<Save className="w-4 h-4" />}>
              {saving ? 'Menyimpan...' : 'Simpan ke Arsip'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
