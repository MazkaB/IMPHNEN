import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY tidak ditemukan di environment variables.');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

// Use Gemini 2.5 Flash for better performance
export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
