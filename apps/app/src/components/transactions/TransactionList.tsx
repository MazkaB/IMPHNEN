'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/firebase/config';
import { getUserTransactions, deleteTransaction } from '@/lib/firebase/transaction-service';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Mic,
  FileText,
  MessageCircle,
  Edit2,
  Trash2,
  Loader2,
} from 'lucide-react';

interface TransactionListProps {
  limit?: number;
  showActions?: boolean;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (id: string) => void;
}

export function TransactionList({
  limit = 10,
  showActions = true,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [limit]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const userId = auth.currentUser?.uid;
      
      if (!userId) {
        throw new Error('Tidak terautentikasi');
      }

      const data = await getUserTransactions(userId, limit);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      onDelete?.(id);
    } catch (err) {
      alert('Gagal menghapus transaksi');
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'voice':
        return <Mic className="w-4 h-4" />;
      case 'ocr':
        return <FileText className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-500">Memuat transaksi...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchTransactions} variant="secondary" size="sm">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Belum ada transaksi</p>
          <p className="text-sm text-gray-400 mt-1">
            Mulai catat transaksi pertama Anda!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2 sm:space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div
                  className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {transaction.description}
                  </p>
                  <div className="flex items-center flex-wrap gap-x-1 sm:gap-x-2 text-[10px] sm:text-xs text-gray-500">
                    <span>{transaction.category}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{formatDate(transaction.createdAt)}</span>
                    {transaction.source !== 'manual' && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:flex items-center">
                          {getSourceIcon(transaction.source)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                <span
                  className={`font-semibold text-xs sm:text-base ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  <span className="hidden sm:inline">Rp </span>{transaction.amount.toLocaleString('id-ID')}
                </span>

                {showActions && (
                  <div className="hidden sm:flex space-x-1">
                    <button
                      onClick={() => onEdit?.(transaction)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
                      aria-label="Edit transaksi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      aria-label="Hapus transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
