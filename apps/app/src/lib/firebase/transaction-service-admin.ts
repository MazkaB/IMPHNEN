import { getAdminFirebase } from './admin';
import { Transaction, TransactionType } from '@/types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const TRANSACTIONS_COLLECTION = 'transactions';

// Save new transaction (server-side)
export const saveTransactionAdmin = async (
  transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const { adminDb } = getAdminFirebase();
  
  const docRef = await adminDb.collection(TRANSACTIONS_COLLECTION).add({
    ...transaction,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return docRef.id;
};

// Get transaction by ID (server-side)
export const getTransactionAdmin = async (id: string): Promise<Transaction | null> => {
  const { adminDb } = getAdminFirebase();
  const docSnap = await adminDb.collection(TRANSACTIONS_COLLECTION).doc(id).get();

  if (!docSnap.exists) {
    return null;
  }

  const data = docSnap.data()!;
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate(),
  } as Transaction;
};

// Get all transactions for a user (server-side)
export const getUserTransactionsAdmin = async (
  userId: string,
  limitCount: number = 100
): Promise<Transaction[]> => {
  const { adminDb } = getAdminFirebase();
  
  const querySnapshot = await adminDb
    .collection(TRANSACTIONS_COLLECTION)
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(limitCount)
    .get();

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

// Update transaction (server-side)
export const updateTransactionAdmin = async (
  id: string,
  data: Partial<Transaction>
): Promise<void> => {
  const { adminDb } = getAdminFirebase();
  
  await adminDb.collection(TRANSACTIONS_COLLECTION).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
};

// Delete transaction (server-side)
export const deleteTransactionAdmin = async (id: string): Promise<void> => {
  const { adminDb } = getAdminFirebase();
  await adminDb.collection(TRANSACTIONS_COLLECTION).doc(id).delete();
};

// Get transaction summary (server-side)
export const getTransactionSummaryAdmin = async (
  userId: string
): Promise<{
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}> => {
  const transactions = await getUserTransactionsAdmin(userId);

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
