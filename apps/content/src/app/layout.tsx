import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NUSA AI - Auto Content Creator',
  description: 'Buat konten marketing otomatis untuk Instagram, WhatsApp, dan TikTok dengan AI',
  keywords: ['NUSA AI', 'content creator', 'AI', 'marketing', 'Instagram', 'UMKM'],
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
