import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NUSA AI - OCR Digitalisasi Dokumen',
  description: 'Digitalisasi dokumen universal dengan PaddleOCR + Gemini AI',
  keywords: ['NUSA AI', 'OCR', 'digitalisasi', 'struk', 'invoice', 'UMKM', 'AI'],
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
