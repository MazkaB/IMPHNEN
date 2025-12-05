'use client';

import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/lib/firebase/config';
import { Transaction, ApiResponse } from '@/types';
import { useTransactionStore } from '@/store/transaction-store';

interface UseTransactionsOptions {
  limit?: number;
  autoFetch?: boolean;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const { limit = 100, autoFetch = true } = options;
  const {
    transactions,
    isLoading,
    error,
    setTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setLoading,
    setError,
  } = useTransactionStore();

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Tidak terautentikasi');
      }

      const response = await fetch(`/api/transactions?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: ApiResponse<Transaction[]> = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Gagal mengambil data');
      }

      setTransactions(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit, setTransactions, setLoading, setError]);

  const createTransaction = useCallback(
    async (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          throw new Error('Tidak terautentikasi');
        }

        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const result: ApiResponse<{ id: string }> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Gagal menyimpan transaksi');
        }

        // Add to local state
        const newTransaction: Transaction = {
          ...data,
          id: result.data.id,
          userId: auth.currentUser!.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addTransaction(newTransaction);

        return result.data.id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addTransaction, setLoading, setError]
  );

  const editTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      setLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          throw new Error('Tidak terautentikasi');
        }

        const response = await fetch(`/api/transactions/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Gagal mengupdate transaksi');
        }

        updateTransaction(id, data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateTransaction, setLoading, setError]
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);

      try {
        const token = await auth.currentUser?.getIdToken();
        
        if (!token) {
          throw new Error('Tidak terautentikasi');
        }

        const response = await fetch(`/api/transactions/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result: ApiResponse = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Gagal menghapus transaksi');
        }

        deleteTransaction(id);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteTransaction, setLoading, setError]
  );

  useEffect(() => {
    if (autoFetch && auth.currentUser) {
      fetchTransactions();
    }
  }, [autoFetch, fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    editTransaction,
    removeTransaction,
  };
}
