// Firebase exports
export { firebase, auth, db, storage } from './config';
export { getAdminFirebase, adminAuth, adminDb } from './admin';
export {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
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
