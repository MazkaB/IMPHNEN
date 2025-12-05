'use client';

import { PurchaseRecommendationData } from '@/types/analytics';
import { formatNumber } from '@/lib/utils/formatters';
import { ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';

interface PurchaseRecommendationProps {
    data: PurchaseRecommendationData[];
    loading?: boolean;
}

export default function PurchaseRecommendation({ data, loading }: PurchaseRecommendationProps) {
    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton h-24"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Rekomendasi Pembelian
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Stock replenishment suggestions
                    </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-orange-400" />
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                            <TrendingUp className="w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="font-medium">Stok Aman!</p>
                        <p className="text-sm mt-1">Semua produk memiliki stok yang mencukupi</p>
                    </div>
                ) : (
                    data.map((item) => {
                        const urgencyLevel =
                            item.currentStock === 0
                                ? 'critical'
                                : item.salesVelocity / Math.max(item.currentStock, 1) > 1
                                    ? 'high'
                                    : 'medium';

                        return (
                            <div
                                key={item.productId}
                                className={`p-4 rounded-lg border-l-4 ${urgencyLevel === 'critical'
                                    ? 'bg-rose-500/10 border-rose-500'
                                    : urgencyLevel === 'high'
                                        ? 'bg-orange-500/10 border-orange-500'
                                        : 'bg-yellow-500/10 border-yellow-500'
                                    }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-foreground">
                                            {item.productName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`badge ${urgencyLevel === 'critical'
                                                ? 'badge-danger'
                                                : urgencyLevel === 'high'
                                                    ? 'badge-warning'
                                                    : 'badge-info'
                                                }`}>
                                                {urgencyLevel === 'critical' ? (
                                                    <span className="flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Kritis
                                                    </span>
                                                ) : urgencyLevel === 'high' ? (
                                                    'Prioritas Tinggi'
                                                ) : (
                                                    'Prioritas Sedang'
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Stok Saat Ini</p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {formatNumber(item.currentStock)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Penjualan/Hari</p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {formatNumber(item.salesVelocity, 1)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Rekomen Beli</p>
                                        <p className="text-lg font-bold text-purple-400">
                                            {formatNumber(item.recommendedQuantity)}
                                        </p>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="pt-3 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        {item.reasoning}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            {data.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Total Item Perlu Dipesan
                        </p>
                        <p className="text-xl font-bold text-purple-400">
                            {formatNumber(data.reduce((sum, item) => sum + item.recommendedQuantity, 0))}
                        </p>
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300">
                    📊 Rekomendasi berdasarkan sales velocity 7 hari ke depan
                </p>
            </div>
        </div>
    );
}
