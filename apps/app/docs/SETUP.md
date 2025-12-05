# Setup Guide - Pembukuan AI

## Prerequisites

- Node.js 18+ 
- npm atau yarn
- Akun Firebase
- Akun Twilio (untuk WhatsApp)
- Akun OpenAI (untuk AI features)

---

## 1. Clone & Install

```bash
cd "Pembukuan AI"
npm install
```

---

## 2. Setup Firebase

### 2.1 Buat Project Firebase
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Klik "Add Project"
3. Beri nama project (contoh: "pembukuan-ai")
4. Disable Google Analytics (opsional)
5. Klik "Create Project"

### 2.2 Enable Authentication
1. Di sidebar, klik "Authentication"
2. Klik "Get Started"
3. Tab "Sign-in method", enable "Email/Password"

### 2.3 Create Firestore Database
1. Di sidebar, klik "Firestore Database"
2. Klik "Create Database"
3. Pilih "Start in production mode"
4. Pilih region terdekat (asia-southeast1 untuk Indonesia)

### 2.4 Get Web Config
1. Di Project Overview, klik icon Web (</>) 
2. Register app dengan nama (contoh: "pembukuan-ai-web")
3. Copy config values ke `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=pembukuan-ai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=pembukuan-ai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=pembukuan-ai.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 2.5 Get Service Account (Admin SDK)
1. Di Project Settings > Service Accounts
2. Klik "Generate new private key"
3. Download JSON file
4. Copy values ke `.env.local`:

```env
FIREBASE_ADMIN_PROJECT_ID=pembukuan-ai
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxx@pembukuan-ai.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**PENTING:** Jangan commit file JSON service account!

### 2.6 Deploy Firestore Rules
```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

---

## 3. Setup Twilio (WhatsApp)

### 3.1 Buat Akun Twilio
1. Daftar di [Twilio](https://www.twilio.com/try-twilio)
2. Verifikasi email dan nomor telepon

### 3.2 Aktifkan WhatsApp Sandbox
1. Di Console, cari "WhatsApp"
2. Klik "Try WhatsApp"
3. Ikuti instruksi untuk join sandbox
4. Catat nomor WhatsApp sandbox

### 3.3 Get Credentials
1. Di Dashboard, catat:
   - Account SID
   - Auth Token

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3.4 Setup Webhook
1. Di WhatsApp Sandbox Settings
2. Set "When a message comes in" ke:
   `https://your-domain.com/api/webhook/whatsapp`
3. Method: POST

---

## 4. Setup OpenAI

### 4.1 Get API Key
1. Buka [OpenAI Platform](https://platform.openai.com)
2. Login/Register
3. Di API Keys, klik "Create new secret key"
4. Copy key ke `.env.local`:

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 4.2 (Opsional) Setup Google Gemini
1. Buka [Google AI Studio](https://makersuite.google.com)
2. Get API key
3. Copy ke `.env.local`:

```env
GOOGLE_GEMINI_API_KEY=AIza...
```

---

## 5. Environment Variables

Buat file `.env.local` dari template:

```bash
cp .env.example .env.local
```

Isi semua values yang diperlukan.

---

## 6. Run Development Server

```bash
npm run dev
```

Buka http://localhost:3000

---

## 7. Testing

### Test Authentication
1. Buka http://localhost:3000/register
2. Daftar dengan email baru
3. Login dan cek dashboard

### Test Voice Recording
1. Login ke dashboard
2. Klik tombol mikrofon
3. Ucapkan transaksi (contoh: "jual bakso 10 porsi 15 ribu")
4. Verifikasi hasil parsing

### Test WhatsApp (Sandbox)
1. Join Twilio WhatsApp Sandbox
2. Kirim pesan ke nomor sandbox
3. Cek response dari bot

---

## 8. Deployment

### Vercel (Recommended)
1. Push ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

### Manual
```bash
npm run build
npm start
```

---

## Troubleshooting

### Firebase Auth Error
- Pastikan domain sudah di-whitelist di Firebase Console
- Check API key restrictions

### WhatsApp Webhook Error
- Pastikan URL webhook accessible dari internet
- Check Twilio signature validation
- Gunakan ngrok untuk local testing

### Voice Recording Error
- Pastikan browser support MediaRecorder API
- Check microphone permissions
- Gunakan HTTPS (required untuk getUserMedia)

---

## Tim Support

- **Mazka**: Voice AI, WhatsApp Bot, Integration
- **Fattah**: OCR Features
- **Pancar**: Dashboard Insights
- **Agung**: Content Creator
