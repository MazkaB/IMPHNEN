import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';

// Call OpenAI API directly using fetch
const callOpenAI = async (messages: { role: string; content: string }[], maxTokens = 200) => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY tidak ditemukan');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI API error');
  }

  return data.choices?.[0]?.message?.content || '';
};

// Interface untuk hasil parsing
interface ParsedVoiceInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  confidence: number;
}

// Prompt untuk parsing transaksi
const TRANSACTION_PARSER_PROMPT = `Kamu adalah asisten AI untuk UMKM Indonesia yang membantu mencatat transaksi keuangan.

TUGAS:
Analisis input teks dan ekstrak informasi transaksi.

ATURAN:
1. Tentukan apakah ini PEMASUKAN (income) atau PENGELUARAN (expense)
2. Ekstrak jumlah uang (dalam Rupiah)
3. Buat deskripsi singkat
4. Tentukan kategori yang sesuai

KATEGORI PENGELUARAN: ${EXPENSE_CATEGORIES.join(', ')}
KATEGORI PEMASUKAN: ${INCOME_CATEGORIES.join(', ')}

CONTOH:
- "Jual bakso 50 porsi harga 15 ribu" → income, 750000, "Penjualan bakso 50 porsi", "Penjualan Produk"
- "Beli tepung 10 kilo 150 ribu" → expense, 150000, "Pembelian tepung 10 kg", "Bahan Baku"
- "Bayar listrik 500 ribu" → expense, 500000, "Pembayaran listrik", "Listrik & Air"

PENTING:
- Pahami singkatan (ribu, juta, rb, jt, ceng, gopek)
- Kembalikan HANYA JSON valid tanpa markdown

OUTPUT FORMAT:
{"type":"income"|"expense","amount":number,"description":"string","category":"string","confidence":0.0-1.0}`;

// Parse voice input menjadi transaksi menggunakan OpenAI GPT-4o-mini
export const parseVoiceToTransaction = async (
  transcription: string
): Promise<ParsedVoiceInput> => {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transkripsi kosong');
  }

  const content = await callOpenAI([
    { role: 'system', content: TRANSACTION_PARSER_PROMPT },
    { role: 'user', content: `Input: "${transcription}"\n\nOutput JSON:` }
  ], 200);
  
  if (!content) {
    throw new Error('Tidak ada respons dari AI');
  }

  // Clean JSON from markdown if present
  let jsonStr = content.trim();
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  }

  const parsed = JSON.parse(jsonStr) as ParsedVoiceInput;

  // Validasi hasil parsing
  if (!parsed.type || !['income', 'expense'].includes(parsed.type)) {
    throw new Error('Tipe transaksi tidak valid');
  }

  if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
    throw new Error('Jumlah transaksi tidak valid');
  }

  return parsed;
};

// Transcribe audio - placeholder, actual transcription done client-side with Web Speech API
export const transcribeAudio = async (_audioBuffer: Buffer): Promise<string> => {
  throw new Error('Audio transcription should be done client-side using Web Speech API');
};

// Generate respons konfirmasi
export const generateConfirmationResponse = async (
  transaction: Partial<Transaction>
): Promise<string> => {
  const prompt = `Buat respons konfirmasi singkat dan ramah dalam Bahasa Indonesia untuk transaksi:
Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
Jumlah: Rp ${transaction.amount?.toLocaleString('id-ID')}
Deskripsi: ${transaction.description}
Kategori: ${transaction.category}

Respons harus singkat (1-2 kalimat), ramah, dan konfirmasi bahwa transaksi sudah dicatat.`;

  const response = await callOpenAI([
    { role: 'user', content: prompt }
  ], 100);

  return response || 'Transaksi berhasil dicatat!';
};
