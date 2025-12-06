import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60;

type DocumentType = 'auto' | 'receipt' | 'invoice' | 'purchase_order' | 'bank_statement' | 'stock_card' | 'contract';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

const DETECT_TYPE_PROMPT = `Analisa gambar dokumen ini dan tentukan jenisnya.
Pilih SATU dari: receipt, invoice, purchase_order, bank_statement, stock_card, contract
Jawab HANYA dengan satu kata kategori.`;

const EXTRACTION_PROMPTS: Record<DocumentType, string> = {
  auto: '',
  receipt: `Ekstrak data dari struk belanja ini ke JSON:
{"storeName":"nama toko","date":"DD/MM/YYYY","items":[{"name":"item","quantity":1,"price":0}],"total":0,"paymentMethod":""}
Harga dalam angka tanpa "Rp". Output HANYA JSON.`,
  invoice: `Ekstrak data dari invoice ini ke JSON:
{"invoiceNumber":"","date":"DD/MM/YYYY","vendor":"","customer":"","items":[{"name":"","quantity":1,"price":0}],"subtotal":0,"tax":0,"total":0}
Output HANYA JSON.`,
  purchase_order: `Ekstrak data dari PO ini ke JSON:
{"poNumber":"","date":"DD/MM/YYYY","vendor":"","items":[{"name":"","quantity":1,"unit":"","price":0}],"total":0}
Output HANYA JSON.`,
  bank_statement: `Ekstrak data dari rekening koran ini ke JSON:
{"bankName":"","accountNumber":"","period":"","openingBalance":0,"closingBalance":0,"transactions":[{"date":"","description":"","debit":0,"credit":0,"balance":0}]}
Output HANYA JSON.`,
  stock_card: `Ekstrak data dari kartu stok ini ke JSON:
{"itemName":"","itemCode":"","unit":"","movements":[{"date":"","description":"","in":0,"out":0,"balance":0}],"currentStock":0}
Output HANYA JSON.`,
  contract: `Ekstrak informasi dari kontrak ini ke JSON:
{"documentTitle":"","date":"DD/MM/YYYY","parties":[],"subject":"","keyTerms":[],"value":0,"duration":""}
Output HANYA JSON.`,
};

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ success: false, error: 'GOOGLE_AI_API_KEY not configured' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let documentType = (formData.get('document_type') as DocumentType) || 'auto';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Auto-detect document type
    if (documentType === 'auto') {
      const detectResult = await model.generateContent([
        { inlineData: { mimeType: file.type, data: base64Data } },
        DETECT_TYPE_PROMPT,
      ]);
      const detectedType = detectResult.response.text().trim().toLowerCase();
      const validTypes: DocumentType[] = ['receipt', 'invoice', 'purchase_order', 'bank_statement', 'stock_card', 'contract'];
      documentType = validTypes.includes(detectedType as DocumentType) ? (detectedType as DocumentType) : 'receipt';
    }

    // Extract data
    const extractResult = await model.generateContent([
      { inlineData: { mimeType: file.type, data: base64Data } },
      `Baca SEMUA teks dari gambar ini, lalu ${EXTRACTION_PROMPTS[documentType]}
      
Format response:
---RAW_TEXT---
[semua teks dari gambar]
---PARSED_JSON---
[JSON hasil parsing]`,
    ]);

    const responseText = extractResult.response.text();
    let rawText = '';
    let parsedData = {};

    const rawTextMatch = responseText.match(/---RAW_TEXT---\s*([\s\S]*?)\s*---PARSED_JSON---/);
    if (rawTextMatch) rawText = rawTextMatch[1].trim();

    const jsonMatch = responseText.match(/---PARSED_JSON---\s*([\s\S]*?)$/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[1].trim().replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      try {
        parsedData = JSON.parse(jsonStr);
      } catch {
        const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          try { parsedData = JSON.parse(jsonObjectMatch[0]); } catch { parsedData = {}; }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: { documentType, rawText: rawText || 'Extracted via Gemini Vision', parsed: parsedData },
      meta: { engine: 'Gemini Vision API', model: 'gemini-2.0-flash-exp' },
    });
  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ success: false, error: `OCR failed: ${error instanceof Error ? error.message : 'Unknown'}` }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: process.env.GOOGLE_AI_API_KEY ? 'healthy' : 'missing_api_key', engine: 'Gemini Vision API' });
}
