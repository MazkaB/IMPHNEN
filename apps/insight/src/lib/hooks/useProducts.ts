'use client';

import { useDashboard } from '@/lib/contexts/DashboardContext';

export function useProducts(userId: string | null) {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useDashboard();

  return {
    products,
    loading,
    error: null,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
