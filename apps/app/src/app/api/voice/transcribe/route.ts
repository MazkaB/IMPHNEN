import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';
import { transcribeAudio, parseVoiceToTransaction, generateConfirmationResponse } from '@/lib/ai/voice-processor';
import { saveTransaction } from '@/lib/firebase/transaction-service';

// Verify Firebase auth token
async function verifyAuthToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const { adminAuth } = getAdminFirebase();
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// POST - Transcribe audio and parse transaction
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const autoSave = formData.get('autoSave') === 'true';

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'File audio tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['audio/webm', 'audio/ogg', 'audio/mp3', 'audio/mpeg', 'audio/wav'];
    if (!allowedTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { success: false, error: 'Format audio tidak didukung' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Ukuran file maksimal 10MB' },
        { status: 400 }
      );
    }

    // Convert to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Transcribe audio
    const transcription = await transcribeAudio(buffer);

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak dapat mentranskripsi audio' },
        { status: 400 }
      );
    }

    // Parse transaction from transcription
    const parsed = await parseVoiceToTransaction(transcription);

    let transactionId: string | null = null;
    let confirmationMessage: string | null = null;

    // Auto save if requested and confidence is high
    if (autoSave && parsed.confidence >= 0.7) {
      transactionId = await saveTransaction({
        userId,
        type: parsed.type,
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
        source: 'voice',
        rawInput: transcription,
      });

      confirmationMessage = await generateConfirmationResponse({
        type: parsed.type,
        amount: parsed.amount,
        description: parsed.description,
        category: parsed.category,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        transcription,
        parsed: {
          type: parsed.type,
          amount: parsed.amount,
          description: parsed.description,
          category: parsed.category,
          confidence: parsed.confidence,
        },
        transactionId,
        confirmationMessage,
        autoSaved: !!transactionId,
      },
    });
  } catch (error) {
    console.error('Voice transcription error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses audio' },
      { status: 500 }
    );
  }
}
