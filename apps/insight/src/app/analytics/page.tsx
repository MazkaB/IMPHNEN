'use client';

import { useMemo } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useProducts } from '@/lib/hooks/useProducts';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { id } from 'date-fns/locale';

export default function AnalyticsPage() {
    const { user } = useAuth();
    // Fetch all transactions for comprehensive analytics
    // In a real app, we might want to limit this range or paginate
    const { transactions, loading: transactionsLoading } = useTransactions(user?.uid || null);
    const { products, loading: productsLoading } = useProducts(user?.uid || null);

    const analyticsData = useMemo(() => {
        if (!transactions.length) return null;

        // 1. KPI Calculations
        const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const totalProfit = transactions.reduce((sum, t) => sum + (t.totalAmount - (t.costPerItem * t.quantity)), 0);
        const totalTransactions = transactions.length;
        const totalProductsSold = transactions.reduce((sum, t) => sum + t.quantity, 0);

        // Calculate previous month metrics for comparison (simplified)
        const now = new Date();
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const lastMonthTransactions = transactions.filter(t =>
            t.date >= lastMonthStart && t.date <= lastMonthEnd
        );

        const lastMonthRevenue = lastMonthTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
        const revenueGrowth = lastMonthRevenue ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

        // 2. Sales Trend (Last 6 Months)
        const sixMonthsAgo = subMonths(now, 5);
        const monthsInterval = eachMonthOfInterval({ start: sixMonthsAgo, end: now });

        const salesTrend = monthsInterval.map(month => {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);
            const monthTransactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);

            return {
                month: format(month, 'MMM', { locale: id }),
                revenue: monthTransactions.reduce((sum, t) => sum + t.totalAmount, 0),
                profit: monthTransactions.reduce((sum, t) => sum + (t.totalAmount - (t.costPerItem * t.quantity)), 0)
            };
        });

        // 3. Sales by Category
        const categorySales: Record<string, number> = {};
        transactions.forEach(t => {
            const product = products.find(p => p.name === t.product); // Match by name as ID might not link in mock
            const category = product?.category || 'Uncategorized';
            categorySales[category] = (categorySales[category] || 0) + t.totalAmount;
        });

        const categoryData = Object.entries(categorySales).map(([category, sales]) => ({
            category,
            sales
        })).sort((a, b) => b.sales - a.sales);

        // 4. Top Products
        const productPerformance: Record<string, { sold: number, revenue: number, profit: number }> = {};
        transactions.forEach(t => {
            if (!productPerformance[t.product]) {
                productPerformance[t.product] = { sold: 0, revenue: 0, profit: 0 };
            }
            productPerformance[t.product].sold += t.quantity;
            productPerformance[t.product].revenue += t.totalAmount;
            productPerformance[t.product].profit += (t.totalAmount - (t.costPerItem * t.quantity));
        });

        const topProducts = Object.entries(productPerformance)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 5)
            .map((item, index) => ({ rank: index + 1, ...item }));

        return {
            totalRevenue,
            totalProfit,
            totalTransactions,
            totalProductsSold,
            revenueGrowth,
            salesTrend,
            categoryData,
            topProducts
        };
    }, [transactions, products]);

    if (transactionsLoading || productsLoading) {
        return (
            <ProtectedRoute>
                <DashboardLayout>
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    // Default empty state if no data
    const data = analyticsData || {
        totalRevenue: 0,
        totalProfit: 0,
        totalTransactions: 0,
        totalProductsSold: 0,
        revenueGrowth: 0,
        salesTrend: [],
        categoryData: [],
        topProducts: []
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="animate-fade-in-up">
                        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
                        <p className="text-muted-foreground mt-1">Analisis mendalam performa bisnis Anda</p>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Total Penjualan</p>
                                    <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(data.totalRevenue)}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                                        0,0% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-primary-500/20 flex items-center justify-center">
                                    <DollarSign className="w-7 h-7 text-primary-400" />
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Total Profit</p>
                                    <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(data.totalProfit)}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                                        0,0% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Produk Terjual</p>
                                    <h3 className="text-2xl font-bold text-foreground mt-1">{data.totalProductsSold}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                                        0,0% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                                    <Package className="w-7 h-7 text-amber-400" />
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">Total Transaksi</p>
                                    <h3 className="text-2xl font-bold text-foreground mt-1">{data.totalTransactions}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                                        0,0% vs bulan lalu
                                    </p>
                                </div>
                                <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <ShoppingCart className="w-7 h-7 text-purple-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Revenue & Profit Trend */}
                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Tren Pendapatan & Profit</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={data.salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Rupiah', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                                        tickFormatter={(value) => {
                                            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Jt`;
                                            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}`;
                                            return value.toString();
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            color: 'hsl(var(--popover-foreground))'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} strokeWidth={2} name="Pendapatan" />
                                    <Area type="monotone" dataKey="profit" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} name="Profit" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Sales by Category */}
                        <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Penjualan per Kategori</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.categoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" opacity={0.3} />
                                    <XAxis dataKey="category" stroke="#94a3b8" />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'Rupiah', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                                        tickFormatter={(value) => {
                                            if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}Jt`;
                                            if (value >= 1_000) return `${(value / 1_000).toFixed(0)}`;
                                            return value.toString();
                                        }}
                                    />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value as number)}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            color: 'hsl(var(--popover-foreground))'
                                        }}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="sales" fill="#a855f7" radius={[8, 8, 0, 0]} name="Penjualan" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products Table */}
                    <div className="card p-6 hover-lift animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 Produk Terlaris</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Rank</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Produk</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Terjual</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Pendapatan</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.topProducts.map((item) => (
                                        <tr key={item.rank} className="border-b border-border hover:bg-secondary/50">
                                            <td className="py-3 px-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 font-semibold">
                                                    {item.rank}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-foreground">{item.name}</td>
                                            <td className="py-3 px-4 text-right text-muted-foreground">{item.sold}</td>
                                            <td className="py-3 px-4 text-right font-medium text-foreground">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                                                {formatCurrency(item.profit)}
                                            </td>
                                        </tr>
                                    ))}
                                    {data.topProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                                Belum ada data penjualan
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
