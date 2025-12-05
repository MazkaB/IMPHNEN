'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Product } from '@/types/product';
import { Transaction } from '@/types/transaction';
import { AccountReceivable, AccountPayable } from '@/types/analytics';

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

const getStorageKeys = (userId: string) => ({
  PRODUCTS: `dashboard_products_${userId}`,
  TRANSACTIONS: `dashboard_transactions_${userId}`,
});

function getFromStorage<T>(userId: string, key: 'PRODUCTS' | 'TRANSACTIONS'): T[] {
  try {
    const storageKey = getStorageKeys(userId)[key];
    const data = localStorage.getItem(storageKey);
    return data
      ? JSON.parse(data, (k, value) => {
          if (k === 'date' || k === 'createdAt' || k === 'updatedAt') {
            return new Date(value);
          }
          return value;
        })
      : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(userId: string, key: 'PRODUCTS' | 'TRANSACTIONS', data: T[]): void {
  try {
    const storageKey = getStorageKeys(userId)[key];
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch {
    // Silent fail for localStorage errors
  }
}

export function DashboardProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setProducts([]);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const storedProducts = getFromStorage<Product>(user.uid, 'PRODUCTS');
    const storedTransactions = getFromStorage<Transaction>(user.uid, 'TRANSACTIONS');

    setProducts(storedProducts);
    setTransactions(storedTransactions);
    setLoading(false);
  }, [user?.uid]);

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User must be logged in');

    const nextNumber = products.length + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const newProduct: Product = {
      id: `PROD-${paddedNumber}`,
      ...productData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    saveToStorage(user.uid, 'PRODUCTS', updatedProducts);

    return newProduct.id;
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) throw new Error('User must be logged in');

    const nextNumber = transactions.length + 1;
    const paddedNumber = String(nextNumber).padStart(4, '0');
    const newTransaction: Transaction = {
      id: `TRX-${paddedNumber}`,
      ...transactionData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveToStorage(user.uid, 'TRANSACTIONS', updatedTransactions);

    return newTransaction.id;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    if (!user?.uid) throw new Error('User must be logged in');

    const updatedProducts = products.map((p) => (p.id === id ? { ...p, ...productData, updatedAt: new Date() } : p));
    setProducts(updatedProducts);
    saveToStorage(user.uid, 'PRODUCTS', updatedProducts);
  };

  const deleteProduct = async (id: string) => {
    if (!user?.uid) throw new Error('User must be logged in');

    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
    saveToStorage(user.uid, 'PRODUCTS', updatedProducts);
  };

  const refreshData = () => {
    if (!user?.uid) return;

    const storedProducts = getFromStorage<Product>(user.uid, 'PRODUCTS');
    const storedTransactions = getFromStorage<Transaction>(user.uid, 'TRANSACTIONS');
    setProducts(storedProducts);
    setTransactions(storedTransactions);
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
