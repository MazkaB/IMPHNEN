# Contributing to NUSA AI

Terima kasih telah tertarik untuk berkontribusi ke NUSA AI!

## 🚀 Quick Start untuk Developer

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/your-team/nusa-ai.git
cd nusa-ai

# Install dependencies
npm install

# Setup environment variables
cp apps/app/.env.example apps/app/.env.local
# Edit .env.local dengan credentials Anda

# Jalankan development server
npm run dev
```

## 📁 Struktur Project

```
apps/
├── landing/    # Landing page (port 3000)
├── app/        # Main app (port 3001)
├── ocr/        # OCR service (port 3002)
├── insight/    # Dashboard (port 3003)
└── content/    # Content creator (port 3004)

packages/
├── ui/         # Shared UI components
├── types/      # Shared TypeScript types
├── config-tailwind/    # Tailwind config
└── config-typescript/  # TypeScript config
```

## 🔧 Development Commands

```bash
# Run all apps
npm run dev

# Run specific app
npm run dev:landing
npm run dev:main
npm run dev:ocr
npm run dev:insight
npm run dev:content

# Build all apps
npm run build

# Lint all apps
npm run lint

# Clean build artifacts
npm run clean
```

## 📝 Code Style Guidelines

### Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase dengan prefix `use` (`useAuth.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

### File Organization
- Satu komponen per file
- Group related files dalam folder
- Index files untuk re-exports

### TypeScript
- Selalu gunakan TypeScript
- Define interfaces untuk props
- Avoid `any` type

### Commits
- Gunakan conventional commits
- Format: `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## 🔒 Security Guidelines

- **JANGAN** commit `.env.local` atau credentials
- Gunakan environment variables untuk secrets
- Validasi semua input user dengan Zod
- Sanitize data sebelum render

## 🧪 Testing

```bash
# Run tests (jika ada)
npm run test

# Run tests dengan coverage
npm run test:coverage
```

## 📦 Adding Dependencies

```bash
# Add ke specific app
npm install package-name -w apps/app

# Add ke shared package
npm install package-name -w packages/ui

# Add ke root (dev dependency)
npm install -D package-name
```

## 🚀 Deployment

```bash
# Build untuk production
npm run build

# Deploy ke Firebase
firebase deploy
```

## ❓ Questions?

Buat issue di GitHub atau hubungi tim development.
