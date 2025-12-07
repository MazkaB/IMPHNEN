'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { AccountReceivable, AccountPayable } from '@/types/analytics';

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

export function useAccounts(userId: string | null) {
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch receivables
  useEffect(() => {
    if (!userId || !db) {
      setReceivables([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'receivables'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AccountReceivable[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            customerName: d.customerName || d.name || 'Unknown',
            amount: d.amount || 0,
            dueDate: d.dueDate ? convertTimestamp(d.dueDate) : new Date(),
            status: d.status || 'pending',
            userId: d.userId,
            createdAt: d.createdAt ? convertTimestamp(d.createdAt) : new Date(),
            updatedAt: d.updatedAt ? convertTimestamp(d.updatedAt) : new Date(),
          } as AccountReceivable;
        });
        setReceivables(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching receivables:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Fetch payables
  useEffect(() => {
    if (!userId || !db) {
      setPayables([]);
      return;
    }

    const q = query(
      collection(db, 'payables'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AccountPayable[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            supplierName: d.supplierName || d.name || 'Unknown',
            amount: d.amount || 0,
            dueDate: d.dueDate ? convertTimestamp(d.dueDate) : new Date(),
            status: d.status || 'pending',
            userId: d.userId,
            createdAt: d.createdAt ? convertTimestamp(d.createdAt) : new Date(),
            updatedAt: d.updatedAt ? convertTimestamp(d.updatedAt) : new Date(),
          } as AccountPayable;
        });
        setPayables(data);
      },
      (error) => {
        console.error('Error fetching payables:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    receivables,
    payables,
    loading,
    error: null,
  };
}
