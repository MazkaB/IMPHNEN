import { NextRequest, NextResponse } from 'next/server';
import { validateTwilioSignature, parseIncomingMessage } from '@/lib/whatsapp/twilio-client';
import { handleTextMessage, handleVoiceMessage, sendWelcomeMessage } from '@/lib/whatsapp/message-handler';

// Store untuk track new users (dalam production, gunakan Redis/database)
const processedUsers = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    // Parse form data dari Twilio
    const formData = await request.formData();
    const body: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      body[key] = value.toString();
    });

    // Validasi signature Twilio (PENTING untuk keamanan)
    const signature = request.headers.get('x-twilio-signature');
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/whatsapp`;

    if (!signature) {
      console.error('Missing Twilio signature');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validasi signature
    const isValid = validateTwilioSignature(signature, url, body);
    
    if (!isValid) {
      console.error('Invalid Twilio signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Parse incoming message
    const message = parseIncomingMessage(body);

    // Log untuk debugging (hapus di production)
    console.log('Incoming WhatsApp message:', {
      from: message.from,
      body: message.body.substring(0, 100),
      hasMedia: message.numMedia > 0,
    });

    // Check if new user
    if (!processedUsers.has(message.from)) {
      processedUsers.add(message.from);
      // Send welcome message untuk user baru
      if (!message.body && message.numMedia === 0) {
        await sendWelcomeMessage(message.from);
        return createTwiMLResponse('');
      }
    }

    let responseText: string;

    // Handle berdasarkan tipe message
    if (message.numMedia > 0) {
      const mediaType = message.mediaTypes[0];
      
      if (mediaType?.startsWith('audio/')) {
        // Handle voice message
        responseText = await handleVoiceMessage(message.from, message.mediaUrls[0]);
      } else if (mediaType?.startsWith('image/')) {
        // Handle image (OCR) - akan dihandle oleh modul OCR
        responseText = '📸 Foto diterima! Fitur scan struk sedang dalam pengembangan.';
      } else {
        responseText = '❌ Maaf, tipe file tidak didukung. Kirim teks, voice note, atau foto struk.';
      }
    } else if (message.body) {
      // Handle text message
      responseText = await handleTextMessage(message.from, message.body);
    } else {
      responseText = 'Halo! Ketik *bantuan* untuk melihat cara penggunaan.';
    }

    // Return TwiML response
    return createTwiMLResponse(responseText);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    
    // Return generic error message
    return createTwiMLResponse(
      '❌ Maaf, terjadi kesalahan. Silakan coba lagi nanti.'
    );
  }
}

// GET untuk verifikasi webhook
export async function GET() {
  return NextResponse.json({ status: 'WhatsApp webhook active' });
}

// Helper untuk create TwiML response
function createTwiMLResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;

  return new NextResponse(twiml, {
    headers: {
      'Content-Type': 'text/xml',
    },
  });
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
