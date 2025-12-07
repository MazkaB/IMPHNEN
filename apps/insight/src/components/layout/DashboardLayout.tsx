'use client';

import { ReactNode } from 'react';
import { BarChart3, Home } from 'lucide-react';
import { getDashboardUrl } from '@/lib/urls';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Simple Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 dark:text-white">Insight AI</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Analytics Dashboard</p>
            </div>
          </div>
          <a
            href={getDashboardUrl()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-700 dark:text-slate-300"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Dashboard</span>
          </a>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-12">
        {children}
      </main>
    </div>
  );
}
