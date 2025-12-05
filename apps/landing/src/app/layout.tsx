import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
});

export const metadata: Metadata = {
  title: 'NUSA AI - Asisten Bisnis Inklusif untuk UMKM Indonesia',
  description: 'Platform AI inklusif yang memudahkan pencatatan suara, pengelolaan keuangan, dan otomatisasi promosi untuk UMKM Indonesia.',
  keywords: ['NUSA AI', 'UMKM', 'AI', 'inklusif', 'pencatatan suara', 'Indonesia', 'bisnis'],
  authors: [{ name: 'Tim NUSA AI' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'NUSA AI - Asisten Bisnis Inklusif untuk UMKM Indonesia',
    description: 'Platform AI inklusif untuk UMKM Indonesia. Catat transaksi dengan suara, kelola keuangan, tingkatkan omzet.',
    type: 'website',
    locale: 'id_ID',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
