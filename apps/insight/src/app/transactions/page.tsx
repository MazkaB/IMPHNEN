'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTransactions } from '@/lib/hooks/useTransactions';
import AddTransactionModal from '@/components/modals/AddTransactionModal';
import { Search, Filter, Download, Eye, Plus, CheckCircle } from 'lucide-react';
import { formatCurrency, formatDate, formatTime } from '@/lib/utils/formatters';
import { exportTransactionsToExcel } from '@/lib/utils/exportExcel';

export default function TransactionsPage() {
    const { user } = useAuth();
    const { transactions, loading, addTransaction } = useTransactions(user?.uid || null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const ITEMS_PER_PAGE = 10;

    const handleAddTransaction = async (newTransaction: any) => {
        try {
            await addTransaction(newTransaction);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setCurrentPage(1); // Reset to first page
        } catch (error) {
            console.error('Failed to add transaction:', error);
            alert('Gagal menyimpan transaksi');
        }
    };

    const getSourceBadge = (source: string) => {
        const styles: Record<string, string> = {
            manual: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            voice: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
            ocr: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        };
        const labels: Record<string, string> = {
            manual: 'Manual',
            voice: 'Suara',
            ocr: 'Scanner',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${styles[source] || 'bg-slate-700 text-muted-foreground'}`}>
                {labels[source] || source}
            </span>
        );
    };

    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalProfit = transactions.reduce((sum, t) => sum + (t.totalAmount - (t.costPerItem * t.quantity)), 0);

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const query = searchQuery.toLowerCase();
        return (
            t.product.toLowerCase().includes(query) ||
            (t as any).customer?.toLowerCase().includes(query) ||
            t.id.toLowerCase().includes(query)
        );
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayedTransactions = filteredTransactions.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6 relative">
                    {/* Toast Notification */}
                    {showToast && (
                        <div className="fixed top-4 right-4 z-50 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
                            <CheckCircle className="w-5 h-5" />
                            Transaksi berhasil ditambahkan
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Transaksi</h1>
                            <p className="text-muted-foreground mt-1">Kelola dan pantau semua transaksi Anda</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportTransactionsToExcel(transactions)}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Export Excel
                            </button>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Transaksi
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Total Transaksi</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{transactions.length}</h3>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Total Profit</p>
                            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{formatCurrency(totalProfit)}</h3>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Cari transaksi, produk, customer..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1); // Reset to first page on search
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary text-foreground"
                                />
                            </div>
                            <button className="btn btn-secondary flex items-center gap-2">
                                <Filter className="w-5 h-5" />
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Transactions Table */}
                    <div className="card p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-border">
                                    <tr>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tanggal & Waktu</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Produk</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Customer</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Qty</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Total</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Profit</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Sumber</th>
                                        <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-border hover:bg-secondary/50">
                                            <td className="py-3 px-4 font-mono text-sm text-foreground">{transaction.id}</td>
                                            <td className="py-3 px-4 text-sm text-foreground">
                                                <div>{formatDate(transaction.date)}</div>
                                                <div className="text-xs text-muted-foreground/70">{formatTime(transaction.date)}</div>
                                            </td>
                                            <td className="py-3 px-4 font-medium text-foreground">{transaction.product}</td>
                                            <td className="py-3 px-4 text-sm text-foreground">
                                                {/* @ts-ignore - customer might not be in interface yet but is in data */}
                                                {(transaction as any).customer || 'Customer'}
                                            </td>
                                            <td className="py-3 px-4 text-right text-foreground">{transaction.quantity}</td>
                                            <td className="py-3 px-4 text-right font-medium text-foreground">
                                                {formatCurrency(transaction.totalAmount)}
                                            </td>
                                            <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                                                {formatCurrency(transaction.totalAmount - (transaction.costPerItem * transaction.quantity))}
                                            </td>
                                            <td className="py-3 px-4">{getSourceBadge(transaction.source)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                                                    <Eye className="w-5 h-5 text-muted-foreground" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Menampilkan {filteredTransactions.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredTransactions.length)} dari {filteredTransactions.length} transaksi
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Add Transaction Modal */}
                    <AddTransactionModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAdd={handleAddTransaction}
                    />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}

