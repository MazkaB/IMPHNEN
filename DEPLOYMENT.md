# Vercel Deployment Guide - Monorepo

Setiap app di `apps/` di-deploy sebagai project Vercel terpisah.

## Deployed Apps

| App | Vercel Project | Production URL |
|-----|----------------|----------------|
| `landing` | nusa-landing | https://nusa-landing-delta.vercel.app |
| `app` | nusa-app | https://nusa-app-khaki.vercel.app |
| `insight` | nusa-insight | https://nusa-insight.vercel.app |
| `ocr` | nusa-ocr | https://nusa-ocr.vercel.app |
| `content` | nusa-content | https://nusa-content.vercel.app |

## Cross-App Navigation

Setiap app memiliki file `src/lib/urls.ts` yang berisi konfigurasi URL terpusat:

```typescript
import { getLoginUrl, getDashboardUrl, getInsightUrl } from '@/lib/urls';

// Gunakan di komponen
<Link href={getLoginUrl()}>Login</Link>
```

## Environment Variables

Set di Vercel Dashboard untuk setiap project:

### Semua Apps (Required)
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Cross-app URLs
NEXT_PUBLIC_APP_URL=https://nusa-app-khaki.vercel.app
NEXT_PUBLIC_LANDING_URL=https://nusa-landing-delta.vercel.app
NEXT_PUBLIC_INSIGHT_URL=https://nusa-insight.vercel.app
NEXT_PUBLIC_OCR_URL=https://nusa-ocr.vercel.app
NEXT_PUBLIC_CONTENT_URL=https://nusa-content.vercel.app
```

### apps/app (Additional)
```
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=...
```

## Deploy via CLI

```bash
# 1. Update vercel.json filter dan outputDirectory untuk app target
# 2. Link ke project
vercel link --yes --project=nusa-<app-name>

# 3. Deploy
vercel --prod
```

### Quick Deploy Script (PowerShell)

```powershell
# Landing
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
# Edit vercel.json: filter=landing, outputDirectory=apps/landing/.next
vercel link --yes --project=nusa-landing; vercel --prod

# App
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
# Edit vercel.json: filter=app, outputDirectory=apps/app/.next
vercel link --yes --project=nusa-app; vercel --prod

# Insight
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
# Edit vercel.json: filter=insight, outputDirectory=apps/insight/.next
vercel link --yes --project=nusa-insight; vercel --prod

# OCR
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
# Edit vercel.json: filter=ocr, outputDirectory=apps/ocr/.next
vercel link --yes --project=nusa-ocr; vercel --prod

# Content
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
# Edit vercel.json: filter=content, outputDirectory=apps/content/.next
vercel link --yes --project=nusa-content; vercel --prod
```
