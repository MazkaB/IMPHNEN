'use client';

import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
import { Subscription, SubscriptionStatus, SubscriptionPlan } from './auth-service';

// Helper to ensure db is initialized
const getDb = () => {
  if (!db) throw new Error('Firebase Firestore belum diinisialisasi');
  return db;
};

export interface PromoCode {
  code: string;
  plan: SubscriptionPlan;
  durationDays: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Check if user has active subscription
export const hasActiveSubscription = (subscription?: Subscription): boolean => {
  if (!subscription) return false;
  if (subscription.status === 'active' || subscription.status === 'trial') {
    // Check if not expired
    if (subscription.expiresAt) {
      return new Date(subscription.expiresAt) > new Date();
    }
    return true;
  }
  return false;
};

// Get subscription status text
export const getSubscriptionStatusText = (subscription?: Subscription): string => {
  if (!subscription || subscription.status === 'inactive') {
    return 'Belum Aktif';
  }
  if (subscription.status === 'expired') {
    return 'Kadaluarsa';
  }
  if (subscription.status === 'trial') {
    return 'Trial';
  }
  return 'Aktif';
};

// Hardcoded promo codes for testing (fallback if Firestore fails)
const HARDCODED_PROMOS: Record<string, PromoCode> = {
};

// Validate promo code
export const validatePromoCode = async (code: string): Promise<PromoCode | null> => {
  const upperCode = code.toUpperCase();
  
  try {
    const promoRef = doc(getDb(), 'promoCodes', upperCode);
    const promoSnap = await getDoc(promoRef);
    
    if (promoSnap.exists()) {
      const promo = promoSnap.data() as PromoCode;
      
      // Check if promo is active
      if (!promo.isActive) {
        return null;
      }
      
      // Check if promo has reached max uses
      if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
        return null;
      }
      
      // Check if promo is expired
      if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
        return null;
      }
      
      return promo;
    }
  } catch (error) {
    console.warn('Firestore error, using hardcoded promos:', error);
  }
  
  // Fallback to hardcoded promos
  return HARDCODED_PROMOS[upperCode] || null;
};

// Activate subscription with promo code
export const activateWithPromoCode = async (uid: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    const promo = await validatePromoCode(code);
    
    if (!promo) {
      return { success: false, message: 'Kode promo tidak valid atau sudah kadaluarsa' };
    }
    
    const userRef = doc(getDb(), 'users', uid);
    const userSnap = await getDoc(userRef);
    
    // Check if user already used this promo (only if user doc exists)
    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData.subscription?.promoCode === code.toUpperCase()) {
        return { success: false, message: 'Anda sudah menggunakan kode promo ini' };
      }
    }
    
    // Calculate expiry date
    const now = new Date();
    const expiresAt = new Date(now.getTime() + promo.durationDays * 24 * 60 * 60 * 1000);
    
    // Update user subscription (will create doc if not exists)
    const subscription: Subscription = {
      status: 'active',
      plan: promo.plan,
      activatedAt: now,
      expiresAt: expiresAt,
      promoCode: code.toUpperCase(),
    };
    
    await setDoc(userRef, {
      uid,
      subscription,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    // Increment promo usage count (only if from Firestore, not hardcoded)
    try {
      const promoRef = doc(getDb(), 'promoCodes', code.toUpperCase());
      const promoSnap = await getDoc(promoRef);
      if (promoSnap.exists()) {
        await setDoc(promoRef, {
          usedCount: (promoSnap.data().usedCount || 0) + 1,
        }, { merge: true });
      }
    } catch {
      // Ignore if promo update fails (might be hardcoded)
    }
    
    return { success: true, message: `Berhasil! Akun Anda aktif hingga ${expiresAt.toLocaleDateString('id-ID')}` };
  } catch (error) {
    console.error('Error activating subscription:', error);
    return { success: false, message: 'Terjadi kesalahan. Silakan coba lagi.' };
  }
};

// Manually activate subscription (for admin)
export const manualActivateSubscription = async (
  uid: string, 
  plan: SubscriptionPlan, 
  durationDays: number
): Promise<boolean> => {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    
    const subscription: Subscription = {
      status: 'active',
      plan,
      activatedAt: now,
      expiresAt: expiresAt,
    };
    
    await setDoc(doc(getDb(), 'users', uid), {
      subscription,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error('Error manually activating subscription:', error);
    return false;
  }
};

// Check and update expired subscriptions
export const checkSubscriptionExpiry = (subscription?: Subscription): SubscriptionStatus => {
  if (!subscription) return 'inactive';
  
  if (subscription.status === 'active' || subscription.status === 'trial') {
    if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
      return 'expired';
    }
  }
  
  return subscription.status;
};

// Helper to convert Firestore timestamp or date string to Date
const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  // Firestore Timestamp
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  // Already a Date
  if (value instanceof Date) return value;
  // String or number
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
};

// Check user subscription directly from Firestore
export const checkUserSubscription = async (uid: string): Promise<boolean> => {
  try {
    const userRef = doc(getDb(), 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const subscription = userData.subscription;
      
      if (!subscription) return false;
      
      // If subscription has status 'active' or has promoCode, check expiry
      if (subscription.status === 'active' || subscription.status === 'trial' || subscription.promoCode) {
        // Check expiry if exists
        if (subscription.expiresAt) {
          const expiryDate = toDate(subscription.expiresAt);
          if (expiryDate && expiryDate > new Date()) {
            return true;
          }
          // Expired
          return false;
        }
        // No expiry date means active forever
        return true;
      }
      
      return false;
    }
    return false;
  } catch {
    return false;
  }
};
