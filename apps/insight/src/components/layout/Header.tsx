import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, AlertTriangle, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/hooks/useProducts';

interface HeaderProps {
    onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { user } = useAuth();
    const { products } = useProducts(user?.uid || null);
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter low stock products
    const lowStockProducts = products.filter(p => (p.currentStock || 0) <= p.minStock);
    const hasNotifications = lowStockProducts.length > 0;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-card border-b border-border sticky top-0 z-30 backdrop-blur-sm bg-card/95">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden"
                    >
                        <Menu className="w-6 h-6 text-muted-foreground" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitor dan analisis bisnis Anda
                        </p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2" ref={dropdownRef}>
                    <div className="relative">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                            {theme === 'dark' ? (
                                <Sun className="w-6 h-6 text-muted-foreground" />
                            ) : (
                                <Moon className="w-6 h-6 text-muted-foreground" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
                        >
                            <Bell className="w-6 h-6 text-muted-foreground" />
                            {hasNotifications && (
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border-2 border-background"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up origin-top-right">
                                <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                        Notifikasi
                                        {hasNotifications && (
                                            <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-0.5 rounded-full border border-rose-500/30">
                                                {lowStockProducts.length}
                                            </span>
                                        )}
                                    </h3>
                                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
                                    {lowStockProducts.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Bell className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground text-sm">Tidak ada notifikasi baru</p>
                                            <p className="text-muted-foreground/70 text-xs mt-1">Semua stok produk aman</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-border">
                                            {lowStockProducts.map(product => (
                                                <div key={product.id} className="p-4 hover:bg-secondary/50 transition-colors">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-rose-500/10 rounded-lg flex-shrink-0">
                                                            <AlertTriangle className="w-5 h-5 text-rose-500" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-foreground truncate">Stok Menipis: {product.name}</p>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Sisa stok: <span className="text-rose-400 font-bold">{product.currentStock || 0}</span>
                                                                <span className="mx-1">•</span>
                                                                Min: {product.minStock}
                                                            </p>
                                                        </div>
                                                        <div className="w-2 h-2 bg-rose-500 rounded-full mt-2"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {hasNotifications && (
                                    <div className="p-3 bg-secondary/30 border-t border-border text-center">
                                        <a href="/products" className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                                            Lihat Semua Produk
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
