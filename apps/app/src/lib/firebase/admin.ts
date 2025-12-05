import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Validasi server-side environment variables
const validateAdminEnv = () => {
  const required = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_ADMIN_PRIVATE_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing Firebase Admin environment variables: ${missing.join(', ')}. ` +
      'Server-side Firebase operations will not work.'
    );
  }
};

let adminApp: App;
let adminAuth: Auth;
let adminDb: Firestore;

const initializeAdminFirebase = () => {
  // Hanya jalankan di server-side
  if (typeof window !== 'undefined') {
    throw new Error('Firebase Admin SDK cannot be used on client-side');
  }

  validateAdminEnv();

  if (!getApps().length) {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // Handle newline characters in private key
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    adminApp = getApps()[0];
  }

  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);

  return { adminApp, adminAuth, adminDb };
};

// Lazy initialization untuk menghindari error saat import di client
export const getAdminFirebase = () => {
  if (!adminApp) {
    return initializeAdminFirebase();
  }
  return { adminApp, adminAuth, adminDb };
};

export { adminAuth, adminDb };
