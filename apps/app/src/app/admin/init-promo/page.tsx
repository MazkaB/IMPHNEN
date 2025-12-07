'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuthStore } from '@/store/auth-store';
import { Loader2, CheckCircle } from 'lucide-react';

const promoCodes = [
  {
    code: 'NUSA2025',
    plan: 'pro',
    durationDays: 30,
    maxUses: 100,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'HACKATHON',
    plan: 'pro',
    durationDays: 90,
    maxUses: 50,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'TRIAL7',
    plan: 'basic',
    durationDays: 7,
    maxUses: 1000,
    usedCount: 0,
    isActive: true,
  },
  {
    code: 'UMKM2025',
    plan: 'basic',
    durationDays: 30,
    maxUses: 500,
    usedCount: 0,
    isActive: true,
  },
];

export default function InitPromoPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/admin/init-promo');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInit = async () => {
    if (!db) {
      setError('Firebase not initialized');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const promo of promoCodes) {
        await setDoc(doc(db, 'promoCodes', promo.code), {
          ...promo,
          createdAt: serverTimestamp(),
        });
      }
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create promo codes');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-xl font-bold mb-4">Initialize Promo Codes</h1>
        
        <div className="bg-neutral-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium mb-2">Promo codes to create:</p>
          <ul className="text-sm text-neutral-600 space-y-1">
            {promoCodes.map((p) => (
              <li key={p.code}>
                <code className="bg-neutral-200 px-1 rounded">{p.code}</code> - {p.plan} ({p.durationDays} days)
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {done ? (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Promo codes created successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleInit}
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Promo Codes'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
