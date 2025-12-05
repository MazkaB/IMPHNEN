// User Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  businessName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';
export type TransactionSource = 'voice' | 'manual' | 'ocr' | 'whatsapp';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  source: TransactionSource;
  rawInput?: string; // Input asli dari voice/OCR
  createdAt: Date;
  updatedAt: Date;
}

// Voice Input Types
export interface VoiceInput {
  id: string;
  userId: string;
  audioUrl?: string;
  transcription: string;
  parsedTransaction?: Partial<Transaction>;
  status: 'pending' | 'processed' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

// WhatsApp Message Types
export interface WhatsAppMessage {
  id: string;
  userId?: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  mediaType?: 'audio' | 'image' | 'document';
  direction: 'inbound' | 'outbound';
  status: 'received' | 'processed' | 'replied' | 'failed';
  createdAt: Date;
}

// OCR Types
export interface OCRResult {
  id: string;
  userId: string;
  imageUrl: string;
  extractedText: string;
  parsedData?: {
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    date?: string;
    merchant?: string;
  };
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
}

// Dashboard Insight Types
export interface DashboardInsight {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  recommendations: string[];
}

// Content Creator Types
export interface GeneratedContent {
  id: string;
  userId: string;
  type: 'poster' | 'caption' | 'story';
  platform: 'instagram' | 'whatsapp' | 'tiktok';
  content: string;
  imageUrl?: string;
  createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Category presets
export const EXPENSE_CATEGORIES = [
  'Bahan Baku',
  'Operasional',
  'Gaji Karyawan',
  'Sewa',
  'Listrik & Air',
  'Transportasi',
  'Marketing',
  'Peralatan',
  'Lainnya',
] as const;

export const INCOME_CATEGORIES = [
  'Penjualan Produk',
  'Penjualan Jasa',
  'Piutang Terbayar',
  'Investasi',
  'Lainnya',
] as const;
