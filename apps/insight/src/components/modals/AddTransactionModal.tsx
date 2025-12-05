'use client';

import { useState, useEffect } from 'react';
import { X, Upload, Mic, Edit3, Image as ImageIcon, Loader2, ScanLine } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (transaction: any) => void;
}

type InputMethod = 'manual' | 'ocr' | 'voice';

import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/hooks/useProducts';

export default function AddTransactionModal({ isOpen, onClose, onAdd }: AddTransactionModalProps) {
    const { user } = useAuth();
    const { products } = useProducts(user?.uid || null);

    const [activeTab, setActiveTab] = useState<InputMethod>('manual');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const [formData, setFormData] = useState({
        date: new Date().toISOString().slice(0, 16),
        productName: '',
        customer: '',
        quantity: 1,
        pricePerItem: 0,
        costPerItem: 0,
        source: 'manual',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-fill price when product selected
    useEffect(() => {
        const selectedProduct = products.find(p => p.name === formData.productName);
        if (selectedProduct) {
            setFormData(prev => ({
                ...prev,
                pricePerItem: selectedProduct.sellingPrice,
                costPerItem: selectedProduct.costPrice
            }));
        }
    }, [formData.productName, products]);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                productName: '',
                customer: '',
                quantity: 1,
                pricePerItem: 0,
                costPerItem: 0,
                source: 'manual',
            });
            setActiveTab('manual');
            setErrors({});
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.productName) newErrors.productName = 'Pilih produk';
        if (!formData.customer.trim()) newErrors.customer = 'Nama customer wajib diisi';
        if (formData.quantity < 1) newErrors.quantity = 'Jumlah minimal 1';
        if (formData.pricePerItem < 0) newErrors.pricePerItem = 'Harga tidak valid';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const total = formData.quantity * formData.pricePerItem;
        const totalCost = formData.quantity * formData.costPerItem;
        const profit = total - totalCost;

        const newTransaction = {
            id: `TRX-${Date.now().toString().slice(-4)}`,
            date: new Date(formData.date),
            product: formData.productName,
            customer: formData.customer,
            quantity: Number(formData.quantity),
            pricePerItem: Number(formData.pricePerItem),
            totalAmount: total,
            costPerItem: Number(formData.costPerItem),
            source: formData.source,
        };

        onAdd(newTransaction);
        onClose();
    };

    // Simulate OCR image processing
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);

        // Simulate OCR processing (2 seconds)
        setTimeout(() => {
            // Mock extracted data from receipt
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                productName: 'Kopi Arabica',
                customer: 'OCR Customer',
                quantity: 2,
                pricePerItem: 25000,
                costPerItem: 15000,
                source: 'ocr',
            });
            setIsProcessing(false);
            setActiveTab('manual'); // Switch to manual tab to show extracted data
        }, 2000);
    };

    // Simulate Voice Recording
    const handleVoiceRecord = () => {
        setIsRecording(true);

        // Simulate voice recognition (3 seconds)
        setTimeout(() => {
            // Mock recognized voice data
            setFormData({
                date: new Date().toISOString().slice(0, 16),
                productName: 'Teh Hijau',
                customer: 'Voice Customer',
                quantity: 3,
                pricePerItem: 15000,
                costPerItem: 8000,
                source: 'voice',
            });
            setIsRecording(false);
            setActiveTab('manual'); // Switch to manual tab to show recognized data
        }, 3000);
    };

    if (!isOpen) return null;

    const currentTotal = formData.quantity * formData.pricePerItem;
    const currentProfit = currentTotal - (formData.quantity * formData.costPerItem);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background rounded-t-2xl z-10">
                    <h2 className="text-2xl font-bold text-foreground">Tambah Transaksi</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 p-6 pb-0">
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 border ${activeTab === 'manual'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-amber-500/5 border-amber-500/20 text-amber-500/60 hover:bg-amber-500/10 hover:text-amber-400'
                            }`}
                    >
                        <Edit3 className="w-6 h-6" />
                        <span>Manual</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('voice')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 border ${activeTab === 'voice'
                            ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                            : 'bg-purple-500/5 border-purple-500/20 text-purple-500/60 hover:bg-purple-500/10 hover:text-purple-400'
                            }`}
                    >
                        <Mic className="w-6 h-6" />
                        <span>Suara</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ocr')}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 border ${activeTab === 'ocr'
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500/60 hover:bg-emerald-500/10 hover:text-emerald-400'
                            }`}
                    >
                        <ScanLine className="w-6 h-6" />
                        <span>Scanner</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Manual Input Tab */}
                    {activeTab === 'manual' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Source Badge */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">Metode Input:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${formData.source === 'manual' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                    formData.source === 'ocr' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    }`}>
                                    {formData.source === 'manual' ? 'Manual' :
                                        formData.source === 'ocr' ? 'OCR Scan' :
                                            'Voice AI'}
                                </span>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Tanggal & Waktu</label>
                                <input
                                    type="datetime-local"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            {/* Product */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Produk</label>
                                <select
                                    name="productName"
                                    value={formData.productName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:outline-none ${errors.productName ? 'border-rose-500' : 'border-border'
                                        }`}
                                >
                                    <option value="">-- Pilih Produk --</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.name}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.productName && <p className="text-xs text-rose-500 mt-1">{errors.productName}</p>}
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Nama Customer</label>
                                <input
                                    type="text"
                                    name="customer"
                                    value={formData.customer}
                                    onChange={handleChange}
                                    placeholder="Contoh: Budi Santoso"
                                    className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none ${errors.customer ? 'border-rose-500' : 'border-border'
                                        }`}
                                />
                                {errors.customer && <p className="text-xs text-rose-500 mt-1">{errors.customer}</p>}
                            </div>

                            {/* Quantity & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Jumlah (Qty)</label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Harga Satuan</label>
                                    <input
                                        type="number"
                                        name="pricePerItem"
                                        value={formData.pricePerItem}
                                        readOnly
                                        className="w-full px-4 py-2 border border-border bg-secondary/50 rounded-lg text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-secondary/50 p-4 rounded-lg border border-border space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Total Transaksi:</span>
                                    <span className="font-bold text-foreground">{formatCurrency(currentTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Estimasi Profit:</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(currentProfit)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-secondary transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all"
                                >
                                    Simpan Transaksi
                                </button>
                            </div>
                        </form>
                    )}

                    {/* OCR Tab */}
                    {activeTab === 'ocr' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-slate-400 mb-4">Upload foto nota atau struk untuk extract data otomatis</p>

                                {!isProcessing ? (
                                    <label className="cursor-pointer">
                                        <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 hover:border-purple-500 hover:bg-purple-500/10 transition-all">
                                            <Upload className="w-16 h-16 mx-auto text-slate-500 mb-4" />
                                            <p className="text-lg font-medium text-slate-300 mb-2">Klik untuk upload gambar</p>
                                            <p className="text-sm text-slate-500">Format: JPG, PNG (Max 5MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="border-2 border-purple-500 rounded-xl p-12 bg-purple-500/10">
                                        <Loader2 className="w-16 h-16 mx-auto text-purple-400 mb-4 animate-spin" />
                                        <p className="text-lg font-medium text-purple-300 mb-2">Memproses gambar...</p>
                                        <p className="text-sm text-purple-400">AI sedang mengekstrak data dari nota</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                                <p className="text-sm text-blue-300">
                                    <strong>💡 Tips:</strong> Pastikan gambar nota jelas dan tidak buram untuk hasil terbaik.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Voice Tab */}
                    {activeTab === 'voice' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-slate-400 mb-6">Rekam suara untuk input transaksi otomatis</p>

                                {!isRecording ? (
                                    <button
                                        onClick={handleVoiceRecord}
                                        className="mx-auto"
                                    >
                                        <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                            <Mic className="w-16 h-16 text-white" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-300 mt-6">Tap untuk mulai merekam</p>
                                    </button>
                                ) : (
                                    <div>
                                        <div className="w-32 h-32 bg-rose-600 rounded-full flex items-center justify-center mx-auto animate-pulse shadow-xl">
                                            <Mic className="w-16 h-16 text-white" />
                                        </div>
                                        <p className="text-lg font-medium text-rose-400 mt-6">Merekam...</p>
                                        <p className="text-sm text-slate-400 mt-2">AI mendengarkan input Anda</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-purple-300 font-medium">
                                    📝 Contoh perintah suara:
                                </p>
                                <ul className="text-sm text-purple-300/80 space-y-1 ml-4 list-disc">
                                    <li>"Jual 2 Kopi Arabica ke Budi Santoso"</li>
                                    <li>"Transaksi 3 Teh Hijau untuk Customer Walk-in"</li>
                                    <li>"Catat penjualan 5 Brownies"</li>
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
