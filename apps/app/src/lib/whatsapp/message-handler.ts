import { parseVoiceToTransaction, transcribeAudio, generateConfirmationResponse } from '@/lib/ai/voice-processor';
import { parseWithGemini } from '@/lib/ai/gemini-processor';
import { sendWhatsAppMessage } from './twilio-client';
import { saveTransaction, getUserByWhatsApp, linkWhatsAppToUser } from '@/lib/firebase/transaction-service';
import { Transaction, TransactionSource } from '@/types';

// Command patterns
const COMMANDS = {
  HELP: /^(help|bantuan|tolong|menu)$/i,
  BALANCE: /^(saldo|balance|total|ringkasan)$/i,
  LINK: /^link\s+(.+)$/i,
  REPORT: /^(laporan|report)(\s+\w+)?$/i,
};

// Welcome message
const WELCOME_MESSAGE = `🎉 Selamat datang di *Pembukuan AI*!

Saya asisten pencatatan keuangan UMKM Anda.

*Cara Pakai:*
📝 Ketik/ucapkan transaksi langsung
   Contoh: "jual bakso 50 porsi 15 ribu"
   
🎤 Kirim voice note untuk catat transaksi

📸 Kirim foto struk untuk scan otomatis

*Perintah:*
• *saldo* - Lihat ringkasan keuangan
• *laporan* - Laporan bulanan
• *bantuan* - Menu bantuan

Mulai catat transaksi sekarang! 💪`;

const HELP_MESSAGE = `📚 *Panduan Pembukuan AI*

*Mencatat Transaksi:*
Cukup ketik atau ucapkan transaksi Anda:
• "jual nasi goreng 20 porsi 15 ribu"
• "beli bahan baku 500 ribu"
• "terima pembayaran dari Bu Ani 1 juta"

*Kirim Voice Note:*
Rekam suara Anda, saya akan transkripsi dan catat otomatis.

*Scan Struk:*
Kirim foto struk/bon, saya akan ekstrak datanya.

*Perintah Lain:*
• *saldo* - Lihat total pemasukan & pengeluaran
• *laporan* - Laporan keuangan
• *link [email]* - Hubungkan ke akun web

Ada pertanyaan? Langsung tanya saja! 😊`;

// Handle incoming text message
export const handleTextMessage = async (
  from: string,
  text: string
): Promise<string> => {
  const trimmedText = text.trim().toLowerCase();

  // Check for commands
  if (COMMANDS.HELP.test(trimmedText)) {
    return HELP_MESSAGE;
  }

  if (COMMANDS.BALANCE.test(trimmedText)) {
    return await handleBalanceCommand(from);
  }

  const linkMatch = text.match(COMMANDS.LINK);
  if (linkMatch) {
    return await handleLinkCommand(from, linkMatch[1]);
  }

  if (COMMANDS.REPORT.test(trimmedText)) {
    return await handleReportCommand(from);
  }

  // Parse as transaction
  return await handleTransactionInput(from, text, 'whatsapp');
};

// Handle voice message
export const handleVoiceMessage = async (
  from: string,
  audioUrl: string
): Promise<string> => {
  try {
    // Download audio dari Twilio
    const response = await fetch(audioUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString('base64')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengunduh audio');
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());

    // Transcribe audio
    const transcription = await transcribeAudio(audioBuffer);

    if (!transcription || transcription.trim().length === 0) {
      return '❌ Maaf, saya tidak bisa mendengar dengan jelas. Coba ulangi ya!';
    }

    // Process transcription as transaction
    const result = await handleTransactionInput(from, transcription, 'voice');
    
    return `🎤 *Transkripsi:* "${transcription}"\n\n${result}`;
  } catch (error) {
    console.error('Voice processing error:', error);
    return '❌ Maaf, terjadi kesalahan saat memproses voice note. Coba lagi ya!';
  }
};

// Handle transaction input (text or voice)
const handleTransactionInput = async (
  from: string,
  input: string,
  source: TransactionSource
): Promise<string> => {
  try {
    // Parse transaction using AI
    let parsed;
    try {
      parsed = await parseVoiceToTransaction(input);
    } catch {
      // Fallback ke Gemini jika OpenAI gagal
      parsed = await parseWithGemini(input);
    }

    // Get or create user
    let user = await getUserByWhatsApp(from);
    
    if (!user) {
      // Create temporary user for WhatsApp-only users
      user = {
        id: `wa_${from.replace(/\D/g, '')}`,
        whatsappNumber: from,
      };
    }

    // Save transaction
    const transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: user.id,
      type: parsed.type,
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category,
      source,
      rawInput: input,
    };

    await saveTransaction(transaction);

    // Generate confirmation
    const confirmation = await generateConfirmationResponse(transaction);
    
    const emoji = parsed.type === 'income' ? '💰' : '💸';
    
    return `${emoji} *${parsed.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Tercatat!*

📝 ${parsed.description}
💵 Rp ${parsed.amount.toLocaleString('id-ID')}
📁 Kategori: ${parsed.category}

${confirmation}`;
  } catch (error) {
    console.error('Transaction parsing error:', error);
    return `❌ Maaf, saya belum bisa memahami transaksi tersebut.

Coba format seperti ini:
• "jual [produk] [jumlah] [harga]"
• "beli [barang] [harga]"
• "bayar [keperluan] [jumlah]"`;
  }
};

// Handle balance command
const handleBalanceCommand = async (from: string): Promise<string> => {
  try {
    const user = await getUserByWhatsApp(from);
    
    if (!user) {
      return '📊 Belum ada transaksi tercatat.\n\nMulai catat transaksi pertama Anda!';
    }

    // TODO: Implement getTransactionSummary
    return `📊 *Ringkasan Keuangan*

💰 Total Pemasukan: Rp 0
💸 Total Pengeluaran: Rp 0
📈 Profit: Rp 0

_Fitur lengkap tersedia di website_`;
  } catch (error) {
    console.error('Balance command error:', error);
    return '❌ Gagal mengambil data. Coba lagi nanti.';
  }
};

// Handle link command
const handleLinkCommand = async (from: string, email: string): Promise<string> => {
  try {
    const success = await linkWhatsAppToUser(from, email.trim());
    
    if (success) {
      return `✅ WhatsApp berhasil dihubungkan ke akun ${email}!\n\nSekarang transaksi dari WhatsApp akan tersinkron ke dashboard web Anda.`;
    }
    
    return `❌ Email ${email} tidak ditemukan.\n\nPastikan Anda sudah mendaftar di website terlebih dahulu.`;
  } catch (error) {
    console.error('Link command error:', error);
    return '❌ Gagal menghubungkan akun. Coba lagi nanti.';
  }
};

// Handle report command
const handleReportCommand = async (from: string): Promise<string> => {
  // TODO: Implement detailed report
  return `📈 *Laporan Keuangan*

Fitur laporan lengkap tersedia di dashboard web.

Ketik *link [email]* untuk menghubungkan WhatsApp ke akun web Anda.`;
};

// Send welcome message to new user
export const sendWelcomeMessage = async (to: string): Promise<void> => {
  await sendWhatsAppMessage(to, WELCOME_MESSAGE);
};
