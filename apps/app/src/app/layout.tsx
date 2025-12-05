import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NUSA AI - Pencatatan Keuangan UMKM',
  description: 'Platform AI untuk membantu UMKM mencatat transaksi dengan suara, OCR, dan WhatsApp',
  keywords: ['NUSA AI', 'pembukuan', 'UMKM', 'AI', 'keuangan', 'voice', 'OCR'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
