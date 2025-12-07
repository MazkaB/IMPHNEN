'use client';

import { db } from './config';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  description: string;
  amount: number;
  category: string;
  salesCount?: number;
}

export async function getProductsFromTransactions(): Promise<{
  best_seller: Product[];
  recommendation: Product[];
  expired: Product[];
}> {
  if (!db) {
    return { best_seller: [], recommendation: [], expired: [] };
  }

  try {
    // Get income transactions from Firestore
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('type', '==', 'income'),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const snapshot = await getDocs(transactionsQuery);

    // Aggregate products by description/category
    const productMap = new Map<string, Product & { count: number; totalAmount: number }>();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const key = data.description || data.category || 'Produk';

      if (productMap.has(key)) {
        const existing = productMap.get(key)!;
        existing.count += 1;
        existing.totalAmount += data.amount || 0;
      } else {
        productMap.set(key, {
          id: doc.id,
          name: key,
          description: data.description || '',
          amount: data.amount || 0,
          category: data.category || 'Lainnya',
          count: 1,
          totalAmount: data.amount || 0,
        });
      }
    });

    // Convert to array and sort by count (best sellers)
    const products = Array.from(productMap.values())
      .map((p) => ({
        ...p,
        salesCount: p.count,
        amount: Math.round(p.totalAmount / p.count),
      }))
      .sort((a, b) => b.count - a.count);

    // Split into categories
    const bestSellers = products.slice(0, 5).map((p) => ({
      id: p.id,
      name: p.name,
      description: `Terjual ${p.salesCount}x - Rp ${p.amount.toLocaleString('id-ID')}`,
      amount: p.amount,
      category: p.category,
      salesCount: p.salesCount,
    }));

    const recommendations = products.slice(5, 10).map((p) => ({
      id: p.id,
      name: p.name,
      description: `Rekomendasi - Rp ${p.amount.toLocaleString('id-ID')}`,
      amount: p.amount,
      category: p.category,
      salesCount: p.salesCount,
    }));

    const promoProducts = products.slice(-5).map((p) => ({
      id: p.id,
      name: p.name,
      description: `Promo Spesial - Rp ${p.amount.toLocaleString('id-ID')}`,
      amount: p.amount,
      category: p.category,
      salesCount: p.salesCount,
    }));

    return {
      best_seller: bestSellers,
      recommendation: recommendations,
      expired: promoProducts,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { best_seller: [], recommendation: [], expired: [] };
  }
}
