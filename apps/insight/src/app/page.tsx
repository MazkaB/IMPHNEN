'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Pass userId from URL params if available
    const userId = searchParams.get('userId');
    if (userId) {
      router.push(`/dashboard?userId=${userId}`);
    } else {
      router.push('/dashboard');
    }
  }, [router, searchParams]);

  return null;
}

export default function InsightHomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl font-bold">📊</span>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
        <p className="mt-4 text-gray-600 text-lg">Memuat Analisis...</p>
      </div>
      <Suspense fallback={null}>
        <RedirectContent />
      </Suspense>
    </div>
  );
}
