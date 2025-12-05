# Pembukuan AI - Platform SaaS untuk UMKM

Platform AI yang membantu UMKM mencatat transaksi, menganalisis keuangan, dan membuat konten marketing.

## 🚀 Fitur Utama

1. **AI Pencatatan Keuangan Suara** (Mazka)
   - Pencatatan dengan suara Bahasa Indonesia + dialek lokal
   - WhatsApp Bot untuk pencatatan 24/7
   - Ramah disabilitas (tunanetra, lansia)

2. **Digitalisasi Arsip OCR** (Fattah)
   - Scan bon fisik / struk tulisan tangan
   - Auto-ekstraksi data transaksi

3. **Dashboard Insight AI** (Pancar)
   - Rekomendasi harga, stok, tren
   - Analisis profit dan prediksi

4. **Auto Content Creator** (Agung)
   - Generate poster produk otomatis
   - Caption marketing untuk Instagram/WA/TikTok

## 📁 Struktur Project

```
Pembukuan AI/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── transactions/  # CRUD transaksi
│   │   │   ├── voice/         # Voice processing
│   │   │   └── webhook/       # WhatsApp webhook
│   │   ├── (protected)/       # Halaman yang butuh auth
│   │   │   ├── dashboard/
│   │   │   ├── voice/
│   │   │   ├── ocr/
│   │   │   ├── insights/
│   │   │   ├── content/
│   │   │   ├── whatsapp/
│   │   │   └── settings/
│   │   ├── login/
│   │   ├── register/
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── auth/              # Login, Register forms
│   │   ├── layout/            # Navbar, Sidebar
│   │   ├── transactions/      # Transaction components
│   │   ├── ui/                # Reusable UI components
│   │   └── voice/             # Voice recorder
│   ├── lib/
│   │   ├── ai/                # AI processors (OpenAI, Gemini)
│   │   ├── firebase/          # Firebase config & services
│   │   └── whatsapp/          # Twilio WhatsApp integration
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript types
├── .env.example               # Environment variables template
└── package.json
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **AI**: OpenAI (Whisper, GPT-4), Google Gemini
- **WhatsApp**: Twilio API
- **State**: Zustand

## 📦 Instalasi

1. Clone repository
2. Install dependencies:
   ```bash
   cd "Pembukuan AI"
   npm install
   ```

3. Copy `.env.example` ke `.env.local` dan isi dengan credentials:
   ```bash
   cp .env.example .env.local
   ```

4. Setup Firebase:
   - Buat project di [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Download service account key untuk Admin SDK

5. Setup Twilio (untuk WhatsApp):
   - Daftar di [Twilio](https://www.twilio.com)
   - Aktifkan WhatsApp Sandbox
   - Catat Account SID, Auth Token, dan WhatsApp Number

6. Setup OpenAI:
   - Dapatkan API key dari [OpenAI](https://platform.openai.com)

7. Jalankan development server:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

```env
# Firebase (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (Server)
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# AI
OPENAI_API_KEY=
GOOGLE_GEMINI_API_KEY=

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
WEBHOOK_SECRET=
```

## 🔒 Security Notes

- **JANGAN** commit file `.env.local` ke repository
- **JANGAN** expose API keys di client-side code
- Semua API routes memvalidasi Firebase Auth token
- WhatsApp webhook memvalidasi Twilio signature
- Input user di-sanitize sebelum diproses

## 📱 WhatsApp Bot Commands

| Command | Fungsi |
|---------|--------|
| `bantuan` | Menu bantuan |
| `saldo` | Ringkasan keuangan |
| `laporan` | Laporan bulanan |
| `link [email]` | Hubungkan ke akun web |

**Contoh Pencatatan:**
- "jual bakso 50 porsi 15 ribu"
- "beli tepung 10 kilo 150 ribu"
- Kirim voice note untuk catat dengan suara
- Kirim foto struk untuk scan OCR

## 👥 Tim Pengembang

- **Mazka**: AI Pencatatan Suara & WhatsApp Bot, Integrasi Website
- **Fattah**: Digitalisasi Arsip OCR
- **Pancar**: Dashboard Insight AI
- **Agung**: Auto Content Creator
- **Sweetie**: Video, PPT, QA Tester, Desain

## 📄 License

MIT License
