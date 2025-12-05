import { Transaction } from '@/types/transaction';
import { Product } from '@/types/product';
import {
    ProfitLossData,
    SalesTrendData,
    BestSellerData,
    PriceRecommendationData,
    PurchaseRecommendationData,
} from '@/types/analytics';
import { startOfDay, endOfDay, eachDayOfInterval, format, subDays, differenceInDays } from 'date-fns';

/**
 * Kalkulasi profit/loss dari transactions
 */
export function calculateProfitLoss(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
): ProfitLossData {
    const filteredTransactions = transactions.filter((t) => {
        const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
    });

    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalCost = filteredTransactions.reduce((sum, t) => sum + (t.costPerItem * t.quantity), 0);
    const netProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
        totalRevenue,
        totalCost,
        netProfit,
        profitMargin,
        period: `${format(startDate, 'dd MMM yyyy')} - ${format(endDate, 'dd MMM yyyy')}`,
    };
}

/**
 * Kalkulasi tren penjualan per periode
 */
export function calculateSalesTrend(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
): SalesTrendData[] {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);

        const dayTransactions = transactions.filter((t) => {
            const transactionDate = t.date instanceof Date ? t.date : new Date(t.date);
            return transactionDate >= dayStart && transactionDate <= dayEnd;
        });

        const revenue = dayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);

        return {
            date: format(day, 'dd MMM'),
            revenue,
            transactions: dayTransactions.length,
        };
    });
}

/**
 * Dapatkan produk terlaris
 */
export function getBestSellers(
    transactions: Transaction[],
    limit: number = 5
): BestSellerData[] {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    transactions.forEach((t) => {
        if (!productMap.has(t.productId)) {
            productMap.set(t.productId, {
                name: t.product,
                quantity: 0,
                revenue: 0,
            });
        }

        const product = productMap.get(t.productId)!;
        product.quantity += t.quantity;
        product.revenue += t.totalAmount;
    });

    const bestSellers = Array.from(productMap.entries())
        .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantitySold: data.quantity,
            revenue: data.revenue,
        }))
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, limit);

    return bestSellers;
}

/**
 * AI-based price recommendation
 * Logika sederhana: rekomendasikan harga berdasarkan margin keuntungan optimal
 */
export function getPriceRecommendation(
    product: Product,
    transactions: Transaction[]
): PriceRecommendationData {
    // Filter transactions untuk produk ini
    const productTransactions = transactions.filter((t) => t.productId === product.id);

    if (productTransactions.length === 0) {
        // Tidak ada data penjualan, rekomendasikan markup 30%
        const recommendedPrice = product.costPrice * 1.3;
        return {
            productId: product.id,
            productName: product.name,
            currentPrice: product.sellingPrice,
            recommendedPrice: Math.round(recommendedPrice),
            reasoning: 'Belum ada data penjualan. Rekomendasi markup 30% dari harga modal.',
            potentialProfit: recommendedPrice - product.costPrice,
        };
    }

    // Kalkulasi average quantity sold per day
    const oldestTransaction = productTransactions.reduce((oldest, t) => {
        return t.date < oldest.date ? t : oldest;
    });
    const daysSinceFirstSale = differenceInDays(new Date(), oldestTransaction.date) || 1;
    const totalQuantitySold = productTransactions.reduce((sum, t) => sum + t.quantity, 0);
    const avgDailySales = totalQuantitySold / daysSinceFirstSale;

    // Kalkulasi current margin
    const currentMargin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100;

    let recommendedPrice = product.sellingPrice;
    let reasoning = '';

    if (avgDailySales > 5) {
        // High demand - bisa naikkan harga sedikit
        if (currentMargin < 40) {
            recommendedPrice = product.costPrice * 1.4;
            reasoning = `Produk laris (${avgDailySales.toFixed(1)} item/hari). Potensi untuk menaikkan harga hingga margin 40%.`;
        } else {
            recommendedPrice = product.sellingPrice;
            reasoning = `Harga sudah optimal dengan margin ${currentMargin.toFixed(1)}% dan penjualan tinggi.`;
        }
    } else if (avgDailySales < 1) {
        // Low demand - pertimbangkan turunkan harga
        if (currentMargin > 25) {
            recommendedPrice = product.costPrice * 1.25;
            reasoning = `Penjualan lambat (${avgDailySales.toFixed(1)} item/hari). Pertimbangkan turunkan harga ke margin 25% untuk meningkatkan penjualan.`;
        } else {
            recommendedPrice = product.sellingPrice;
            reasoning = `Margin sudah rendah (${currentMargin.toFixed(1)}%). Pertimbangkan strategi marketing atau review produk.`;
        }
    } else {
        // Medium demand - maintain current price
        recommendedPrice = product.sellingPrice;
        reasoning = `Harga sudah sesuai dengan penjualan ${avgDailySales.toFixed(1)} item/hari dan margin ${currentMargin.toFixed(1)}%.`;
    }

    return {
        productId: product.id,
        productName: product.name,
        currentPrice: product.sellingPrice,
        recommendedPrice: Math.round(recommendedPrice),
        reasoning,
        potentialProfit: recommendedPrice - product.costPrice,
    };
}

/**
 * Rekomendasi pembelian stok
 */
export function getPurchaseRecommendation(
    products: Product[],
    transactions: Transaction[],
    daysToForecast: number = 7
): PurchaseRecommendationData[] {
    const recommendations: PurchaseRecommendationData[] = [];

    for (const product of products) {
        // Skip jika stok masih di atas minimum
        if (product.currentStock > product.minStock * 2) {
            continue;
        }

        // Kalkulasi sales velocity
        const productTransactions = transactions.filter((t) => t.productId === product.id);

        if (productTransactions.length === 0) {
            // Tidak ada data penjualan, cek apakah stok rendah
            if (product.currentStock <= product.minStock) {
                recommendations.push({
                    productId: product.id,
                    productName: product.name,
                    currentStock: product.currentStock,
                    recommendedQuantity: product.minStock * 2,
                    salesVelocity: 0,
                    reasoning: 'Stok di bawah minimum. Belum ada data penjualan, rekomendasi isi ulang ke 2x stok minimum.',
                });
            }
            continue;
        }

        // Kalkulasi sales velocity
        const oldestTransaction = productTransactions.reduce((oldest, t) => {
            return t.date < oldest.date ? t : oldest;
        });
        const daysSinceFirstSale = differenceInDays(new Date(), oldestTransaction.date) || 1;
        const totalQuantitySold = productTransactions.reduce((sum, t) => sum + t.quantity, 0);
        const salesVelocity = totalQuantitySold / daysSinceFirstSale;

        // Forecast demand
        const forecastedDemand = salesVelocity * daysToForecast;
        const stockNeeded = forecastedDemand - product.currentStock;

        if (stockNeeded > 0) {
            recommendations.push({
                productId: product.id,
                productName: product.name,
                currentStock: product.currentStock,
                recommendedQuantity: Math.ceil(stockNeeded),
                salesVelocity,
                reasoning: `Dengan penjualan ${salesVelocity.toFixed(1)} item/hari, stok saat ini hanya cukup untuk ${(product.currentStock / salesVelocity).toFixed(0)} hari. Rekomendasi beli ${Math.ceil(stockNeeded)} item untuk ${daysToForecast} hari ke depan.`,
            });
        } else if (product.currentStock <= product.minStock) {
            recommendations.push({
                productId: product.id,
                productName: product.name,
                currentStock: product.currentStock,
                recommendedQuantity: Math.max(product.minStock * 2, Math.ceil(forecastedDemand)),
                salesVelocity,
                reasoning: `Stok hampir habis. Rekomendasi isi ulang meskipun penjualan relatif lambat (${salesVelocity.toFixed(1)} item/hari).`,
            });
        }
    }

    return recommendations.sort((a, b) => {
        // Prioritas: stok paling rendah dan sales velocity paling tinggi
        const aUrgency = a.salesVelocity / Math.max(a.currentStock, 1);
        const bUrgency = b.salesVelocity / Math.max(b.currentStock, 1);
        return bUrgency - aUrgency;
    });
}
