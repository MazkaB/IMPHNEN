# NUSA AI - Dashboard Insight

Dashboard analytics real-time untuk monitoring performa bisnis UMKM.

## Fitur

- 📊 Profit/Loss Card - Laba rugi real-time
- 📈 Sales Trend Chart - Grafik tren penjualan
- 🏆 Best Seller Widget - Produk terlaris
- 📝 Transaction History - Riwayat transaksi
- 💰 Accounts Tracker - Piutang & Hutang
- 💡 Price Recommendation - Rekomendasi harga AI
- 🛒 Purchase Recommendation - Rekomendasi pembelian
- 📦 Product Stock Overview - Overview stok produk

## Tech Stack

- **Framework**: Next.js 15.1.3, React 19
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.15
- **Date**: date-fns 4.1
- **Database**: Firebase Firestore
- **Export**: xlsx

## Pages

| Route | Description |
|-------|-------------|
| `/` | Redirect ke dashboard |
| `/dashboard` | Main dashboard dengan carousel |
| `/analytics` | Halaman analytics detail |
| `/transactions` | Manajemen transaksi |
| `/products` | Manajemen produk |

## Setup

```bash
# Dari root monorepo
npm install
npm run dev:insight
```

Dashboard akan berjalan di http://localhost:3003

## Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

## Components

### Dashboard Components
- `ProfitLossCard` - Kartu laba/rugi
- `SalesTrendChart` - Chart tren penjualan
- `BestSellerWidget` - Widget produk terlaris
- `TransactionHistory` - Riwayat transaksi
- `AccountsTracker` - Tracker piutang/hutang
- `PriceRecommendation` - Rekomendasi harga
- `PurchaseRecommendation` - Rekomendasi pembelian
- `ProductStockOverview` - Overview stok
- `DashboardCarousel` - Carousel dashboard

### Layout Components
- `DashboardLayout` - Layout utama
- `Header` - Header dengan user info
- `Sidebar` - Sidebar navigasi

### Modals
- `AddProductModal` - Modal tambah produk
- `AddTransactionModal` - Modal tambah transaksi
