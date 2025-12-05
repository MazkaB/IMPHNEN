'use client';

import { useDashboard } from '@/lib/contexts/DashboardContext';

export function useAccounts(userId: string | null) {
  const { receivables, payables, loading } = useDashboard();

  return {
    receivables,
    payables,
    loading,
    error: null,
  };
}
