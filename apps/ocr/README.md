# NUSA AI - OCR Digitalisasi Dokumen

Aplikasi OCR untuk digitalisasi berbagai jenis dokumen menggunakan PaddleOCR + Gemini AI.

## Fitur

- 🧾 Scan struk belanja
- 📄 Scan invoice/faktur
- 🏦 Scan rekening koran
- 📋 Scan purchase order
- 📦 Scan kartu stok
- 📜 Scan kontrak/surat
- 🤖 Deteksi jenis dokumen otomatis

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend OCR**: Python FastAPI + PaddleOCR
- **AI Processing**: Google Gemini 2.0 Flash
- **Database**: Firebase Firestore

## Setup

### 1. Frontend (Next.js)

```bash
# Dari root monorepo
npm install
npm run dev:ocr
```

Frontend akan berjalan di http://localhost:3002

### 2. Backend OCR Service (Python)

```bash
cd apps/ocr/ocr-service

# Buat virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# atau
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Copy dan edit .env
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY

# Jalankan server
python main.py
```

OCR Service akan berjalan di http://localhost:8000

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_OCR_SERVICE_URL=http://localhost:8000
```

### Backend (ocr-service/.env)
```
GEMINI_API_KEY=your_gemini_api_key
ALLOWED_ORIGIN=http://localhost:3002
PORT=8000
```

## API Endpoints

### OCR Service

- `GET /` - Service info
- `GET /health` - Health check
- `POST /ocr/process` - Process document
  - Body: `multipart/form-data`
  - Fields: `file` (image), `document_type` (optional)

## Penggunaan

1. Buka http://localhost:3002
2. Upload foto dokumen (struk, invoice, dll)
3. Pilih jenis dokumen atau biarkan auto-detect
4. Klik "Proses OCR"
5. Review hasil dan simpan ke arsip
