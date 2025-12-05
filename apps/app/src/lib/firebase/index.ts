// Firebase exports
export { app, auth, db, storage } from './config';
export { getAdminFirebase, adminAuth, adminDb } from './admin';
export {
  registerWithEmail,
  loginWithEmail,
  logout,
  sendPasswordReset,
  getUserProfile,
  updateUserProfile,
  onAuthChange,
  getCurrentUser,
} from './auth-service';
export {
  saveTransaction,
  getTransaction,
  getUserTransactions,
  getTransactionsByDateRange,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getUserByWhatsApp,
  linkWhatsAppToUser,
  getCategoryBreakdown,
} from './transaction-service';
