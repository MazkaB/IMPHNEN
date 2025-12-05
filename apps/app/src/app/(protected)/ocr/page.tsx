'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Upload, Camera, Info } from 'lucide-react';

export default function OCRPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-green-600" />
          Scan Struk (OCR)
        </h1>
        <p className="text-gray-500">
          Digitalisasi arsip dengan scan bon dan struk
        </p>
      </div>

      {/* Info Card */}
      <Card className="bg-yellow-50 border-yellow-100">
        <CardContent className="pt-6">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-900 mb-1">Fitur dalam Pengembangan</h3>
              <p className="text-sm text-yellow-800">
                Fitur OCR sedang dikembangkan oleh tim Fattah. Segera hadir!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Struk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag & drop foto struk di sini
            </p>
            <p className="text-sm text-gray-400">
              atau klik untuk memilih file
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Format: JPG, PNG, PDF (Max 10MB)
            </p>
          </div>

          <div className="mt-4 flex justify-center">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Camera className="w-5 h-5 mr-2" />
              Ambil Foto
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Scan Bon</h3>
            <p className="text-sm text-gray-500">
              Ekstrak data dari bon belanja
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Struk Tulisan Tangan</h3>
            <p className="text-sm text-gray-500">
              Baca nota tulisan tangan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Auto Kategorisasi</h3>
            <p className="text-sm text-gray-500">
              Kategorikan otomatis
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
