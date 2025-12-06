'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { auth } from '@/lib/firebase/config';
import { getTransactionSummary } from '@/lib/firebase/transaction-service';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Activity,
  Mic,
  FileText,
  BarChart3,
  Image,
} from 'lucide-react';
import Link from 'next/link';

interface Summary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

import { getOcrUrl, getInsightUrl, getContentUrl } from '@/lib/urls';

const quickActions = [
  { href: '/voice', label: 'Catat Suara', icon: Mic, color: 'bg-blue-500', external: false },
  { href: getOcrUrl(), label: 'Scan Struk', icon: FileText, color: 'bg-green-500', external: true },
  { href: getInsightUrl(), label: 'Lihat Insight', icon: BarChart3, color: 'bg-purple-500', external: true },
  { href: `${getContentUrl()}/content-creator`, label: 'Buat Konten', icon: Image, color: 'bg-orange-500', external: true },
];

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchSummary();
  }, [refreshKey]);

  const fetchSummary = async () => {
    try {
      const userId = auth?.currentUser?.uid;
      if (!userId) return;

      const data = await getTransactionSummary(userId);
      setSummary(data);
    } catch (error) {
      // Silent fail - summary will show 0
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransactionSaved = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Halo, {profile?.displayName}! 👋
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          {profile?.businessName
            ? `Dashboard ${profile.businessName}`
            : 'Selamat datang di Pembukuan AI'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Total Pemasukan</p>
                <p className="text-base sm:text-xl font-bold text-green-600 truncate">
                  {isLoading ? '...' : `Rp ${(summary?.totalIncome || 0).toLocaleString('id-ID')}`}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-full flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Total Pengeluaran</p>
                <p className="text-base sm:text-xl font-bold text-red-600 truncate">
                  {isLoading ? '...' : `Rp ${(summary?.totalExpense || 0).toLocaleString('id-ID')}`}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Profit Bersih</p>
                <p className={`text-base sm:text-xl font-bold truncate ${(summary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {isLoading ? '...' : `Rp ${(summary?.netProfit || 0).toLocaleString('id-ID')}`}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full flex-shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Total Transaksi</p>
                <p className="text-base sm:text-xl font-bold text-gray-900">
                  {isLoading ? '...' : summary?.transactionCount || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gray-100 rounded-full flex-shrink-0">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {quickActions.map((action) => {
              const LinkComponent = action.external ? 'a' : Link;
              const linkProps = action.external 
                ? { href: action.href, target: '_blank', rel: 'noopener noreferrer' }
                : { href: action.href };
              return (
                <LinkComponent
                  key={action.href}
                  {...linkProps}
                  className="flex flex-col items-center p-2 sm:p-4 rounded-lg border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
                >
                  <div className={`p-2 sm:p-3 rounded-full ${action.color} mb-1 sm:mb-2`}>
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-sm font-medium text-gray-700 text-center">
                    {action.label}
                  </span>
                </LinkComponent>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Voice Recorder */}
        <VoiceRecorder onTransactionSaved={handleTransactionSaved} />

        {/* Manual Form */}
        <TransactionForm onSuccess={handleTransactionSaved} />
      </div>

      {/* Transaction List */}
      <TransactionList key={refreshKey} limit={10} />
    </div>
  );
}
