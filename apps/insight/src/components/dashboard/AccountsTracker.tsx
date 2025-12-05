'use client';

import { AccountReceivable, AccountPayable } from '@/types/analytics';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface AccountsTrackerProps {
    receivables: AccountReceivable[];
    payables: AccountPayable[];
    loading?: boolean;
}

export default function AccountsTracker({ receivables, payables, loading }: AccountsTrackerProps) {
    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="skeleton h-32"></div>
                    ))}
                </div>
            </div>
        );
    }

    const getStatusBadge = (dueDate: Date, status: string) => {
        if (status === 'paid') {
            return <span className="badge badge-success">Lunas</span>;
        }

        const daysUntilDue = differenceInDays(dueDate, new Date());

        if (daysUntilDue < 0) {
            return <span className="badge badge-danger">Jatuh Tempo</span>;
        } else if (daysUntilDue <= 3) {
            return <span className="badge badge-warning">Segera</span>;
        } else {
            return <span className="badge badge-success">Aktif</span>;
        }
    };

    const totalReceivables = receivables
        .filter(r => r.status !== 'paid')
        .reduce((sum, r) => sum + r.amount, 0);

    const totalPayables = payables
        .filter(p => p.status !== 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Piutang & Hutang
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Track pembayaran
                    </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Piutang (Accounts Receivable) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground">Piutang</h4>
                        <p className="text-sm font-bold text-emerald-400">
                            {formatCurrency(totalReceivables)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {receivables.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Tidak ada piutang
                            </p>
                        ) : (
                            receivables.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-muted rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {item.customerName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Jatuh tempo: {formatDate(item.dueDate, 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                        {getStatusBadge(item.dueDate, item.status)}
                                    </div>
                                    <p className="font-semibold text-emerald-400">
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Hutang (Accounts Payable) */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-foreground">Hutang</h4>
                        <p className="text-sm font-bold text-rose-400">
                            {formatCurrency(totalPayables)}
                        </p>
                    </div>

                    <div className="space-y-3">
                        {payables.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Tidak ada hutang
                            </p>
                        ) : (
                            payables.slice(0, 5).map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-muted rounded-lg"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground truncate">
                                                {item.supplierName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Jatuh tempo: {formatDate(item.dueDate, 'dd MMM yyyy')}
                                            </p>
                                        </div>
                                        {getStatusBadge(item.dueDate, item.status)}
                                    </div>
                                    <p className="font-semibold text-rose-400">
                                        {formatCurrency(item.amount)}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Net Piutang-Hutang</p>
                        <p className={`text-lg font-bold ${totalReceivables - totalPayables >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                            }`}>
                            {formatCurrency(totalReceivables - totalPayables)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Akun</p>
                        <p className="text-lg font-bold text-foreground">
                            {receivables.length + payables.length}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
