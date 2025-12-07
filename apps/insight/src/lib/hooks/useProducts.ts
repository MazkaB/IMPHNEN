'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Product } from '@/types/product';

function convertTimestamp(timestamp: unknown): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string | number);
}

export function useProducts(userId: string | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prodData: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || 'Produk',
            sellingPrice: data.sellingPrice || data.price || 0,
            costPrice: data.costPrice || data.cost || 0,
            currentStock: data.currentStock || data.stock || 0,
            minStock: data.minStock || 10,
            photoUrl: data.photoUrl,
            category: data.category,
            userId: data.userId,
            createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : new Date(),
          } as Product;
        });
        setProducts(prodData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Placeholder functions - these require auth context for write operations
  const addProduct = async (_data: unknown) => { throw new Error('Not implemented'); };
  const updateProduct = async (_id: string, _data: unknown) => { throw new Error('Not implemented'); };
  const deleteProduct = async (_id: string) => { throw new Error('Not implemented'); };

  return {
    products,
    loading,
    error: null,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
