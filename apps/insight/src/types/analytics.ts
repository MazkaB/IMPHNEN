export interface AccountReceivable {
    id: string;
    customerName: string;
    amount: number;
    dueDate: Date;
    status: 'pending' | 'overdue' | 'paid';
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AccountPayable {
    id: string;
    supplierName: string;
    amount: number;
    dueDate: Date;
    status: 'pending' | 'overdue' | 'paid';
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ProfitLossData {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    profitMargin: number;
    period: string;
}

export interface SalesTrendData {
    date: string;
    revenue: number;
    transactions: number;
}

export interface BestSellerData {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
}

export interface PriceRecommendationData {
    productId: string;
    productName: string;
    currentPrice: number;
    recommendedPrice: number;
    reasoning: string;
    potentialProfit: number;
}

export interface PurchaseRecommendationData {
    productId: string;
    productName: string;
    currentStock: number;
    recommendedQuantity: number;
    salesVelocity: number; // items sold per day
    reasoning: string;
}
