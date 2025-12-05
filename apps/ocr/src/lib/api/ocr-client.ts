// NUSA AI OCR API Client

const OCR_SERVICE_URL = process.env.NEXT_PUBLIC_OCR_SERVICE_URL || 'http://localhost:8000';

export type DocumentType = 'auto' | 'receipt' | 'invoice' | 'purchase_order' | 'bank_statement' | 'stock_card' | 'contract';

export interface ParsedItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OCRParsedData {
  storeName?: string;
  date?: string;
  items?: ParsedItem[];
  total?: number;
  [key: string]: unknown;
}

export interface OCRResult {
  documentType: DocumentType;
  rawText: string;
  parsed: OCRParsedData;
}

export async function processDocument(file: File, documentType: DocumentType = 'auto'): Promise<OCRResult> {
  if (!file) {
    throw new Error('No file provided');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type. Please upload an image.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  const response = await fetch(`${OCR_SERVICE_URL}/ocr/process`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `OCR processing failed: ${response.statusText}`);
  }

  const result = await response.json();

  if (!result.success || !result.data) {
    throw new Error('Invalid OCR response format');
  }

  return result.data;
}

export async function checkOCRHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${OCR_SERVICE_URL}/health`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.status === 'healthy' && data.ocr_ready === true;
  } catch {
    return false;
  }
}
