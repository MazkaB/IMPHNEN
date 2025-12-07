'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ContentHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to content creator
    router.push('/content-creator');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white text-2xl font-bold">🎨</span>
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mx-auto" />
        <p className="mt-4 text-gray-600 text-lg">Memuat Content Creator...</p>
      </div>
    </div>
  );
}
