'use client';

import { useMemo } from 'react';
import { useDashboard } from '@/lib/contexts/DashboardContext';
import { isWithinInterval } from 'date-fns';

export function useTransactions(userId: string | null, startDate?: Date, endDate?: Date) {
  const { transactions, loading, addTransaction } = useDashboard();

  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) return transactions;

    return transactions.filter((t) => {
      const txDate = t.date instanceof Date ? t.date : new Date(t.date);
      return isWithinInterval(txDate, { start: startDate, end: endDate });
    });
  }, [transactions, startDate, endDate]);

  return {
    transactions: filteredTransactions,
    loading,
    error: null,
    addTransaction,
  };
}
