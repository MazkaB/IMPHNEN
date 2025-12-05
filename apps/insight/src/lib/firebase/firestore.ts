limit,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    onSnapshot,
    Timestamp,
    QueryConstraint,
} from 'firebase/firestore';
import { db } from './config';
import { Transaction } from '@/types/transaction';
import { Product } from '@/types/product';
import { AccountReceivable, AccountPayable } from '@/types/analytics';

/**
 * Convert Firestore Timestamp to Date
 */
function convertTimestamp(timestamp: any): Date {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    if (timestamp?.toDate) {
        return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
        return timestamp;
    }
    return new Date(timestamp);
}

/**
 * Get transactions dengan real-time listener
 */
/**
 * Get transactions dengan real-time listener
 */
export function subscribeToTransactions(
    userId: string,
    startDate: Date,
    endDate: Date,
    callback: (transactions: Transaction[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (!userId) {
        throw new Error('User ID tidak boleh kosong');
    }

    const constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc'),
        orderBy('createdAt', 'desc'),
    ];

    const q = query(collection(db, 'transactions'), ...constraints);

    return onSnapshot(
        q,
        (snapshot) => {
            const transactions: Transaction[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: convertTimestamp(data.date),
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt),
                } as Transaction;
            });
            callback(transactions);
        },
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.error('Error fetching transactions:', error);
            }
        }
    );
}

/**
 * Add new transaction
 */
export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }) {
    try {
        if (!transaction.userId) {
            throw new Error('userId is required when adding a transaction');
        }

        const docRef = await addDoc(collection(db, 'transactions'), {
            ...transaction,
            date: Timestamp.fromDate(transaction.date),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding transaction to Firestore:', error);
        throw new Error(`Gagal menyimpan transaksi: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get products dengan real-time listener
 */
export function subscribeToProducts(
    userId: string,
    callback: (products: Product[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (!userId) {
        throw new Error('User ID tidak boleh kosong');
    }

    const q = query(
        collection(db, 'products'),
        where('userId', '==', userId),
        orderBy('name', 'asc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const products: Product[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt),
                } as Product;
            });
            callback(products);
        },
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.error('Error fetching products:', error);
            }
        }
    );
}


/**
 * Add new product
 */
export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }) {
    try {
        if (!product.userId) {
            throw new Error('userId is required when adding a product');
        }

        const docRef = await addDoc(collection(db, 'products'), {
            ...product,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding product to Firestore:', error);
        throw new Error(`Gagal menyimpan produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Update existing product
 */
export async function updateProduct(productId: string, productData: Partial<Product>) {
    try {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
            ...productData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error(`Gagal update produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete product
 */
export async function deleteProduct(productId: string) {
    try {
        const productRef = doc(db, 'products', productId);
        await deleteDoc(productRef);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error(`Gagal hapus produk: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Get accounts receivable (piutang)
 */
export function subscribeToAccountsReceivable(
    userId: string,
    callback: (accounts: AccountReceivable[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (!userId) {
        throw new Error('User ID tidak boleh kosong');
    }

    const q = query(
        collection(db, 'accountsReceivable'),
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const accounts: AccountReceivable[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dueDate: convertTimestamp(data.dueDate),
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt),
                } as AccountReceivable;
            });
            callback(accounts);
        },
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.error('Error fetching receivables:', error);
            }
        }
    );
}

/**
 * Get accounts payable (hutang)
 */
export function subscribeToAccountsPayable(
    userId: string,
    callback: (accounts: AccountPayable[]) => void,
    onError?: (error: Error) => void
): () => void {
    if (!userId) {
        throw new Error('User ID tidak boleh kosong');
    }

    const q = query(
        collection(db, 'accountsPayable'),
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
    );

    return onSnapshot(
        q,
        (snapshot) => {
            const accounts: AccountPayable[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    dueDate: convertTimestamp(data.dueDate),
                    createdAt: convertTimestamp(data.createdAt),
                    updatedAt: convertTimestamp(data.updatedAt),
                } as AccountPayable;
            });
            callback(accounts);
        },
        (error) => {
            if (onError) {
                onError(error);
            } else {
                console.error('Error fetching payables:', error);
            }
        }
    );
}
