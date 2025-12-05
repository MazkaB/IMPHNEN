'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Phone, QrCode, CheckCircle, Copy } from 'lucide-react';
import { useState } from 'react';

export default function WhatsAppPage() {
  const [copied, setCopied] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BOT_NUMBER || '+14155238886';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(whatsappNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const message = encodeURIComponent('Halo, saya ingin mulai mencatat transaksi');
    window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-green-600" />
          WhatsApp Bot
        </h1>
        <p className="text-gray-500">
          Catat transaksi langsung dari WhatsApp
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Connection Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Hubungkan WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Kirim pesan ke nomor WhatsApp bot kami untuk mulai mencatat transaksi.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500 mb-2">Nomor WhatsApp Bot:</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-mono font-semibold">{whatsappNumber}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyNumber}
                  leftIcon={copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Tersalin!' : 'Salin'}
                </Button>
              </div>
            </div>

            <Button onClick={handleOpenWhatsApp} className="w-full" leftIcon={<MessageCircle className="w-4 h-4" />}>
              Buka WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Scan QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="bg-gray-100 w-48 h-48 mx-auto rounded-lg flex items-center justify-center mb-4">
              <p className="text-gray-400 text-sm">QR Code akan muncul di sini</p>
            </div>
            <p className="text-sm text-gray-500">
              Scan dengan kamera HP untuk langsung chat dengan bot
            </p>
          </CardContent>
        </Card>
      </div>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle>Cara Penggunaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Perintah Tersedia</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono mr-2">bantuan</span>
                  <span className="text-gray-600">Lihat menu bantuan</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono mr-2">saldo</span>
                  <span className="text-gray-600">Lihat ringkasan keuangan</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono mr-2">laporan</span>
                  <span className="text-gray-600">Lihat laporan bulanan</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-mono mr-2">link [email]</span>
                  <span className="text-gray-600">Hubungkan ke akun web</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Contoh Pencatatan</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>💬 &quot;jual nasi goreng 20 porsi 15 ribu&quot;</li>
                <li>💬 &quot;beli bahan baku 500 ribu&quot;</li>
                <li>💬 &quot;terima pembayaran dari Bu Ani 1 juta&quot;</li>
                <li>🎤 Kirim voice note untuk catat dengan suara</li>
                <li>📸 Kirim foto struk untuk scan otomatis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="bg-green-50 border-green-100">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse" />
            <div>
              <p className="font-medium text-green-800">Bot Aktif</p>
              <p className="text-sm text-green-600">
                WhatsApp bot siap menerima pesan 24/7
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
