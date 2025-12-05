// Centralized URL configuration for cross-app navigation
export const APP_URLS = {
  landing: process.env.NEXT_PUBLIC_LANDING_URL || 'https://nusa-landing-delta.vercel.app',
  app: process.env.NEXT_PUBLIC_APP_URL || 'https://nusa-app-khaki.vercel.app',
  insight: process.env.NEXT_PUBLIC_INSIGHT_URL || 'https://nusa-insight.vercel.app',
  ocr: process.env.NEXT_PUBLIC_OCR_URL || 'https://nusa-ocr.vercel.app',
  content: process.env.NEXT_PUBLIC_CONTENT_URL || 'https://nusa-content.vercel.app',
} as const;

// Helper functions for common routes
export const getLoginUrl = () => `${APP_URLS.app}/login`;
export const getRegisterUrl = () => `${APP_URLS.app}/register`;
export const getDashboardUrl = () => `${APP_URLS.app}/dashboard`;
export const getInsightUrl = () => APP_URLS.insight;
export const getOcrUrl = () => APP_URLS.ocr;
export const getContentUrl = () => APP_URLS.content;
export const getLandingUrl = () => APP_URLS.landing;
