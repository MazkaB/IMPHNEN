'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
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
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to transactions from Firebase
  useEffect(() => {
    if (!user?.uid || !db) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Query transactions collection (same as apps/app)
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
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
            userId: data.userId || user.uid,
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
  }, [user?.uid]);

  // Subscribe to products from Firebase
  useEffect(() => {
    if (!user?.uid || !db) {
      setProducts([]);
      return;
    }

    const q = query(
      collection(db, 'products'),
      where('userId', '==', user.uid),
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
  }, [user?.uid]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid || !db) throw new Error('User must be logged in');

    const docRef = await addDoc(collection(db, 'products'), {
      ...productData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid || !db) throw new Error('User must be logged in');

    const docRef = await addDoc(collection(db, 'transactions'), {
      ...transactionData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user?.uid || !db) throw new Error('User must be logged in');

    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });
  };

  const deleteProduct = async (id: string) => {
    if (!user?.uid || !db) throw new Error('User must be logged in');

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
