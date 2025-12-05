'use client';

import { Download } from 'lucide-react';

export default function DataExportButton() {
    const handleExport = () => {
        try {
            // Get all localStorage data
            const products = localStorage.getItem('dashboard_products');
            const transactions = localStorage.getItem('dashboard_transactions');

            // Create export object
            const exportData = {
                exportDate: new Date().toISOString(),
                appName: 'Dashboard Insight',
                version: '1.0.0',
                data: {
                    products: products ? JSON.parse(products) : [],
                    transactions: transactions ? JSON.parse(transactions) : [],
                }
            };

            // Convert to JSON string with pretty formatting
            const jsonString = JSON.stringify(exportData, null, 2);

            // Create blob and download
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Show success message
            alert('✅ Data berhasil di-export!\n\nFile tersimpan di folder Downloads.');
        } catch (error) {
            console.error('Export error:', error);
            alert('❌ Gagal export data. Silakan coba lagi.');
        }
    };

    return (
        <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2"
            title="Download backup data sebagai JSON"
        >
            <Download className="w-4 h-4" />
            <span>Export Data</span>
        </button>
    );
}
