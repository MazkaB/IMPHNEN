# Pembukuan AI - Landing Page

Landing page yang profesional, simpel, dan inklusif untuk lansia dan disabilitas.

## 🎯 Fitur Aksesibilitas

- **Font besar** (18-20px base) untuk kemudahan membaca
- **Kontras tinggi** sesuai WCAG guidelines
- **Skip to content** link untuk screen reader
- **Keyboard navigation** yang baik dengan focus states
- **Reduced motion** support untuk yang sensitif animasi
- **High contrast mode** support
- **ARIA labels** untuk semua elemen interaktif
- **Semantic HTML** untuk screen readers

## 🚀 Quick Start

```bash
cd apps/landing
npm install
npm run dev
```

Buka http://localhost:3001

## 📁 Struktur

```
apps/landing/
├── src/
│   ├── app/
│   │   ├── globals.css    # Styles dengan aksesibilitas
│   │   ├── layout.tsx     # Root layout dengan skip link
│   │   └── page.tsx       # Main page
│   └── components/
│       ├── Navbar.tsx     # Navigasi dengan hotline
│       ├── Hero.tsx       # Hero section
│       ├── Features.tsx   # 4 fitur utama
│       ├── HowItWorks.tsx # Cara kerja 4 langkah
│       ├── Accessibility.tsx # Section aksesibilitas
│       ├── FAQ.tsx        # Pertanyaan umum
│       ├── CTA.tsx        # Call to action
│       └── Footer.tsx     # Footer dengan kontak
└── package.json
```

## 🎨 Design Principles

1. **Simpel** - Tidak ada elemen yang membingungkan
2. **Jelas** - Teks besar dan mudah dibaca
3. **Kontras** - Warna dengan kontras tinggi
4. **Inklusif** - Bisa digunakan semua orang
5. **Responsif** - Tampil baik di semua ukuran layar

## ♿ Accessibility Checklist

- [x] Color contrast ratio ≥ 4.5:1
- [x] Focus indicators visible
- [x] Skip to main content link
- [x] Semantic HTML structure
- [x] ARIA labels on interactive elements
- [x] Keyboard navigable
- [x] Reduced motion support
- [x] Large touch targets (min 44x44px)
- [x] Readable font sizes (min 18px)
