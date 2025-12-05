'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { auth } from '@/lib/firebase/config';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType } from '@/types';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || !description || !category) {
      setError('Semua field wajib diisi');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah tidak valid');
      return;
    }

    setIsLoading(true);

    try {
      const token = await auth.currentUser?.getIdToken();
      
      if (!token) {
        throw new Error('Tidak terautentikasi');
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          amount: numAmount,
          description,
          category,
          source: 'manual',
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      onSuccess?.();
    } catch (err) {
      console.error('Create transaction error:', err);
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    if (!num) return '';
    return parseInt(num, 10).toLocaleString('id-ID');
  };

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="flex items-center text-base sm:text-lg">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Tambah Transaksi Manual
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-2 sm:p-3 rounded-lg text-xs sm:text-sm" role="alert">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div className="flex rounded-lg overflow-hidden border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory('');
              }}
              className={`flex-1 flex items-center justify-center py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowUpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory('');
              }}
              className={`flex-1 flex items-center justify-center py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Pengeluaran
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Jumlah (Rp)
            </label>
            <Input
              type="text"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatAmount(e.target.value))}
              className="text-base sm:text-lg font-semibold"
              inputMode="numeric"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <Input
              type="text"
              placeholder="Contoh: Penjualan bakso 50 porsi"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm sm:text-base"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full text-sm sm:text-base">
            Simpan Transaksi
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
