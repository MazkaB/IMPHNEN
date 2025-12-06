// NUSA AI OCR API Client - Gemini Vision API Version

export type DocumentType = 'auto' | 'receipt' | 'invoice' | 'purchase_order' | 'bank_statement' | 'stock_card' | 'contract';

export interface ParsedItem {
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface OCRParsedData {
  // Receipt fields
  storeName?: string;
  date?: string;
  items?: ParsedItem[];
  total?: number;
  paymentMethod?: string;
  
  // Invoice fields
  invoiceNumber?: string;
  dueDate?: string;
  vendor?: string;
  customer?: string;
  subtotal?: number;
  tax?: number;
  
  // Purchase Order fields
  poNumber?: string;
  notes?: string;
  
  // Bank Statement fields
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  period?: string;
  openingBalance?: number;
  closingBalance?: number;
  transactions?: Array<{
    date: string;
    description: string;
    debit?: number;
    credit?: number;
    balance?: number;
  }>;
  
  // Stock Card fields
  itemName?: string;
  itemCode?: string;
  unit?: string;
  movements?: Array<{
    date: string;
    description: string;
    in?: number;
    out?: number;
    balance?: number;
  }>;
  currentStock?: number;
  
  // Contract fields
  documentTitle?: string;
  parties?: string[];
  subject?: string;
  keyTerms?: string[];
  value?: number;
  duration?: string;
  
  // Generic
  [key: string]: unknown;
}

export interface OCRResult {
  documentType: DocumentType;
  rawText: string;
  parsed: OCRParsedData;
}

export interface OCRMeta {
  engine: string;
  model: string;
  autoDetected: boolean;
}

export interface OCRResponse {
  success: boolean;
  data?: OCRResult;
  meta?: OCRMeta;
  error?: string;
}

/**
 * Process document using Gemini Vision API
 * This runs entirely on Vercel - no external Python service needed
 */
export async function processDocument(file: File, documentType: DocumentType = 'auto'): Promise<OCRResult> {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image.');
  }

  // Check file size (max 10MB for Gemini)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  // Call our Next.js API route (same origin, no CORS issues)
  const response = await fetch('/api/ocr/process', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `OCR processing failed: ${response.statusText}`);
  }

  const result: OCRResponse = await response.json();

  if (!result.success || !result.data) {
    throw new Error(result.error || 'Invalid OCR response format');
  }

  return result.data;
}

/**
 * Check OCR service health
 */
export async function checkOCRHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/ocr/process', { method: 'GET' });
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy' && data.ready === true;
  } catch {
    return false;
  }
}

/**
 * Get human-readable document type label
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
    auto: '🤖 Deteksi Otomatis',
    receipt: '🧾 Struk Belanja',
    invoice: '📄 Invoice/Faktur',
    purchase_order: '📋 Purchase Order',
    bank_statement: '🏦 Rekening Koran',
    stock_card: '📦 Kartu Stok',
    contract: '📜 Kontrak/Surat',
  };
  return labels[type] || type;
}
