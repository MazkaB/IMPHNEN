'use client';

import { SalesTrendData } from '@/types/analytics';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { TrendingUp } from 'lucide-react';

interface SalesTrendChartProps {
    data: SalesTrendData[];
    loading?: boolean;
}

export default function SalesTrendChart({ data, loading }: SalesTrendChartProps) {
    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-40 mb-4"></div>
                <div className="skeleton h-64"></div>
            </div>
        );
    }

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Tren Penjualan
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Pendapatan harian
                    </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Chart */}
            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <p>Belum ada data penjualan</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            opacity={0.5}
                            vertical={false}
                        />
                        <XAxis
                            dataKey="date"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => {
                                // Value is "dd MMM", take only "dd"
                                return value.split(' ')[0];
                            }}
                            label={{
                                value: new Date().toLocaleString('id-ID', { month: 'long' }),
                                position: 'insideBottom',
                                offset: -5,
                                style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }
                            }}
                        />
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
                            contentStyle={{
                                backgroundColor: 'hsl(var(--popover))',
                                borderColor: 'hsl(var(--border))',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                color: 'hsl(var(--popover-foreground))'
                            }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                            labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                            formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#a855f7"
                            strokeWidth={3}
                            fill="#a855f7"
                            fillOpacity={0.3}
                            dot={{
                                fill: '#a855f7',
                                strokeWidth: 2,
                                r: 5,
                                stroke: 'hsl(var(--background))'
                            }}
                            activeDot={{
                                r: 7,
                                fill: '#ec4899',
                                stroke: 'hsl(var(--background))',
                                strokeWidth: 2
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            )}

            {/* Stats */}
            {data.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Total Transaksi</p>
                        <p className="text-xl font-bold text-foreground">
                            {data.reduce((sum, d) => sum + d.transactions, 0)}
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Rata-rata/Hari</p>
                        <p className="text-xl font-bold text-foreground">
                            {formatCurrency(data.reduce((sum, d) => sum + d.revenue, 0) / data.length)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
