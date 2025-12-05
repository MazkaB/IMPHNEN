'use client';

import { useMemo } from 'react';
import { Transaction } from '@/types/transaction';
import { Product } from '@/types/product';
import {
  calculateProfitLoss,
  calculateSalesTrend,
  getBestSellers,
  getPriceRecommendation,
  getPurchaseRecommendation,
} from '@/lib/utils/calculations';
import { startOfDay, endOfDay, startOfWeek, startOfMonth } from 'date-fns';

export function useAnalytics(
  transactions: Transaction[],
  products: Product[],
  period: 'today' | 'week' | 'month' = 'month'
) {
  const { startDate, endDate } = useMemo(() => {
    const end = endOfDay(new Date());
    let start: Date;

    switch (period) {
      case 'today':
        start = startOfDay(new Date());
        break;
      case 'week':
        start = startOfWeek(new Date());
        break;
      case 'month':
        start = startOfMonth(new Date());
        break;
      default:
        start = startOfMonth(new Date());
    }

    return { startDate: start, endDate: end };
  }, [period]);

  const profitLoss = useMemo(() => {
    return calculateProfitLoss(transactions, startDate, endDate);
  }, [transactions, startDate, endDate]);

  const salesTrend = useMemo(() => {
    return calculateSalesTrend(transactions, startDate, endDate);
  }, [transactions, startDate, endDate]);

  const bestSellers = useMemo(() => {
    return getBestSellers(transactions, 5);
  }, [transactions]);

  const priceRecommendations = useMemo(() => {
    return products.slice(0, 5).map((product) => {
      return getPriceRecommendation(product, transactions);
    });
  }, [products, transactions]);

  const purchaseRecommendations = useMemo(() => {
    return getPurchaseRecommendation(products, transactions, 7);
  }, [products, transactions]);

  return {
    profitLoss,
    salesTrend,
    bestSellers,
    priceRecommendations,
    purchaseRecommendations,
  };
}
