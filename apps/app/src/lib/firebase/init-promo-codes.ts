// Script untuk membuat promo codes di Firestore
// Jalankan sekali dari console atau buat API endpoint

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export const initPromoCodes = async () => {
  if (!db) {
    console.error('Firestore not initialized');
    return;
  }

  const promoCodes = [
    {
      code: 'NUSA2024',
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
      code: 'UMKM2024',
      plan: 'basic',
      durationDays: 30,
      maxUses: 500,
      usedCount: 0,
      isActive: true,
    },
  ];

  for (const promo of promoCodes) {
    await setDoc(doc(db, 'promoCodes', promo.code), {
      ...promo,
      createdAt: serverTimestamp(),
    });
    console.log(`Created promo code: ${promo.code}`);
  }

  console.log('All promo codes created!');
};
