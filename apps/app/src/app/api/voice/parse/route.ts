import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';
import { parseVoiceToTransaction, generateConfirmationResponse } from '@/lib/ai/voice-processor';
import { saveTransactionAdmin } from '@/lib/firebase/transaction-service-admin';

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

// POST - Parse text transcription to transaction
export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { success: false, error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { transcription, autoSave } = body;

    if (!transcription || transcription.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Transkripsi tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Parse transaction from transcription
    const parsed = await parseVoiceToTransaction(transcription);

    let transactionId: string | null = null;
    let confirmationMessage: string | null = null;

    // Auto save if requested and confidence is high
    if (autoSave && parsed.confidence >= 0.7) {
      transactionId = await saveTransactionAdmin({
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
    console.error('Voice parse error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Gagal memproses teks';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
