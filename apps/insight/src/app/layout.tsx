import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from '@/lib/contexts/DashboardContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NUSA AI - Dashboard Insight',
  description: 'Analisis dan insight bisnis real-time untuk UMKM',
  keywords: ['NUSA AI', 'dashboard', 'analytics', 'insight', 'UMKM', 'bisnis'],
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
        <DashboardProvider>{children}</DashboardProvider>
      </body>
    </html>
  );
}
