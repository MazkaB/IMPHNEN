'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InsightHomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Memuat Dashboard...</p>
      </div>
    </div>
  );
}
