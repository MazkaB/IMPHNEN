// Run with: node scripts/seed-promo-codes.js
// Make sure you're logged in with: firebase login

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with default credentials (uses firebase login)
initializeApp({
  credential: applicationDefault(),
  projectId: 'atamagri-cc5c1'
});

const db = getFirestore();

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

async function seedPromoCodes() {
  console.log('Seeding promo codes...');
  
  for (const promo of promoCodes) {
    await db.collection('promoCodes').doc(promo.code).set({
      ...promo,
      createdAt: new Date(),
    });
    console.log(`Created: ${promo.code}`);
  }
  
  console.log('Done!');
  process.exit(0);
}

seedPromoCodes().catch(console.error);
