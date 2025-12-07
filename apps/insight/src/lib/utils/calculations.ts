import { Transaction } from '@/types/transaction';
import { Product } from '@/types/product';
import {
    ProfitLossData,
    SalesTrendData,
    BestSellerData,
    PriceRecommendationData,
    PurchaseRecommendationData,
} from '@/types/analytics';
import { startOfDay, endOfDay, eachDayOfInterval, format, differenceInDays } from 'date-fns';

// Helper to get amount from transaction (supports both formats)
function getTransactionAmount(t: Transaction & { amount?: number; type?: string }): number {
    // If has amount field (from apps/app format)
    if (typeof t.amount === 'number') {
        return t.amount;
    }
    // Otherwise use totalAmount (insight format)
    return t.totalAmount || 0;
}

// Helper to check if transaction is income
function isIncome(t: Transaction & { type?: string }): boolean {
    return t.type === 'income' || t.costPerItem === 0;
}

// Helper to check if transaction is expense
function isExpense(t: Transaction & { type?: string }): boolean {
    return t.type === 'expense' || t.costPerItem > 0;
}

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

    // Calculate revenue (income transactions)
    const totalRevenue = filteredTransactions
        .filter((t) => isIncome(t as Transaction & { type?: string }))
        .reduce((sum, t) => sum + getTransactionAmount(t as Transaction & { amount?: number }), 0);

    // Calculate cost (expense transactions or costPerItem)
    const totalCost = filteredTransactions
        .filter((t) => isExpense(t as Transaction & { type?: string }))
        .reduce((sum, t) => {
            const tx = t as Transaction & { amount?: number; type?: string };
            if (tx.type === 'expense') {
                return sum + getTransactionAmount(tx);
            }
            return sum + (t.costPerItem * t.quantity);
        }, 0);

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

        // Only count income transactions for revenue
        const revenue = dayTransactions
            .filter((t) => isIncome(t as Transaction & { type?: string }))
            .reduce((sum, t) => sum + getTransactionAmount(t as Transaction & { amount?: number }), 0);

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
    // Only consider income transactions for best sellers
    const incomeTransactions = transactions.filter((t) => 
        isIncome(t as Transaction & { type?: string })
    );

    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    incomeTransactions.forEach((t) => {
        const tx = t as Transaction & { description?: string; amount?: number };
        const productKey = t.productId || t.product || tx.description || 'Produk';
        const productName = t.product || tx.description || 'Produk';

        if (!productMap.has(productKey)) {
            productMap.set(productKey, {
                name: productName,
                quantity: 0,
                revenue: 0,
            });
        }

        const product = productMap.get(productKey)!;
        product.quantity += t.quantity || 1;
        product.revenue += getTransactionAmount(tx);
    });

    const bestSellers = Array.from(productMap.entries())
        .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantitySold: data.quantity,
            revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit);

    return bestSellers;
}

/**
 * AI-based price recommendation
 */
export function getPriceRecommendation(
    product: Product,
    transactions: Transaction[]
): PriceRecommendationData {
    const productTransactions = transactions.filter((t) => 
        t.productId === product.id || t.product === product.name
    );

    const costPrice = product.costPrice || 0;
    const sellingPrice = product.sellingPrice || 0;

    if (productTransactions.length === 0) {
        const recommendedPrice = costPrice > 0 ? costPrice * 1.3 : sellingPrice;
        return {
            productId: product.id,
            productName: product.name,
            currentPrice: sellingPrice,
            recommendedPrice: Math.round(recommendedPrice),
            reasoning: 'Belum ada data penjualan. Rekomendasi markup 30% dari harga modal.',
            potentialProfit: recommendedPrice - costPrice,
        };
    }

    const oldestTransaction = productTransactions.reduce((oldest, t) => {
        return t.date < oldest.date ? t : oldest;
    });
    const daysSinceFirstSale = differenceInDays(new Date(), oldestTransaction.date) || 1;
    const totalQuantitySold = productTransactions.reduce((sum, t) => sum + (t.quantity || 1), 0);
    const avgDailySales = totalQuantitySold / daysSinceFirstSale;

    const currentMargin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 30;

    let recommendedPrice = sellingPrice;
    let reasoning = '';

    if (avgDailySales > 5) {
        if (currentMargin < 40) {
            recommendedPrice = costPrice > 0 ? costPrice * 1.4 : sellingPrice * 1.1;
            reasoning = `Produk laris (${avgDailySales.toFixed(1)} item/hari). Potensi untuk menaikkan harga.`;
        } else {
            reasoning = `Harga sudah optimal dengan penjualan tinggi.`;
        }
    } else if (avgDailySales < 1) {
        if (currentMargin > 25) {
            recommendedPrice = costPrice > 0 ? costPrice * 1.25 : sellingPrice * 0.9;
            reasoning = `Penjualan lambat. Pertimbangkan turunkan harga untuk meningkatkan penjualan.`;
        } else {
            reasoning = `Margin sudah rendah. Pertimbangkan strategi marketing.`;
        }
    } else {
        reasoning = `Harga sudah sesuai dengan penjualan ${avgDailySales.toFixed(1)} item/hari.`;
    }

    return {
        productId: product.id,
        productName: product.name,
        currentPrice: sellingPrice,
        recommendedPrice: Math.round(recommendedPrice),
        reasoning,
        potentialProfit: recommendedPrice - costPrice,
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
        const currentStock = product.currentStock || 0;
        const minStock = product.minStock || 5;

        if (currentStock > minStock * 2) {
            continue;
        }

        const productTransactions = transactions.filter((t) => 
            t.productId === product.id || t.product === product.name
        );

        if (productTransactions.length === 0) {
            if (currentStock <= minStock) {
                recommendations.push({
                    productId: product.id,
                    productName: product.name,
                    currentStock,
                    recommendedQuantity: minStock * 2,
                    salesVelocity: 0,
                    reasoning: 'Stok rendah. Belum ada data penjualan, rekomendasi isi ulang.',
                });
            }
            continue;
        }

        const oldestTransaction = productTransactions.reduce((oldest, t) => {
            return t.date < oldest.date ? t : oldest;
        });
        const daysSinceFirstSale = differenceInDays(new Date(), oldestTransaction.date) || 1;
        const totalQuantitySold = productTransactions.reduce((sum, t) => sum + (t.quantity || 1), 0);
        const salesVelocity = totalQuantitySold / daysSinceFirstSale;

        const forecastedDemand = salesVelocity * daysToForecast;
        const stockNeeded = forecastedDemand - currentStock;

        if (stockNeeded > 0 || currentStock <= minStock) {
            recommendations.push({
                productId: product.id,
                productName: product.name,
                currentStock,
                recommendedQuantity: Math.max(Math.ceil(stockNeeded), minStock),
                salesVelocity,
                reasoning: `Penjualan ${salesVelocity.toFixed(1)} item/hari. Stok cukup untuk ${currentStock > 0 ? (currentStock / salesVelocity).toFixed(0) : 0} hari.`,
            });
        }
    }

    return recommendations.sort((a, b) => {
        const aUrgency = a.salesVelocity / Math.max(a.currentStock, 1);
        const bUrgency = b.salesVelocity / Math.max(b.currentStock, 1);
        return bUrgency - aUrgency;
    });
}
