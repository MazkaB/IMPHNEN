'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useProducts } from '@/lib/hooks/useProducts';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { useAccounts } from '@/lib/hooks/useAccounts';
import ProfitLossCard from '@/components/dashboard/ProfitLossCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import BestSellerWidget from '@/components/dashboard/BestSellerWidget';
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import AccountsTracker from '@/components/dashboard/AccountsTracker';
import PriceRecommendation from '@/components/dashboard/PriceRecommendation';
import PurchaseRecommendation from '@/components/dashboard/PurchaseRecommendation';
import ProductStockOverview from '@/components/dashboard/ProductStockOverview';
import DashboardCarousel from '@/components/dashboard/DashboardCarousel';
import { Calendar, RefreshCw } from 'lucide-react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

type PeriodType = 'today' | 'week' | 'month';

export default function DashboardPage() {
    const { user } = useAuth();
    const [period, setPeriod] = useState<PeriodType>('month');
    const [refreshKey, setRefreshKey] = useState(0);

    // Get date range based on period
    const getDateRange = (period: PeriodType) => {
        const now = new Date();
        switch (period) {
            case 'today':
                return { start: startOfDay(now), end: endOfDay(now) };
            case 'week':
                return { start: startOfWeek(now), end: endOfWeek(now) };
            case 'month':
                return { start: startOfMonth(now), end: endOfMonth(now) };
        }
    };

    const { start, end } = getDateRange(period);

    // Fetch data
    const { transactions, loading: transactionsLoading } = useTransactions(user?.uid || null, start, end);
    const { products, loading: productsLoading } = useProducts(user?.uid || null);
    const { receivables, payables, loading: accountsLoading } = useAccounts(user?.uid || null);

    // Calculate analytics
    const {
        profitLoss,
        salesTrend,
        bestSellers,
        priceRecommendations,
        purchaseRecommendations,
    } = useAnalytics(transactions, products, period);

    const isLoading = transactionsLoading || productsLoading || accountsLoading;

    return (
        <ProtectedRoute>
            <DashboardLayout>
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Dashboard Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Monitor performa bisnis Anda secara real-time
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Period Selector */}
                        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1 border border-border">
                            <button
                                onClick={() => setPeriod('today')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'today'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Hari Ini
                            </button>
                            <button
                                onClick={() => setPeriod('week')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'week'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Minggu Ini
                            </button>
                            <button
                                onClick={() => setPeriod('month')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${period === 'month'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                Bulan Ini
                            </button>
                        </div>

                        {/* Refresh Button */}
                        <button
                            onClick={() => setRefreshKey(prev => prev + 1)}
                            className="btn btn-secondary flex items-center gap-2 whitespace-nowrap"
                            disabled={isLoading}
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Carousel - Compact Version */}
                <DashboardCarousel>
                    {/* Slide 1: Key Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ProfitLossCard data={profitLoss} loading={isLoading} />
                        <div className="lg:col-span-2">
                            <SalesTrendChart data={salesTrend} loading={isLoading} />
                        </div>
                    </div>

                    {/* Slide 2: Best Sellers & Transactions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <BestSellerWidget data={bestSellers} loading={isLoading} />
                        <TransactionHistory transactions={transactions} loading={isLoading} />
                    </div>

                    {/* Slide 3: Accounts & Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AccountsTracker
                            receivables={receivables}
                            payables={payables}
                            loading={isLoading}
                        />
                        <PriceRecommendation data={priceRecommendations} loading={isLoading} />
                    </div>

                    {/* Slide 4: Purchase & Stock */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <PurchaseRecommendation data={purchaseRecommendations} loading={isLoading} />
                        <ProductStockOverview products={products} loading={isLoading} />
                    </div>
                </DashboardCarousel>

                {/* Empty State */}
                {!isLoading && transactions.length === 0 && products.length === 0 && (
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Belum Ada Data
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Mulai tambahkan transaksi dan produk untuk melihat analytics dan insights bisnis Anda.
                        </p>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
