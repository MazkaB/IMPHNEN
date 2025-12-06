# NUSA AI - OCR Digitalisasi Dokumen

Aplikasi OCR untuk digitalisasi berbagai jenis dokumen menggunakan **Gemini 2.0 Flash Vision AI**.

## Fitur

- 🧾 Scan struk belanja
- 📄 Scan invoice/faktur
- 🏦 Scan rekening koran
- 📋 Scan purchase order
- 📦 Scan kartu stok
- 📜 Scan kontrak/surat
- 🤖 Deteksi jenis dokumen otomatis dengan AI

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **OCR Engine**: Gemini 2.0 Flash Vision API (serverless)
- **Database**: Firebase Firestore
- **Deployment**: Vercel (no external backend needed!)

## Arsitektur

```
┌─────────────────────────────────────────────────┐
│  Browser                                        │
│  ┌─────────────────────────────────────────┐   │
│  │  Upload Image → Preview → Process       │   │
│  └─────────────────────────────────────────┘   │
│                      │                          │
│                      ▼                          │
│  ┌─────────────────────────────────────────┐   │
│  │  Next.js API Route                      │   │
│  │  /api/ocr/process                       │   │
│  │  - Receive image                        │   │
│  │  - Convert to base64                    │   │
│  │  - Call Gemini Vision API               │   │
│  │  - Parse & return structured data       │   │
│  └─────────────────────────────────────────┘   │
│                      │                          │
│                      ▼                          │
│  ┌─────────────────────────────────────────┐   │
│  │  Gemini 2.0 Flash Vision                │   │
│  │  - Auto-detect document type            │   │
│  │  - OCR text extraction                  │   │
│  │  - Intelligent data parsing             │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Setup

### 1. Install Dependencies

```bash
# Dari root monorepo
npm install

# Atau khusus OCR app
cd apps/ocr
npm install
```

### 2. Environment Variables

Copy `.env.example` ke `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI API Key (REQUIRED for OCR)
# Get your API key from: https://makersuite.google.com/app/apikey
GOOGLE_AI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server

```bash
npm run dev:ocr
# atau
cd apps/ocr && npm run dev
```

Frontend akan berjalan di http://localhost:3002

## API Endpoints

### POST /api/ocr/process

Process document image with Gemini Vision AI.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (JPG, PNG, max 10MB)
  - `document_type`: (optional) `auto` | `receipt` | `invoice` | `purchase_order` | `bank_statement` | `stock_card` | `contract`

**Response:**
```json
{
  "success": true,
  "data": {
    "documentType": "receipt",
    "rawText": "extracted text...",
    "parsed": {
      "storeName": "Toko ABC",
      "date": "01/01/2025",
      "items": [
        {"name": "Item 1", "quantity": 2, "price": 10000}
      ],
      "total": 20000
    }
  },
  "meta": {
    "engine": "Gemini Vision API",
    "model": "gemini-2.0-flash-exp",
    "autoDetected": true
  }
}
```

### GET /api/ocr/process

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "engine": "Gemini Vision API",
  "model": "gemini-2.0-flash-exp",
  "ready": true
}
```

## Deployment

Deploy ke Vercel tanpa konfigurasi tambahan:

```bash
vercel --prod
```

**Environment Variables di Vercel:**
- Set `GOOGLE_AI_API_KEY` di Vercel Dashboard → Settings → Environment Variables

## Penggunaan

1. Buka http://localhost:3002 (atau URL production)
2. Upload foto dokumen (struk, invoice, dll)
3. Pilih jenis dokumen atau biarkan auto-detect
4. Klik "Proses OCR"
5. Review hasil dan simpan ke arsip

## Supported Document Types

| Type | Description | Extracted Fields |
|------|-------------|------------------|
| `receipt` | Struk belanja | storeName, date, items, total |
| `invoice` | Invoice/Faktur | invoiceNumber, vendor, items, tax, total |
| `purchase_order` | Purchase Order | poNumber, vendor, items, total |
| `bank_statement` | Rekening Koran | bankName, transactions, balance |
| `stock_card` | Kartu Stok | itemName, movements, currentStock |
| `contract` | Kontrak/Surat | parties, subject, keyTerms, value |

## Notes

- **No Python backend required!** - Semua processing dilakukan via Gemini Vision API
- **Serverless friendly** - Bisa deploy ke Vercel tanpa server tambahan
- **Max file size**: 10MB
- **Supported formats**: JPG, PNG, WEBP, GIF
