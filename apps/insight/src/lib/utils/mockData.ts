/**
 * Mock Data Generator for Dashboard
 * 
 * Generates sample products and transactions for demo/testing
 */

import { Product } from '@/types/product';
import { Transaction } from '@/types/transaction';

export const MOCK_PRODUCTS: Omit<Product, 'id' | 'userId'>[] = [
    {
        name: 'Kopi Arabica Premium',
        category: 'Makanan & Minuman',
        sellingPrice: 45000,
        costPrice: 25000,
        currentStock: 150,
        minStock: 20,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-01'),
    },
    {
        name: 'Teh Hijau Organik',
        category: 'Makanan & Minuman',
        sellingPrice: 35000,
        costPrice: 18000,
        currentStock: 85,
        minStock: 15,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-15'),
    },
    {
        name: 'Kemeja Batik Pria',
        category: 'Fashion',
        sellingPrice: 185000,
        costPrice: 110000,
        currentStock: 35,
        minStock: 10,
        createdAt: new Date('2024-11-05'),
        updatedAt: new Date('2024-11-20'),
    },
    {
        name: 'Sepatu Sneakers Canvas',
        category: 'Fashion',
        sellingPrice: 225000,
        costPrice: 145000,
        currentStock: 42,
        minStock: 8,
        createdAt: new Date('2024-11-10'),
        updatedAt: new Date('2024-11-25'),
    },
    {
        name: 'Notebook A5 Premium',
        category: 'Alat Tulis',
        sellingPrice: 45000,
        costPrice: 22000,
        currentStock: 120,
        minStock: 25,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-10'),
    },
    {
        name: 'Pulpen Gel 0.5mm',
        category: 'Alat Tulis',
        sellingPrice: 5000,
        costPrice: 2500,
        currentStock: 350,
        minStock: 50,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-05'),
    },
    {
        name: 'Tas Ransel Laptop',
        category: 'Aksesoris',
        sellingPrice: 275000,
        costPrice: 165000,
        currentStock: 28,
        minStock: 5,
        createdAt: new Date('2024-11-08'),
        updatedAt: new Date('2024-11-22'),
    },
    {
        name: 'Power Bank 20000mAh',
        category: 'Elektronik',
        sellingPrice: 185000,
        costPrice: 115000,
        currentStock: 55,
        minStock: 12,
        createdAt: new Date('2024-11-12'),
        updatedAt: new Date('2024-11-28'),
    },
    {
        name: 'Minyak Goreng 2L',
        category: 'Makanan & Minuman',
        sellingPrice: 32000,
        costPrice: 26000,
        currentStock: 95,
        minStock: 20,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-15'),
    },
    {
        name: 'Masker Kain 3 Ply',
        category: 'Kesehatan',
        sellingPrice: 15000,
        costPrice: 8000,
        currentStock: 200,
        minStock: 30,
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-11-10'),
    },
];

/**
 * Generate mock transactions based on products
 */
export function generateMockTransactions(products: Product[], userId: string): Omit<Transaction, 'id'>[] {
    const transactions: Omit<Transaction, 'id'>[] = [];
    const today = new Date();

    // Generate transactions for last 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Random 1-3 transactions per day
        const transactionsPerDay = Math.floor(Math.random() * 3) + 1;

        for (let j = 0; j < transactionsPerDay; j++) {
            // Pick random product
            const product = products[Math.floor(Math.random() * products.length)];

            // Random quantity (1-5)
            const quantity = Math.floor(Math.random() * 5) + 1;

            // Calculate amounts
            const pricePerItem = product.sellingPrice;
            const totalAmount = pricePerItem * quantity;
            const costPerItem = product.costPrice;

            // Random time
            const hours = Math.floor(Math.random() * 12) + 8; // 8AM - 8PM
            const minutes = Math.floor(Math.random() * 60);
            const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

            // Random source
            const sources: ('voice' | 'ocr' | 'manual')[] = ['manual', 'voice', 'ocr'];
            const source = sources[Math.floor(Math.random() * sources.length)];

            transactions.push({
                userId,
                product: product.name,
                productId: product.id,
                quantity,
                pricePerItem,
                costPerItem,
                totalAmount,
                source,
                customer: Math.random() > 0.3 ? generateCustomerName() : undefined,
                date,
                time,
                createdAt: date,
                updatedAt: date,
            });
        }
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Generate random customer names
 */
function generateCustomerName(): string {
    const firstNames = ['Budi', 'Siti', 'Ahmad', 'Rina', 'Joko', 'Dewi', 'Andi', 'Sri', 'Hendra', 'Maya'];
    const lastNames = ['Santoso', 'Wijaya', 'Pratama', 'Kusuma', 'Saputra', 'Wati', 'Putra', 'Lestari', 'Hermawan', 'Suryani'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
}

/**
 * Initialize mock data for a user
 */
export function initializeMockData(userId: string) {
    // Create products with IDs
    const products: Product[] = MOCK_PRODUCTS.map((product, index) => ({
        ...product,
        id: `product-${userId}-${index + 1}`,
        userId,
    }));

    // Generate transactions
    const transactions = generateMockTransactions(products, userId).map((transaction, index) => ({
        ...transaction,
        id: `transaction-${userId}-${index + 1}`,
    }));

    return { products, transactions };
}
