import { GoogleGenerativeAI } from '@google/generative-ai';
import { TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';

// Validasi API key
const getGeminiClient = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY tidak ditemukan. Pastikan sudah diset di .env.local');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

interface ParsedTransaction {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  confidence: number;
}

const PARSER_PROMPT = `Kamu adalah asisten AI untuk UMKM Indonesia yang membantu mencatat transaksi keuangan.

Analisis input berikut dan ekstrak informasi transaksi dalam format JSON:

KATEGORI PENGELUARAN: ${EXPENSE_CATEGORIES.join(', ')}
KATEGORI PEMASUKAN: ${INCOME_CATEGORIES.join(', ')}

ATURAN:
1. Tentukan tipe: "income" untuk pemasukan, "expense" untuk pengeluaran
2. Ekstrak jumlah dalam angka (konversi ribu/juta ke angka)
3. Buat deskripsi singkat
4. Pilih kategori yang paling sesuai
5. Berikan confidence 0.0-1.0

CONTOH:
Input: "jual nasi goreng 20 porsi 15 ribu"
Output: {"type":"income","amount":300000,"description":"Penjualan nasi goreng 20 porsi","category":"Penjualan Produk","confidence":0.95}

Input: "beli gas 3 tabung 60 ribu"
Output: {"type":"expense","amount":180000,"description":"Pembelian gas 3 tabung","category":"Bahan Baku","confidence":0.9}

PENTING: Hanya kembalikan JSON, tanpa penjelasan tambahan.`;

// Parse text input menggunakan Gemini
export const parseWithGemini = async (input: string): Promise<ParsedTransaction> => {
  if (!input || input.trim().length === 0) {
    throw new Error('Input kosong');
  }

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const result = await model.generateContent(`${PARSER_PROMPT}\n\nInput: "${input}"`);
  const response = await result.response;
  const text = response.text();

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gagal mengekstrak JSON dari respons AI');
  }

  const parsed = JSON.parse(jsonMatch[0]) as ParsedTransaction;

  // Validasi
  if (!parsed.type || !['income', 'expense'].includes(parsed.type)) {
    throw new Error('Tipe transaksi tidak valid');
  }

  if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
    throw new Error('Jumlah transaksi tidak valid');
  }

  return parsed;
};

// Generate insight dari data transaksi
export const generateInsight = async (
  transactions: Array<{ type: string; amount: number; category: string; description: string }>
): Promise<string[]> => {
  if (transactions.length === 0) {
    return ['Belum ada data transaksi untuk dianalisis'];
  }

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const prompt = `Analisis data keuangan UMKM berikut dan berikan 3-5 rekomendasi praktis:

Total Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
Total Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
Profit: Rp ${(totalIncome - totalExpense).toLocaleString('id-ID')}

Detail transaksi terakhir:
${transactions.slice(0, 10).map((t) => `- ${t.type}: Rp ${t.amount.toLocaleString('id-ID')} (${t.category})`).join('\n')}

Berikan rekomendasi dalam format JSON array of strings, contoh:
["Rekomendasi 1", "Rekomendasi 2", "Rekomendasi 3"]

Fokus pada:
- Efisiensi pengeluaran
- Peluang meningkatkan pendapatan
- Manajemen cash flow`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    return ['Analisis sedang diproses, coba lagi nanti'];
  }

  return JSON.parse(jsonMatch[0]) as string[];
};
