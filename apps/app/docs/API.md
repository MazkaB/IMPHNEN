# API Documentation

## Authentication

Semua API endpoints (kecuali webhook) memerlukan Firebase Auth token di header:

```
Authorization: Bearer <firebase_id_token>
```

## Endpoints

### Transactions

#### GET /api/transactions
Mengambil daftar transaksi user.

**Query Parameters:**
- `limit` (optional): Jumlah maksimal transaksi (default: 100)
- `summary` (optional): Jika `true`, hanya return summary

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "userId": "user123",
      "type": "income",
      "amount": 150000,
      "description": "Penjualan bakso",
      "category": "Penjualan Produk",
      "source": "voice",
      "rawInput": "jual bakso 10 porsi 15 ribu",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Summary Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 5000000,
    "totalExpense": 2000000,
    "netProfit": 3000000,
    "transactionCount": 50
  }
}
```

#### POST /api/transactions
Membuat transaksi baru.

**Request Body:**
```json
{
  "type": "income" | "expense",
  "amount": 150000,
  "description": "Penjualan bakso 10 porsi",
  "category": "Penjualan Produk",
  "source": "manual" | "voice" | "ocr" | "whatsapp",
  "rawInput": "optional - input asli dari voice/ocr"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "abc123"
  },
  "message": "Transaksi berhasil disimpan"
}
```

#### GET /api/transactions/[id]
Mengambil detail transaksi.

#### PATCH /api/transactions/[id]
Update transaksi.

**Request Body:**
```json
{
  "type": "income",
  "amount": 200000,
  "description": "Updated description",
  "category": "Penjualan Produk"
}
```

#### DELETE /api/transactions/[id]
Hapus transaksi.

---

### Voice Processing

#### POST /api/voice/transcribe
Transkripsi audio dan parse transaksi.

**Request:**
- Content-Type: `multipart/form-data`
- `audio`: File audio (webm, ogg, mp3, wav)
- `autoSave`: `true` | `false` - auto save jika confidence tinggi

**Response:**
```json
{
  "success": true,
  "data": {
    "transcription": "jual bakso 10 porsi 15 ribu",
    "parsed": {
      "type": "income",
      "amount": 150000,
      "description": "Penjualan bakso 10 porsi",
      "category": "Penjualan Produk",
      "confidence": 0.95
    },
    "transactionId": "abc123",
    "confirmationMessage": "Transaksi berhasil dicatat!",
    "autoSaved": true
  }
}
```

---

### WhatsApp Webhook

#### POST /api/webhook/whatsapp
Webhook untuk menerima pesan dari Twilio WhatsApp.

**Headers:**
- `x-twilio-signature`: Signature untuk validasi

**Request Body:** Form data dari Twilio

**Response:** TwiML XML

---

## Error Responses

Semua error mengikuti format:

```json
{
  "success": false,
  "error": "Pesan error",
  "details": [] // optional - validation errors
}
```

**HTTP Status Codes:**
- `400` - Bad Request (validasi gagal)
- `401` - Unauthorized (token tidak valid)
- `403` - Forbidden (tidak punya akses)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- API calls: 100 requests per minute per user
- Voice transcription: 10 requests per minute per user
- WhatsApp webhook: No limit (handled by Twilio)

---

## Categories

### Expense Categories
- Bahan Baku
- Operasional
- Gaji Karyawan
- Sewa
- Listrik & Air
- Transportasi
- Marketing
- Peralatan
- Lainnya

### Income Categories
- Penjualan Produk
- Penjualan Jasa
- Piutang Terbayar
- Investasi
- Lainnya
