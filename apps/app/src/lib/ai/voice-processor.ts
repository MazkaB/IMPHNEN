import OpenAI from 'openai';
import { Transaction, TransactionType, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types';

// Validasi API key
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY tidak ditemukan. Pastikan sudah diset di .env.local');
  }
  
  return new OpenAI({ apiKey });
};

// Interface untuk hasil parsing
interface ParsedVoiceInput {
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  confidence: number;
}

// Prompt system untuk parsing transaksi dari bahasa Indonesia
const TRANSACTION_PARSER_PROMPT = `Kamu adalah asisten AI untuk UMKM Indonesia yang membantu mencatat transaksi keuangan dari input suara.

TUGAS:
Analisis input teks (hasil transkripsi suara) dan ekstrak informasi transaksi.

ATURAN:
1. Tentukan apakah ini PEMASUKAN (income) atau PENGELUARAN (expense)
2. Ekstrak jumlah uang (dalam Rupiah)
3. Buat deskripsi singkat
4. Tentukan kategori yang sesuai

KATEGORI PENGELUARAN: ${EXPENSE_CATEGORIES.join(', ')}
KATEGORI PEMASUKAN: ${INCOME_CATEGORIES.join(', ')}

CONTOH INPUT & OUTPUT:
- "Jual bakso 50 porsi harga 15 ribu" → income, 750000, "Penjualan bakso 50 porsi", "Penjualan Produk"
- "Beli tepung 10 kilo 150 ribu" → expense, 150000, "Pembelian tepung 10 kg", "Bahan Baku"
- "Bayar listrik bulan ini 500 ribu" → expense, 500000, "Pembayaran listrik", "Listrik & Air"
- "Terima pembayaran dari Bu Ani 2 juta" → income, 2000000, "Pembayaran dari Bu Ani", "Piutang Terbayar"

PENTING:
- Pahami dialek lokal dan singkatan (ribu, juta, rb, jt, ceng, gopek, dll)
- Jika tidak yakin, berikan confidence rendah
- Selalu kembalikan dalam format JSON yang valid

OUTPUT FORMAT (JSON):
{
  "type": "income" | "expense",
  "amount": number,
  "description": "string",
  "category": "string",
  "confidence": 0.0-1.0
}`;

// Parse voice input menjadi transaksi
export const parseVoiceToTransaction = async (
  transcription: string
): Promise<ParsedVoiceInput> => {
  if (!transcription || transcription.trim().length === 0) {
    throw new Error('Transkripsi kosong');
  }

  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: TRANSACTION_PARSER_PROMPT },
      { role: 'user', content: transcription },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Tidak ada respons dari AI');
  }

  const parsed = JSON.parse(content) as ParsedVoiceInput;

  // Validasi hasil parsing
  if (!parsed.type || !['income', 'expense'].includes(parsed.type)) {
    throw new Error('Tipe transaksi tidak valid');
  }

  if (typeof parsed.amount !== 'number' || parsed.amount <= 0) {
    throw new Error('Jumlah transaksi tidak valid');
  }

  return parsed;
};

// Transcribe audio menggunakan Whisper
export const transcribeAudio = async (audioBuffer: Buffer): Promise<string> => {
  const openai = getOpenAIClient();

  // Buat File object dari buffer
  const audioFile = new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' });

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'id', // Bahasa Indonesia
    prompt: 'Transkripsi percakapan tentang transaksi keuangan UMKM dalam Bahasa Indonesia',
  });

  return response.text;
};

// Generate respons natural untuk konfirmasi
export const generateConfirmationResponse = async (
  transaction: Partial<Transaction>
): Promise<string> => {
  const openai = getOpenAIClient();

  const prompt = `Buat respons konfirmasi singkat dan ramah dalam Bahasa Indonesia untuk transaksi berikut:
Tipe: ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
Jumlah: Rp ${transaction.amount?.toLocaleString('id-ID')}
Deskripsi: ${transaction.description}
Kategori: ${transaction.category}

Respons harus:
- Singkat (1-2 kalimat)
- Ramah dan natural
- Konfirmasi bahwa transaksi sudah dicatat`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 150,
  });

  return response.choices[0]?.message?.content || 'Transaksi berhasil dicatat!';
};
