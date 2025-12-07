# Tech Stack Guidelines

## Current Versions (December 2025)

### Core Framework
- **Next.js**: 15.1.3 (App Router)
- **React**: 19.0.0
- **TypeScript**: 5.7.2

### Build Tools
- **Turborepo**: 2.4.4
- **Node.js**: >=20

### Styling
- **Tailwind CSS**: 3.4.17
- **class-variance-authority**: 0.7.1
- **tailwind-merge**: 2.6.0

### Backend Services
- **Firebase**: 11.1.0 (Client SDK)
- **Firebase Admin**: 13.0.2 (Server SDK)

### State & Validation
- **Zustand**: 5.0.2
- **Zod**: 3.24.1

### AI Services
- **@google/generative-ai**: 0.21.0
- **OpenAI**: 4.77.3

## Firebase Modular API

Always use modular imports:
```typescript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
```

## Component Patterns

Use CVA for component variants:
```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

const buttonVariants = cva('base-classes', {
  variants: { variant: { primary: '...', secondary: '...' } },
  defaultVariants: { variant: 'primary' }
});
```

## Monorepo Structure

- `apps/*` - Next.js applications
- `packages/ui` - Shared UI components
- `packages/types` - Shared TypeScript types
- `packages/config-*` - Shared configurations
