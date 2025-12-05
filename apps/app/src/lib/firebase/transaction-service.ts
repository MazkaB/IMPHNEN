import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Transaction, TransactionType } from '@/types';

const TRANSACTIONS_COLLECTION = 'transactions';
const USERS_COLLECTION = 'users';

// Save new transaction
export const saveTransaction = async (
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
    ...transaction,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// Get transaction by ID
export const getTransaction = async (id: string): Promise<Transaction | null> => {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  } as Transaction;
};

// Get all transactions for a user
export const getUserTransactions = async (
  userId: string,
  limitCount: number = 100
): Promise<Transaction[]> => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as Transaction;
  });
};

// Get transactions by date range
export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Transaction[]> => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    where('userId', '==', userId),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate(),
    } as Transaction;
  });
};

// Update transaction
export const updateTransaction = async (
  id: string,
  data: Partial<Transaction>
): Promise<void> => {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
  
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

// Delete transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

// Get transaction summary
export const getTransactionSummary = async (
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}> => {
  let transactions: Transaction[];

  if (startDate && endDate) {
    transactions = await getTransactionsByDateRange(userId, startDate, endDate);
  } else {
    transactions = await getUserTransactions(userId);
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    transactionCount: transactions.length,
  };
};

// Get user by WhatsApp number
export const getUserByWhatsApp = async (
  whatsappNumber: string
): Promise<{ id: string; whatsappNumber: string } | null> => {
  const cleanNumber = whatsappNumber.replace('whatsapp:', '');
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where('whatsappNumber', '==', cleanNumber),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    whatsappNumber: cleanNumber,
  };
};

// Link WhatsApp to existing user
export const linkWhatsAppToUser = async (
  whatsappNumber: string,
  email: string
): Promise<boolean> => {
  const cleanNumber = whatsappNumber.replace('whatsapp:', '');
  
  // Find user by email
  const q = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', email.toLowerCase()),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return false;
  }

  const userDoc = querySnapshot.docs[0];
  
  await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
    whatsappNumber: cleanNumber,
    updatedAt: serverTimestamp(),
  });

  return true;
};

// Get category breakdown
export const getCategoryBreakdown = async (
  userId: string,
  type: TransactionType
): Promise<Array<{ category: string; amount: number; count: number }>> => {
  const transactions = await getUserTransactions(userId);
  
  const filtered = transactions.filter((t) => t.type === type);
  
  const breakdown = filtered.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = { amount: 0, count: 0 };
    }
    acc[t.category].amount += t.amount;
    acc[t.category].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);

  return Object.entries(breakdown)
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
};
