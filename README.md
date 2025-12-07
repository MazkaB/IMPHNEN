# NUSA AI - Platform Digitalisasi UMKM Indonesia

<div align="center">

**NUSA AI** - Platform Digitalisasi UMKM Indonesia

![WhatsApp Image 2025-12-07 at 22 16 03_521a2804](https://github.com/user-attachments/assets/e537006f-e081-4b27-919e-c6e84e0acbde)


**Platform SaaS berbasis AI untuk membantu UMKM Indonesia dalam pencatatan keuangan, digitalisasi dokumen, dan analisis bisnis.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.1.0-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.4.4-EF4444?logo=turborepo)](https://turbo.build/)

[Demo Video](#-demo-video) • [Instalasi](#-instalasi) • [Fitur](#-fitur-utama) • [Screenshots](#-screenshots) • [Arsitektur](#-arsitektur)

</div>

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Problem & Solution](#-problem--solution)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur](#-arsitektur)
- [Instalasi](#-instalasi)
- [Screenshots](#-screenshots)
- [Demo Video](#-demo-video)
- [Tim](#-tim)

---

## 🎯 Tentang Project

**NUSA AI** adalah platform all-in-one yang membantu pelaku UMKM Indonesia dalam:
- 🎤 Mencatat transaksi dengan suara (Voice AI)
- 📱 Integrasi WhatsApp untuk pencatatan
- � SQcan struk/invoice dengan OCR + AI
- 📊 Dashboard analytics real-time
- 🎨 Auto-generate konten marketing

---

## 💡 Problem & Solution

### ❌ Masalah yang Dihadapi UMKM

| Masalah | Dampak |
|---------|--------|
| Pencatatan manual memakan waktu | 2-3 jam/hari untuk pembukuan |
| Struk dan nota menumpuk | Data hilang, sulit dilacak |
| Tidak paham analisis keuangan | Keputusan bisnis tidak tepat |
| Kesulitan membuat konten marketing | Kalah saing di era digital |

### ✅ Solusi NUSA AI

| Fitur | Solusi |
|-------|--------|
| **Voice AI** | Catat transaksi cukup dengan bicara |
| **OCR + Gemini AI** | Scan struk otomatis jadi data digital |
| **Dashboard Insight** | Analisis bisnis real-time dengan AI |
| **Content Creator** | Generate konten marketing otomatis |

---

## 🚀 Fitur Utama

### 1. 🎤 Voice Transaction (Main App)
- Pencatatan transaksi dengan suara bahasa Indonesia
- Natural Language Processing untuk parsing transaksi
- Integrasi WhatsApp untuk pencatatan via chat

### 2. 📷 OCR Digitalisasi (OCR App)
- Scan struk belanja, invoice, rekening koran
- Auto-detect jenis dokumen dengan Gemini Vision AI
- Parsing data terstruktur langsung dari gambar
- Arsip digital otomatis ke Firebase
- **100% Serverless** - No Python backend needed!

### 3. 📊 Dashboard Insight (Insight App)
- Profit/Loss real-time
- Sales trend chart
- Best seller products
- Price recommendation AI
- Purchase recommendation
- Export data ke Excel

### 4. 🎨 Content Creator (Content App)
- Generate caption Instagram/TikTok
- Buat poster promosi otomatis
- Template konten UMKM

### 5. 🏠 Landing Page
- Informasi produk lengkap
- Accessibility features (Text-to-Speech)
- Responsive design

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.3 | React Framework (App Router) |
| React | 19.0.0 | UI Library |
| TypeScript | 5.7.2 | Type Safety |
| Tailwind CSS | 3.4.17 | Styling |
| Recharts | 2.15.0 | Charts & Visualization |
| Framer Motion | 11.15.0 | Animations |
| Lucide React | 0.469.0 | Icons |

### Backend & Services
| Technology | Version | Purpose |
|------------|---------|---------|
| Firebase | 11.1.0 | Auth, Firestore, Storage |
| Firebase Admin | 13.0.2 | Server-side Operations |
| Google Gemini | 2.0 Flash | AI Processing & Vision OCR |

### Build Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| Turborepo | 2.4.4 | Monorepo Build System |
| pnpm/npm | 10.9.2 | Package Manager |
| ESLint | 9.17.0 | Linting |

### State & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| Zustand | 5.0.2 | State Management |
| Zod | 3.24.1 | Schema Validation |
| date-fns | 4.1.0 | Date Manipulation |

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        NUSA AI Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ Landing  │  │   App    │  │   OCR    │  │ Insight  │        │
│  │  :3000   │  │  :3001   │  │  :3002   │  │  :3003   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴──────┬──────┴─────────────┘               │
│                            │                                     │
│  ┌─────────────────────────┴─────────────────────────┐          │
│  │              Shared Packages                       │          │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  │          │
│  │  │   UI   │  │ Types  │  │Tailwind│  │  TS    │  │          │
│  │  └────────┘  └────────┘  └────────┘  └────────┘  │          │
│  └───────────────────────────────────────────────────┘          │
│                            │                                     │
│  ┌─────────────────────────┴─────────────────────────┐          │
│  │              Firebase Services                     │          │
│  │  ┌────────┐  ┌────────┐  ┌────────┐              │          │
│  │  │  Auth  │  │Firestore│ │Storage │              │          │
│  │  └────────┘  └────────┘  └────────┘              │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Struktur Folder

```
nusa-ai-monorepo/
├── apps/
│   ├── landing/          # Landing Page (Next.js)
│   │   └── src/
│   │       ├── app/      # App Router pages
│   │       └── components/
│   │
│   ├── app/              # Main Application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (protected)/  # Auth-protected routes
│   │       │   ├── login/
│   │       │   └── register/
│   │       ├── components/
│   │       ├── lib/firebase/
│   │       └── store/
│   │
│   ├── ocr/              # OCR Application (Gemini Vision)
│   │   └── src/
│   │       ├── app/
│   │       │   └── api/ocr/  # Serverless OCR API
│   │       └── lib/
│   │
│   ├── insight/          # Dashboard Insight
│   │   └── src/
│   │       ├── app/
│   │       │   ├── dashboard/
│   │       │   ├── analytics/
│   │       │   ├── transactions/
│   │       │   └── products/
│   │       ├── components/
│   │       └── lib/
│   │
│   └── content/          # Content Creator
│       └── src/
│
├── packages/
│   ├── ui/               # Shared UI Components
│   │   └── src/
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── utils.ts
│   │
│   ├── types/            # Shared TypeScript Types
│   ├── config-tailwind/  # Shared Tailwind Config
│   └── config-typescript/# Shared TS Config
│
├── firebase.json         # Firebase config
├── turbo.json           # Turborepo config
└── package.json         # Root package.json
```

---

## 📥 Instalasi

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- Python >= 3.10 (untuk OCR service)
- Git

### Step 1: Clone Repository

```bash
git clone https://github.com/your-team/nusa-ai.git
cd nusa-ai
```

### Step 2: Install Dependencies

```bash
# Install semua dependencies
npm install
```

### Step 3: Setup Environment Variables

```bash
# Copy environment template untuk setiap app
cp apps/app/.env.example apps/app/.env.local
cp apps/ocr/.env.example apps/ocr/.env.local
cp apps/insight/.env.example apps/insight/.env.local
cp apps/content/.env.example apps/content/.env.local
```

Edit setiap `.env.local` dengan credentials Firebase:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App URLs - Cross-app navigation (Production)
NEXT_PUBLIC_APP_URL=https://nusa-app-khaki.vercel.app
NEXT_PUBLIC_LANDING_URL=https://nusa-landing-delta.vercel.app
NEXT_PUBLIC_INSIGHT_URL=https://nusa-insight.vercel.app
NEXT_PUBLIC_OCR_URL=https://nusa-ocr.vercel.app
NEXT_PUBLIC_CONTENT_URL=https://nusa-content.vercel.app
```

### Step 4: Jalankan Aplikasi

```bash
# Jalankan semua apps sekaligus
npm run dev

# Atau jalankan app tertentu
npm run dev:landing   # http://localhost:3000
npm run dev:main      # http://localhost:3001
npm run dev:ocr       # http://localhost:3002
npm run dev:insight   # http://localhost:3003
npm run dev:content   # http://localhost:3004
```

> **Note:** OCR app menggunakan Gemini Vision API langsung, tidak perlu menjalankan Python backend terpisah!

---

## 📸 Screenshots

> **Note:** Screenshots aplikasi dapat dilihat di video demo atau dengan menjalankan aplikasi secara lokal.

### Fitur yang Dapat Dilihat:

| App | Fitur | URL |
|-----|-------|-----|
| Landing | Hero, Features, Pricing, FAQ | [nusa-landing-delta.vercel.app](https://nusa-landing-delta.vercel.app) |
| Main App | Voice Recording, Dashboard, OCR | [nusa-app-khaki.vercel.app](https://nusa-app-khaki.vercel.app) |
| Insight | Analytics Dashboard, Charts | [nusa-insight.vercel.app](https://nusa-insight.vercel.app) |
| OCR | Document Scanner, AI Parsing | [nusa-ocr.vercel.app](https://nusa-ocr.vercel.app) |
| Content | AI Content Generator | [nusa-content.vercel.app](https://nusa-content.vercel.app) |

---

## 🎬 Demo Video

> **Demo Video:** Link video demo akan ditambahkan setelah proses recording selesai.

### Live Demo URLs:

| App | Production URL | Status |
|-----|----------------|--------|
| 🏠 Landing | https://nusa-landing-delta.vercel.app | ✅ Live |
| 📱 Main App | https://nusa-app-khaki.vercel.app | ✅ Live |
| 📊 Insight | https://nusa-insight.vercel.app | ✅ Live |
| 📷 OCR | https://nusa-ocr.vercel.app | ✅ Live |
| 🎨 Content | https://nusa-content.vercel.app | ✅ Live |

---

## 👥 Tim

| Nama | Role | Kontribusi |
|------|------|------------|
| **Mazka** | Full Stack | Main App, Auth, Voice AI |
| **Fattah** | Backend | OCR Service, Digitalisasi |
| **Pancar** | Data | Dashboard Insight, Analytics |
| **Agung** | AI/ML | Content Creator, Gemini AI |
| **Ima** | QA/Design | Testing, Video, Desain |

---

## 📄 License

MIT License - Lihat [LICENSE](LICENSE) untuk detail.

---

<div align="center">

**Made with ❤️ for UMKM Indonesia**

[⬆ Kembali ke Atas](#-nusa-ai---platform-digitalisasi-umkm-indonesia)

</div>
