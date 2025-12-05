import * as XLSX from 'xlsx';

export function exportToExcel(data: any[], filename: string) {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportTransactionsToExcel(transactions: any[]) {
    const formattedData = transactions.map((t, index) => ({
        'No': index + 1,
        'ID': t.id,
        'Tanggal': new Date(t.date).toLocaleDateString('id-ID'),
        'Waktu': new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        'Produk': t.product,
        'Customer': t.customer || '-',
        'Qty': t.quantity,
        'Harga/Item': t.pricePerItem,
        'Total': t.total,
        'Profit': t.profit,
        'Sumber': t.source,
    }));

    exportToExcel(formattedData, 'Transaksi');
}

export function exportProductsToExcel(products: any[]) {
    const formattedData = products.map((p, index) => ({
        'No': index + 1,
        'ID': p.id,
        'Nama Produk': p.name,
        'Kategori': p.category,
        'Harga Jual': p.sellingPrice,
        'Harga Modal': p.costPrice,
        'Margin (%)': (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(2),
        'Stok': p.stock,
        'Min. Stok': p.minStock,
        'Status': p.stock < p.minStock ? 'Stok Rendah' : 'Stok Aman',
    }));

    exportToExcel(formattedData, 'Produk');
}
