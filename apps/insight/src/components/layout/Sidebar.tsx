'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDashboard } from '@/lib/contexts/DashboardContext';
import {
    LayoutDashboard,
    TrendingUp,
    ShoppingCart,
    Package,
    LogOut,
    X,
    RefreshCw,
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
    const { user } = useAuth();
    const { refreshData } = useDashboard();
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        localStorage.clear();
        router.push('/login');
    };

    const handleNavigation = (path: string) => {
        if (isOpen) {
            onToggle();
        }
        window.location.href = path;
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: pathname === '/dashboard' },
        { icon: TrendingUp, label: 'Analytics', path: '/analytics', active: pathname === '/analytics' },
        { icon: ShoppingCart, label: 'Transaksi', path: '/transactions', active: pathname === '/transactions' },
        { icon: Package, label: 'Produk', path: '/products', active: pathname === '/products' },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-foreground">Dashboard</h2>
                                <p className="text-xs text-muted-foreground">Insight AI</p>
                            </div>
                        </div>
                        <button
                            onClick={onToggle}
                            className="lg:hidden p-1 rounded hover:bg-white/10"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold">
                                    {user?.email?.[0].toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {user?.email || 'User'}
                                </p>
                                <p className="text-xs text-muted-foreground">UMKM Owner</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                type="button"
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${item.active
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-border space-y-2">
                        <button
                            onClick={handleLogout}
                            type="button"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
