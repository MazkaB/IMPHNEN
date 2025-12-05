'use client';

import { BestSellerData } from '@/types/analytics';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Trophy, TrendingUp } from 'lucide-react';

interface BestSellerWidgetProps {
    data: BestSellerData[];
    loading?: boolean;
}

export default function BestSellerWidget({ data, loading }: BestSellerWidgetProps) {
    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-40 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-16"></div>
                    ))}
                </div>
            </div>
        );
    }

    const maxRevenue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 0;

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Produk Terlaris
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Top 5 penjualan terbaik
                    </p>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
            </div>

            {/* Best Sellers List */}
            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada data penjualan</p>
                    </div>
                ) : (
                    data.map((item, index) => (
                        <div key={item.productId} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-purple-500/20 text-purple-400">
                                        <span className="font-bold text-sm">{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">
                                            {item.productName}
                                        </p>
                                        <p className="text-xs text-foreground/60">
                                            {formatNumber(item.quantitySold)} terjual
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-foreground">
                                        {formatCurrency(item.revenue)}
                                    </p>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                                    style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            {data.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-foreground/70">Total Pendapatan</p>
                        <p className="text-lg font-bold text-foreground">
                            {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
