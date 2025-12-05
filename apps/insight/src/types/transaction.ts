export interface Transaction {
    id: string;
    date: Date;
    time: string;
    product: string;
    productId: string;
    quantity: number;
    pricePerItem: number;
    totalAmount: number;
    costPerItem: number; // untuk kalkulasi profit
    source: 'voice' | 'ocr' | 'manual';
    userId: string;
    customer?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TransactionInput {
    product: string;
    productId: string;
    quantity: number;
    pricePerItem: number;
    costPerItem: number;
    source: 'voice' | 'ocr' | 'manual';
}
