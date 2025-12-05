'use client';

import { ProfitLossData } from '@/types/analytics';
import { formatCurrency, formatPercentage } from '@/lib/utils/formatters';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ProfitLossCardProps {
    data: ProfitLossData;
    loading?: boolean;
}

export default function ProfitLossCard({ data, loading }: ProfitLossCardProps) {
    if (loading) {
        return (
            <div className="card p-6 space-y-4">
                <div className="skeleton h-6 w-32"></div>
                <div className="skeleton h-10 w-48"></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="skeleton h-16"></div>
                    <div className="skeleton h-16"></div>
                </div>
            </div>
        );
    }

    const isProfit = data.netProfit >= 0;

    return (
        <div className="card p-6 space-y-4 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                    Laba/Rugi
                </h3>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
            </div>

            {/* Main Profit/Loss */}
            <div>
                <p className="text-sm text-muted-foreground mb-1">Net Profit</p>
                <div className="flex items-baseline gap-2">
                    <h2 className={`text-3xl font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {formatCurrency(data.netProfit)}
                    </h2>
                    <div className={`flex items-center gap-1 text-sm font-medium ${isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {isProfit ? (
                            <TrendingUp className="w-4 h-4" />
                        ) : (
                            <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{formatPercentage(Math.abs(data.profitMargin))}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{data.period}</p>
            </div>

            {/* Revenue & Cost */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Pendapatan</p>
                    <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(data.totalRevenue)}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Modal</p>
                    <p className="text-lg font-semibold text-foreground">
                        {formatCurrency(data.totalCost)}
                    </p>
                </div>
            </div>
        </div>
    );
}
