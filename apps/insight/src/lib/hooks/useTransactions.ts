'use client';

import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Transaction } from '@/types/transaction';
import { isWithinInterval } from 'date-fns';

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

export function useTransactions(userId: string | null, startDate?: Date, endDate?: Date) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !db) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txData: Transaction[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt ? convertTimestamp(data.createdAt) : new Date();
          
          return {
            id: docSnap.id,
            userId: data.userId || userId,
            date: createdAt,
            time: createdAt.toLocaleTimeString('id-ID'),
            product: data.description || 'Produk',
            productId: data.productId || docSnap.id,
            quantity: data.quantity || 1,
            pricePerItem: data.amount || 0,
            totalAmount: data.amount || 0,
            costPerItem: data.type === 'expense' ? data.amount : 0,
            source: (data.source as 'voice' | 'ocr' | 'manual') || 'manual',
            customer: data.category || '',
            createdAt: createdAt,
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : createdAt,
            type: data.type,
            amount: data.amount,
            description: data.description,
            category: data.category,
          } as Transaction;
        });
        setTransactions(txData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return transactions;

    return transactions.filter((t) => {
      const txDate = t.date instanceof Date ? t.date : new Date(t.date);
      return isWithinInterval(txDate, { start: startDate, end: endDate });
    });
  }, [transactions, startDate, endDate]);

  // Placeholder function - requires auth context for write operations
  const addTransaction = async (_data: unknown) => { throw new Error('Not implemented'); };

  return {
    transactions: filteredTransactions,
    loading,
    error: null,
    addTransaction,
  };
}
