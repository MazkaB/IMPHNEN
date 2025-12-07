'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { Transaction } from '@/types/transaction';
import { AccountReceivable, AccountPayable } from '@/types/analytics';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';

interface DashboardContextType {
  products: Product[];
  transactions: Transaction[];
  receivables: AccountReceivable[];
  payables: AccountPayable[];
  loading: boolean;
  userId: string | null;
  setUserId: (id: string | null) => void;
  addProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshData: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

function convertTimestamp(timestamp: unknown): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp as string | number);
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to transactions from Firebase
  useEffect(() => {
    if (!userId || !db) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query transactions collection (same as apps/app)
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const txData: Transaction[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt ? convertTimestamp(data.createdAt) : new Date();
          
          // Map from apps/app Transaction format to insight Transaction format
          return {
            id: docSnap.id,
            userId: data.userId || userId,
            date: createdAt,
            time: createdAt.toLocaleTimeString('id-ID'),
            product: data.description || 'Produk',
            productId: data.productId || docSnap.id,
            quantity: data.quantity || 1,
            pricePerItem: data.amount || 0,
            totalAmount: data.amount || 0,
            costPerItem: data.type === 'expense' ? data.amount : 0,
            source: (data.source as 'voice' | 'ocr' | 'manual') || 'manual',
            customer: data.category || '',
            createdAt: createdAt,
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : createdAt,
            // Additional fields for analytics
            type: data.type, // 'income' or 'expense'
            amount: data.amount,
            description: data.description,
            category: data.category,
          } as Transaction;
        });
        setTransactions(txData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to products from Firebase
  useEffect(() => {
    if (!userId || !db) {
      setProducts([]);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const prodData: Product[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt ? convertTimestamp(data.createdAt) : new Date(),
            updatedAt: data.updatedAt ? convertTimestamp(data.updatedAt) : new Date(),
          } as Product;
        });
        setProducts(prodData);
      },
      (error) => {
        console.error('Error fetching products:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to receivables
  useEffect(() => {
    if (!userId || !db) {
      setReceivables([]);
      return;
    }

    const q = query(
      collection(db, 'receivables'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AccountReceivable[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            customerName: d.customerName || d.name || 'Unknown',
            amount: d.amount || 0,
            dueDate: d.dueDate ? convertTimestamp(d.dueDate) : new Date(),
            status: d.status || 'pending',
            userId: d.userId,
            createdAt: d.createdAt ? convertTimestamp(d.createdAt) : new Date(),
            updatedAt: d.updatedAt ? convertTimestamp(d.updatedAt) : new Date(),
          } as AccountReceivable;
        });
        setReceivables(data);
      },
      (error) => {
        console.error('Error fetching receivables:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Subscribe to payables
  useEffect(() => {
    if (!userId || !db) {
      setPayables([]);
      return;
    }

    const q = query(
      collection(db, 'payables'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data: AccountPayable[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            supplierName: d.supplierName || d.name || 'Unknown',
            amount: d.amount || 0,
            dueDate: d.dueDate ? convertTimestamp(d.dueDate) : new Date(),
            status: d.status || 'pending',
            userId: d.userId,
            createdAt: d.createdAt ? convertTimestamp(d.createdAt) : new Date(),
            updatedAt: d.updatedAt ? convertTimestamp(d.updatedAt) : new Date(),
          } as AccountPayable;
        });
        setPayables(data);
      },
      (error) => {
        console.error('Error fetching payables:', error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId || !db) throw new Error('User must be logged in');

    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!userId || !db) throw new Error('User must be logged in');

    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!userId || !db) throw new Error('User must be logged in');

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProduct = async (id: string) => {
    if (!userId || !db) throw new Error('User must be logged in');

    const productRef = doc(db, 'products', id);
    await deleteDoc(productRef);
  };

  const refreshData = () => {
    // Data is automatically refreshed via onSnapshot listeners
  };

  return (
    <DashboardContext.Provider
      value={{
        products,
        transactions,
        receivables,
        payables,
        loading,
        userId,
        setUserId,
        addProduct,
        addTransaction,
        updateProduct,
        deleteProduct,
        refreshData,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
