'use client';

import { Product } from '@/types/product';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';
import { Package, AlertTriangle } from 'lucide-react';

interface ProductStockOverviewProps {
    products: Product[];
    loading?: boolean;
}

export default function ProductStockOverview({ products, loading }: ProductStockOverviewProps) {
    if (loading) {
        return (
            <div className="card p-6">
                <div className="skeleton h-6 w-48 mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton h-20"></div>
                    ))}
                </div>
            </div>
        );
    }

    const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

    return (
        <div className="card p-6 card-hover">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">
                        Stok Produk
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Overview inventory
                    </p>
                </div>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-purple-400" />
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockCount > 0 && (
                <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-amber-300">
                            {lowStockCount} produk dengan stok rendah!
                        </p>
                    </div>
                </div>
            )}

            {/* Products List */}
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
                {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>Belum ada produk</p>
                    </div>
                ) : (
                    products.map((product) => {
                        const stockLevel = product.currentStock / Math.max(product.minStock, 1);
                        const isLowStock = product.currentStock <= product.minStock;

                        return (
                            <div
                                key={product.id}
                                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    {/* Product Image or Icon */}
                                    <div className="w-12 h-12 bg-muted border border-border rounded-lg flex items-center justify-center flex-shrink-0">
                                        {product.photoUrl ? (
                                            <img
                                                src={product.photoUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                        ) : (
                                            <Package className="w-6 h-6 text-slate-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        {/* Product Name & Category */}
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-foreground truncate">
                                                    {product.name}
                                                </h4>
                                                {product.category && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.category}
                                                    </p>
                                                )}
                                            </div>
                                            {isLowStock && (
                                                <span className="badge badge-warning ml-2">
                                                    <AlertTriangle className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>

                                        {/* Stock Info */}
                                        <div className="flex items-center gap-4 mb-2">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Stok</p>
                                                <p className={`text-sm font-semibold ${isLowStock
                                                    ? 'text-amber-400'
                                                    : 'text-foreground'
                                                    }`}>
                                                    {formatNumber(product.currentStock)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Harga Jual</p>
                                                <p className="text-sm font-semibold text-emerald-400">
                                                    {formatCurrency(product.sellingPrice)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Modal</p>
                                                <p className="text-sm font-semibold text-muted-foreground">
                                                    {formatCurrency(product.costPrice)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stock Bar */}
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${isLowStock
                                                    ? 'bg-amber-500'
                                                    : stockLevel > 2
                                                        ? 'bg-emerald-500'
                                                        : 'bg-purple-500'
                                                    }`}
                                                style={{
                                                    width: `${Math.min((product.currentStock / (product.minStock * 3)) * 100, 100)}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Summary */}
            {products.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Produk</p>
                            <p className="text-lg font-bold text-foreground">
                                {products.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Stok Rendah</p>
                            <p className="text-lg font-bold text-amber-400">
                                {lowStockCount}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">Total Nilai Stok</p>
                            <p className="text-lg font-bold text-emerald-400">
                                {formatCurrency(
                                    products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0)
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
