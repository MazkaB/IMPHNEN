'use client';

import { PriceRecommendationData } from '@/types/analytics';
import { formatCurrency } from '@/lib/utils/formatters';
import { Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';

interface PriceRecommendationProps {
    data: PriceRecommendationData[];
    loading?: boolean;
}

export default function PriceRecommendation({ data, loading }: PriceRecommendationProps) {
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
                        Rekomendasi Harga
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        AI-powered price optimization
                    </p>
                </div>
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
                {data.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada rekomendasi harga</p>
                    </div>
                ) : (
                    data.map((item) => {
                        const priceDiff = item.recommendedPrice - item.currentPrice;
                        const isIncrease = priceDiff > 0;
                        const percentChange = ((priceDiff / item.currentPrice) * 100).toFixed(1);

                        return (
                            <div
                                key={item.productId}
                                className="p-4 bg-muted rounded-lg space-y-3"
                            >
                                {/* Product Name */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-foreground">
                                            {item.productName}
                                        </h4>
                                        <span className={`badge ${isIncrease ? 'badge-success' : priceDiff === 0 ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : 'badge-warning'}`}>
                                            <span className="flex items-center gap-1">
                                                {priceDiff === 0 ? (
                                                    '='
                                                ) : isIncrease ? (
                                                    <TrendingUp className="w-3 h-3" />
                                                ) : (
                                                    <TrendingDown className="w-3 h-3" />
                                                )}
                                                {isIncrease ? '+' : ''}{percentChange}%
                                            </span>
                                        </span>
                                    </div>
                                </div>

                                {/* Price Comparison */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-foreground/70 mb-1">
                                            Harga Sekarang
                                        </p>
                                        <p className="text-lg font-semibold text-foreground">
                                            {formatCurrency(item.currentPrice)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-foreground/70 mb-1">
                                            Harga Rekomen
                                        </p>
                                        <p className="text-lg font-semibold text-emerald-400">
                                            {formatCurrency(item.recommendedPrice)}
                                        </p>
                                    </div>
                                </div>

                                {/* Reasoning */}
                                <div className="pt-3 border-t border-border">
                                    <p className="text-sm text-foreground/80">
                                        {item.reasoning}
                                    </p>
                                    <p className="text-xs text-foreground/60 mt-1">
                                        Potensi profit: {formatCurrency(item.potentialProfit)}/unit
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Info */}
            <div className="mt-6 p-3 bg-purple-100 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg">
                <p className="text-xs text-purple-700 dark:text-purple-300">
                    💡 Rekomendasi berdasarkan analisis data penjualan, margin keuntungan, dan tren pasar
                </p>
            </div>
        </div>
    );
}
