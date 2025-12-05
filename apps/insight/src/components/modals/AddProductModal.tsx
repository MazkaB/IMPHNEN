'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (product: any) => void;
    initialData?: any;
}

export default function AddProductModal({ isOpen, onClose, onAdd, initialData }: AddProductModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Minuman',
        sellingPrice: '',
        costPrice: '',
        stock: '',
        minStock: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset or populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name,
                    category: initialData.category,
                    sellingPrice: initialData.sellingPrice.toString(),
                    costPrice: initialData.costPrice.toString(),
                    stock: initialData.currentStock.toString(),
                    minStock: initialData.minStock.toString(),
                });
            } else {
                setFormData({
                    name: '',
                    category: 'Minuman',
                    sellingPrice: '',
                    costPrice: '',
                    stock: '',
                    minStock: '',
                });
            }
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama produk harus diisi';
        }

        const sellingPrice = parseFloat(formData.sellingPrice);
        const costPrice = parseFloat(formData.costPrice);
        const stock = parseInt(formData.stock);
        const minStock = parseInt(formData.minStock);

        if (!formData.sellingPrice || sellingPrice <= 0) {
            newErrors.sellingPrice = 'Harga jual harus lebih dari 0';
        }

        if (!formData.costPrice || costPrice <= 0) {
            newErrors.costPrice = 'Harga modal harus lebih dari 0';
        }

        if (sellingPrice <= costPrice) {
            newErrors.sellingPrice = 'Harga jual harus lebih tinggi dari harga modal';
        }

        if (!formData.stock || stock < 0) {
            newErrors.stock = 'Stok harus 0 atau lebih';
        }

        if (!formData.minStock || minStock <= 0) {
            newErrors.minStock = 'Minimum stok harus lebih dari 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        const productData = {
            name: formData.name.trim(),
            category: formData.category,
            sellingPrice: parseFloat(formData.sellingPrice),
            costPrice: parseFloat(formData.costPrice),
            currentStock: parseInt(formData.stock),
            minStock: parseInt(formData.minStock),
            image: null,
        };

        if (initialData) {
            // Edit mode: pass updated data with existing ID
            onAdd({ ...initialData, ...productData });
        } else {
            // Add mode: create new ID
            onAdd({
                id: `PRD-${Date.now().toString().slice(-3)}`,
                ...productData
            });
        }

        onClose();
    };

    if (!isOpen) return null;

    const profitMargin = formData.sellingPrice && formData.costPrice
        ? (((parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice)) / parseFloat(formData.sellingPrice)) * 100).toFixed(1)
        : '0';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background rounded-t-2xl z-10">
                    <h2 className="text-2xl font-bold text-foreground">{initialData ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Product Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                            Nama Produk <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            autoComplete="off"
                            className={`w-full px-4 py-3 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.name ? 'border-rose-500' : 'border-border'
                                }`}
                            placeholder="Contoh: Kopi Arabica Premium"
                        />
                        {errors.name && <p className="text-sm text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                            Kategori <span className="text-rose-500">*</span>
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="Minuman">Minuman</option>
                            <option value="Makanan">Makanan</option>
                            <option value="Snack">Snack</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="costPrice" className="block text-sm font-medium text-foreground mb-2">
                                Harga Modal <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.costPrice ? 'border-rose-500' : 'border-border'
                                    }`}
                                placeholder="15000"
                                min="0"
                                step="100"
                            />
                            {errors.costPrice && <p className="text-sm text-rose-500 mt-1">{errors.costPrice}</p>}
                        </div>

                        <div>
                            <label htmlFor="sellingPrice" className="block text-sm font-medium text-foreground mb-2">
                                Harga Jual <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="sellingPrice"
                                name="sellingPrice"
                                value={formData.sellingPrice}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.sellingPrice ? 'border-rose-500' : 'border-border'
                                    }`}
                                placeholder="25000"
                                min="0"
                                step="100"
                            />
                            {errors.sellingPrice && <p className="text-sm text-rose-500 mt-1">{errors.sellingPrice}</p>}
                        </div>
                    </div>

                    {/* Profit Margin Preview */}
                    {formData.sellingPrice && formData.costPrice && parseFloat(formData.sellingPrice) > parseFloat(formData.costPrice) && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-300">Margin Keuntungan</span>
                                <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{profitMargin}%</span>
                            </div>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                                Profit: {formatCurrency(parseFloat(formData.sellingPrice) - parseFloat(formData.costPrice))} per unit
                            </p>
                        </div>
                    )}

                    {/* Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium text-foreground mb-2">
                                Stok Awal <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.stock ? 'border-rose-500' : 'border-border'
                                    }`}
                                placeholder="50"
                                min="0"
                            />
                            {errors.stock && <p className="text-sm text-rose-500 mt-1">{errors.stock}</p>}
                        </div>

                        <div>
                            <label htmlFor="minStock" className="block text-sm font-medium text-foreground mb-2">
                                Minimum Stok <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                id="minStock"
                                name="minStock"
                                value={formData.minStock}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${errors.minStock ? 'border-rose-500' : 'border-border'
                                    }`}
                                placeholder="10"
                                min="1"
                            />
                            {errors.minStock && <p className="text-sm text-rose-500 mt-1">{errors.minStock}</p>}
                            <p className="text-xs text-muted-foreground mt-1">Peringatan stok rendah akan muncul di bawah nilai ini</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-secondary transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                        >
                            {initialData ? 'Simpan Perubahan' : 'Tambah Produk'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
