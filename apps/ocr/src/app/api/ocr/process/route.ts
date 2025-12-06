import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for Vercel

// Document type definitions
type DocumentType = 'auto' | 'receipt' | 'invoice' | 'purchase_order' | 'bank_statement' | 'stock_card' | 'contract';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

// Document type detection prompt
const DETECT_TYPE_PROMPT = `Analisa gambar dokumen ini dan tentukan jenisnya.
Pilih SATU dari kategori berikut:
- receipt (struk belanja, nota pembelian)
- invoice (faktur, tagihan)
- purchase_order (surat pesanan pembelian)
- bank_statement (rekening koran, mutasi bank)
- stock_card (kartu stok barang)
- contract (kontrak, surat perjanjian)

Jawab HANYA dengan satu kata kategori, tanpa penjelasan.`;

// Document extraction prompts based on type
const EXTRACTION_PROMPTS: Record<DocumentType, string> = {
  auto: '', // Will be replaced after detection
  receipt: `Ekstrak data dari struk belanja ini ke format JSON:
{
  "storeName": "nama toko",
  "date": "tanggal transaksi (DD/MM/YYYY)",
  "items": [{"name": "nama item", "quantity": jumlah, "price": harga_satuan}],
  "total": total_akhir,
  "paymentMethod": "metode pembayaran jika ada"
}
ATURAN: Harga dalam angka tanpa "Rp". Jika tidak yakin, skip item. Output HANYA JSON.`,

  invoice: `Ekstrak data dari invoice/faktur ini ke format JSON:
{
  "invoiceNumber": "nomor invoice",
  "date": "tanggal (DD/MM/YYYY)",
  "dueDate": "jatuh tempo jika ada",
  "vendor": "nama vendor/supplier",
  "customer": "nama customer",
  "items": [{"name": "nama item", "quantity": jumlah, "price": harga, "total": subtotal}],
  "subtotal": subtotal,
  "tax": pajak,
  "total": total_akhir
}
Output HANYA JSON valid.`,

  purchase_order: `Ekstrak data dari Purchase Order ini ke format JSON:
{
  "poNumber": "nomor PO",
  "date": "tanggal (DD/MM/YYYY)",
  "vendor": "nama vendor",
  "items": [{"name": "nama barang", "quantity": jumlah, "unit": "satuan", "price": harga}],
  "total": total,
  "notes": "catatan jika ada"
}
Output HANYA JSON valid.`,

  bank_statement: `Ekstrak data dari rekening koran/mutasi bank ini ke format JSON:
{
  "bankName": "nama bank",
  "accountNumber": "nomor rekening (sensor sebagian)",
  "accountHolder": "nama pemilik",
  "period": "periode statement",
  "openingBalance": saldo_awal,
  "closingBalance": saldo_akhir,
  "transactions": [{"date": "tanggal", "description": "keterangan", "debit": nominal_debit, "credit": nominal_credit, "balance": saldo}]
}
Output HANYA JSON valid.`,

  stock_card: `Ekstrak data dari kartu stok ini ke format JSON:
{
  "itemName": "nama barang",
  "itemCode": "kode barang",
  "unit": "satuan",
  "movements": [{"date": "tanggal", "description": "keterangan", "in": jumlah_masuk, "out": jumlah_keluar, "balance": saldo}],
  "currentStock": stok_akhir
}
Output HANYA JSON valid.`,

  contract: `Ekstrak informasi penting dari kontrak/surat ini ke format JSON:
{
  "documentTitle": "judul dokumen",
  "date": "tanggal (DD/MM/YYYY)",
  "parties": ["pihak 1", "pihak 2"],
  "subject": "perihal/subjek",
  "keyTerms": ["poin penting 1", "poin penting 2"],
  "value": nilai_kontrak_jika_ada,
  "duration": "durasi/masa berlaku"
}
Output HANYA JSON valid.`,
};

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GOOGLE_AI_API_KEY not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    let documentType = (formData.get('document_type') as DocumentType) || 'auto';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString('base64');

    // Initialize Gemini model with vision capability
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Step 1: Auto-detect document type if needed
    if (documentType === 'auto') {
      const detectResult = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        DETECT_TYPE_PROMPT,
      ]);

      const detectedType = detectResult.response.text().trim().toLowerCase();
      
      // Validate detected type
      const validTypes: DocumentType[] = ['receipt', 'invoice', 'purchase_order', 'bank_statement', 'stock_card', 'contract'];
      documentType = validTypes.includes(detectedType as DocumentType) 
        ? (detectedType as DocumentType) 
        : 'receipt'; // Default to receipt if unknown
    }

    // Step 2: Extract text and structured data
    const extractionPrompt = EXTRACTION_PROMPTS[documentType];
    
    const extractResult = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      },
      `Pertama, baca SEMUA teks yang terlihat di gambar ini (OCR).
Kemudian, ${extractionPrompt}

Berikan response dalam format:
---RAW_TEXT---
[semua teks yang terbaca dari gambar]
---PARSED_JSON---
[JSON hasil parsing]`,
    ]);

    const responseText = extractResult.response.text();
    
    // Parse the response
    let rawText = '';
    let parsedData = {};

    // Extract raw text
    const rawTextMatch = responseText.match(/---RAW_TEXT---\s*([\s\S]*?)\s*---PARSED_JSON---/);
    if (rawTextMatch) {
      rawText = rawTextMatch[1].trim();
    }

    // Extract parsed JSON
    const jsonMatch = responseText.match(/---PARSED_JSON---\s*([\s\S]*?)$/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[1].trim();
      // Clean markdown code blocks if present
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      
      try {
        parsedData = JSON.parse(jsonStr);
      } catch {
        // If JSON parsing fails, try to extract any JSON-like structure
        const jsonObjectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          try {
            parsedData = JSON.parse(jsonObjectMatch[0]);
          } catch {
            parsedData = { parseError: 'Could not parse structured data', rawResponse: jsonStr };
          }
        }
      }
    }

    // If no structured response, try simple extraction
    if (!rawText && !Object.keys(parsedData).length) {
      // Fallback: just do OCR + parsing in one go
      const fallbackResult = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data,
          },
        },
        extractionPrompt,
      ]);

      const fallbackText = fallbackResult.response.text();
      rawText = 'Extracted via Gemini Vision AI';
      
      // Try to parse as JSON
      const cleanedText = fallbackText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      try {
        parsedData = JSON.parse(cleanedText);
      } catch {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedData = JSON.parse(jsonMatch[0]);
          } catch {
            parsedData = { rawExtraction: cleanedText };
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        documentType,
        rawText: rawText || 'Text extracted via Gemini Vision',
        parsed: parsedData,
      },
      meta: {
        engine: 'Gemini Vision API',
        model: 'gemini-2.0-flash-exp',
        autoDetected: formData.get('document_type') === 'auto',
      },
    });

  } catch (error) {
    console.error('OCR Processing Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false, 
        error: `OCR processing failed: ${errorMessage}` 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;
  
  return NextResponse.json({
    status: hasApiKey ? 'healthy' : 'missing_api_key',
    engine: 'Gemini Vision API',
    model: 'gemini-2.0-flash-exp',
    ready: hasApiKey,
  });
}
