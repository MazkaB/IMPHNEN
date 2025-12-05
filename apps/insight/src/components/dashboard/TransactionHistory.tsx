'use client';

import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { formatCurrency, formatDateTime } from '@/lib/utils/formatters';
import { Receipt, Mic, ScanLine, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

interface TransactionHistoryProps {
    transactions: Transaction[];
    loading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export default function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
    const [currentPage, setCurrentPage] = useState(0);

    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="skeleton h-16"></div>
                    ))}
                </div>
            </div>
        );
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'voice':
                return <Mic className="w-4 h-4" />;
            case 'ocr':
                return <ScanLine className="w-4 h-4" />;
            default:
                return <Edit className="w-4 h-4" />;
        }
    };

    const getSourceLabel = (source: string) => {
        switch (source) {
            case 'voice':
                return 'Suara';
            case 'ocr':
                return 'Scanner';
            default:
                return 'Manual';
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    const canGoPrevious = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1;

    const handlePrevious = () => {
        if (canGoPrevious) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNext = () => {
        if (canGoNext) {
            setCurrentPage(prev => prev + 1);
        }
    };

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Riwayat Transaksi
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {transactions.length} transaksi
                    </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-purple-400" />
                </div>
            </div>

            {/* Transactions List */}
            <div className="space-y-3">
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada transaksi</p>
                    </div>
                ) : (
                    currentTransactions.map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                        >
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-background border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Receipt className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                        {transaction.product}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {transaction.quantity} × {formatCurrency(transaction.pricePerItem)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(transaction.date)}
                                        </p>
                                        <span className={`badge ${transaction.source === 'voice'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : transaction.source === 'ocr'
                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                            } border px-2 py-0.5 rounded-full text-xs`}>
                                            <span className="flex items-center gap-1">
                                                {getSourceIcon(transaction.source)}
                                                <span>{getSourceLabel(transaction.source)}</span>
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                                <p className="font-bold text-foreground">
                                    {formatCurrency(transaction.totalAmount)}
                                </p>
                                <p className="text-xs text-emerald-400">
                                    +{formatCurrency(transaction.totalAmount - (transaction.costPerItem * transaction.quantity))}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {transactions.length > ITEMS_PER_PAGE && (
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <p className="text-sm text-muted-foreground">
                        Halaman {currentPage + 1} dari {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrevious}
                            disabled={!canGoPrevious}
                            className="btn btn-secondary flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!canGoNext}
                            className="btn btn-secondary flex items-center gap-1 px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
