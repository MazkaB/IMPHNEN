"""
Document Templates & Type Detection for Universal OCR
Supports multiple document types with intelligent field extraction
"""

import re
from typing import Dict, List, Optional, Any
import google.generativeai as genai

# Document type constants
DOC_TYPES = [
    'receipt',
    'invoice', 
    'purchase_order',
    'bank_statement',
    'stock_card',
    'contract'
]


def detect_document_type(ocr_text: str, gemini_model) -> str:
    """
    Use Gemini AI to detect document type from OCR text
    Returns one of: receipt, invoice, purchase_order, bank_statement, stock_card, contract
    """
    prompt = f"""Analisa teks OCR berikut dan tentukan jenis dokumennya.

TEKS OCR:
{ocr_text[:1000]}  

JENIS DOKUMEN YANG TERSEDIA:
1. receipt - Struk belanja dari toko/warung
2. invoice - Faktur/invoice untuk bisnis (ada PO number, terms, dll)
3. purchase_order - Pesanan pembelian (PO)
4. bank_statement - Rekening koran bank
5. stock_card - Kartu stok barang
6. contract - Kontrak/surat perjanjian

INSTRUKSI:
Jawab HANYA dengan satu kata dari pilihan di atas (lowercase).
Jika tidak yakin, pilih yang paling mendekati.

JAWABAN:"""

    try:
        response = gemini_model.generate_content(prompt)
        detected_type = response.text.strip().lower()
        
        # Validate response
        if detected_type in DOC_TYPES:
            return detected_type
        else:
            # Default to receipt if unclear
            print(f"[WARNING] Unknown document type detected: {detected_type}, defaulting to receipt")
            return 'receipt'
            
    except Exception as e:
        print(f"[ERROR] Document type detection failed: {e}")
        return 'receipt'  # Default fallback


def extract_receipt_fields(ocr_text: str, gemini_model) -> Dict[str, Any]:
    """Extract fields from receipt (existing logic)"""
    prompt = f"""Kamu adalah AI expert untuk parsing struk belanja Indonesia. 
Analisa teks OCR berikut dan extract informasi dengan format JSON yang tepat.

TEKS OCR:
{ocr_text}

INSTRUKSI:
1. Deteksi nama toko (biasanya di baris pertama/header)
2. Deteksi tanggal transaksi (format Indonesia: DD/MM/YYYY atau DD-MM-YYYY)
3. Extract SEMUA item belanja dengan harga yang benar
4. Hitung total yang akurat (jika tidak ada di struk, hitung dari items)
5. Abaikan teks yang bukan item (seperti "Terima Kasih", "Total", dll)

FORMAT OUTPUT (JSON):
{{
  "storeName": "nama toko",
  "date": "tanggal transaksi",
  "items": [
    {{"name": "nama item", "quantity": 1, "price": harga_angka}}
  ],
  "total": total_akhir
}}

ATURAN PENTING:
- Harga harus ANGKA tanpa "Rp" atau titik/koma
- Jika ada item dengan jumlah >1, multiply harga x quantity
- Total harus sum dari semua items
- Jika tidak yakin, skip item tersebut daripada salah

Berikan OUTPUT HANYA JSON, tanpa markdown atau teks lain."""

    try:
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown if present
        if result_text.startswith('```'):
            lines = result_text.split('\n')
            result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        import json
        parsed = json.loads(result_text)
        return parsed
        
    except Exception as e:
        print(f"[ERROR] Receipt parsing failed: {e}")
        return {
            "storeName": None,
            "date": None,
            "items": [],
            "total": 0
        }


def extract_invoice_fields(ocr_text: str, gemini_model) -> Dict[str, Any]:
    """Extract fields from business invoice"""
    prompt = f"""Analisa invoice berikut dan extract informasi penting.

TEKS OCR:
{ocr_text}

Extract informasi berikut dalam format JSON:
{{
  "invoiceNumber": "nomor invoice",
  "invoiceDate": "tanggal invoice",
  "dueDate": "tanggal jatuh tempo",
  "sellerName": "nama penjual/perusahaan",
  "sellerAddress": "alamat penjual",
  "buyerName": "nama pembeli",
  "buyerAddress": "alamat pembeli",
  "items": [
    {{
      "description": "deskripsi item",
      "quantity": jumlah,
      "unitPrice": harga_satuan,
      "amount": total_item
    }}
  ],
  "subtotal": subtotal,
  "tax": pajak,
  "total": total_akhir,
  "paymentTerms": "terms pembayaran",
  "notes": "catatan tambahan"
}}

ATURAN:
- Semua harga dalam angka (bukan string)
- Jika field tidak ditemukan, isi dengan null
- Output HANYA JSON tanpa markdown

JAWABAN:"""

    try:
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        if result_text.startswith('```'):
            lines = result_text.split('\n')
            result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        import json
        return json.loads(result_text)
        
    except Exception as e:
        print(f"[ERROR] Invoice parsing failed: {e}")
        return {"error": str(e)}


def extract_bank_statement_fields(ocr_text: str, gemini_model) -> Dict[str, Any]:
    """Extract fields from bank statement"""
    prompt = f"""Analisa rekening koran bank berikut dan extract informasi.

TEKS OCR:
{ocr_text}

Extract dalam format JSON:
{{
  "accountNumber": "nomor rekening",
  "accountHolder": "nama pemegang rekening",
  "bankName": "nama bank",
  "statementPeriod": "periode (misal: 01/01/2025 - 31/01/2025)",
  "openingBalance": saldo_awal,
  "closingBalance": saldo_akhir,
  "transactions": [
    {{
      "date": "tanggal",
      "description": "deskripsi transaksi",
      "debit": debit_amount,
      "credit": credit_amount,
      "balance": saldo_setelah_transaksi
    }}
  ],
  "totalDebit": total_debit,
  "totalCredit": total_credit
}}

Output HANYA JSON tanpa markdown.

JAWABAN:"""

    try:
        response = gemini_model.generate_content(prompt)
        result_text = response.text.strip()
        
        if result_text.startswith('```'):
            lines = result_text.split('\n')
            result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            result_text = result_text.replace('```json', '').replace('```', '').strip()
        
        import json
        return json.loads(result_text)
        
    except Exception as e:
        print(f"[ERROR] Bank statement parsing failed: {e}")
        return {"error": str(e)}


def extract_document_fields(
    ocr_text: str, 
    document_type: str, 
    gemini_model
) -> Dict[str, Any]:
    """
    Extract fields based on document type
    Returns structured data specific to each document type
    """
    extractors = {
        'receipt': extract_receipt_fields,
        'invoice': extract_invoice_fields,
        'bank_statement': extract_bank_statement_fields,
        # Add more as needed
    }
    
    extractor = extractors.get(document_type)
    if not extractor:
        print(f"[WARNING] No extractor for document type: {document_type}, using receipt fallback")
        extractor = extract_receipt_fields
    
    return extractor(ocr_text, gemini_model)
