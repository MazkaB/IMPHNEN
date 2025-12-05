'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddProductModal from '@/components/modals/AddProductModal';
import { Search, Plus, Edit, Trash2, AlertTriangle, Download, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';
import { exportProductsToExcel } from '@/lib/utils/exportExcel';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/hooks/useProducts';

export default function ProductsPage() {
    const { user } = useAuth();
    const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts(user?.uid || null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);

    const handleDeleteProduct = async (id: string, name: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus produk "${name}"?`)) {
            try {
                await deleteProduct(id);
                setToastMessage('Produk berhasil dihapus');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            } catch (error) {
                alert('Gagal menghapus produk: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        }
    };

    const handleSaveProduct = async (productData: any) => {
        try {
            if (editingProduct) {
                await updateProduct(productData.id, productData);
                setToastMessage('Produk berhasil diperbarui');
            } else {
                await addProduct(productData);
                setToastMessage('Produk berhasil ditambahkan');
            }
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            setEditingProduct(null);
        } catch {
            alert('Gagal menyimpan produk');
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const getStockStatus = (stock: number, minStock: number) => {
        const percentage = (stock / minStock) * 100;
        if (stock < minStock) {
            return { label: 'Stok Rendah', color: 'text-danger-600 bg-danger-100', icon: true };
        } else if (percentage < 150) {
            return { label: 'Perlu Restock', color: 'text-warning-600 bg-warning-100', icon: false };
        }
        return { label: 'Stok Aman', color: 'text-success-600 bg-success-100', icon: false };
    };

    const totalValue = products.reduce((sum, p) => sum + ((p.currentStock || 0) * p.sellingPrice), 0);
    const lowStockCount = products.filter(p => (p.currentStock || 0) < p.minStock).length;

    // Filter products
    const filteredProducts = products.filter(p => {
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
    });

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="space-y-6 relative">
                    {/* Toast Notification */}
                    {showToast && (
                        <div className="fixed top-4 right-4 z-50 bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-down">
                            <CheckCircle className="w-5 h-5" />
                            {toastMessage}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Produk</h1>
                            <p className="text-muted-foreground mt-1">Kelola katalog produk Anda</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportProductsToExcel(products)}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Export Excel
                            </button>
                            <button
                                onClick={openAddModal}
                                className="btn btn-primary flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Tambah Produk
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Total Produk</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{products.length}</h3>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Nilai Inventori</p>
                            <h3 className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totalValue)}</h3>
                        </div>
                        <div className="card p-6">
                            <p className="text-sm text-muted-foreground">Stok Rendah</p>
                            <h3 className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-2">
                                {lowStockCount}
                                {lowStockCount > 0 && <AlertTriangle className="w-6 h-6" />}
                            </h3>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="card p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari produk berdasarkan nama atau kategori..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary text-foreground"
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product.currentStock || 0, product.minStock);
                            const profitMargin = ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100).toFixed(1);

                            return (
                                <div key={product.id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                                    {/* Product Image Placeholder */}
                                    <div className="h-48 bg-secondary flex items-center justify-center">
                                        <div className="text-6xl">📦</div>
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{product.category}</p>
                                                </div>
                                                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                                                    {product.id}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price Info */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Harga Jual:</span>
                                                <span className="font-semibold text-foreground">{formatCurrency(product.sellingPrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Harga Modal:</span>
                                                <span className="text-muted-foreground">{formatCurrency(product.costPrice)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">Margin:</span>
                                                <span className="font-semibold text-emerald-400">{profitMargin}%</span>
                                            </div>
                                        </div>

                                        {/* Stock Info */}
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Stok:</span>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                        {stockStatus.icon && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                                        {stockStatus.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${product.currentStock < product.minStock
                                                            ? 'bg-rose-500'
                                                            : product.currentStock < product.minStock * 1.5
                                                                ? 'bg-amber-500'
                                                                : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${Math.min(((product.currentStock || 0) / product.minStock) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-semibold text-foreground">{product.currentStock || 0}</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Min. stok: {product.minStock}</p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-4 border-t">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="flex-1 btn btn-secondary flex items-center justify-center gap-2"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                                className="px-4 btn btn-danger flex items-center justify-center"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Add Product Modal */}
                    <AddProductModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onAdd={handleSaveProduct}
                        initialData={editingProduct}
                    />
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}


