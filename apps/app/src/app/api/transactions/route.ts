import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';
import {
  saveTransaction,
  getUserTransactions,
  getTransactionSummary,
} from '@/lib/firebase/transaction-service';
import { z } from 'zod';

// Schema validasi untuk create transaction
const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Jumlah harus lebih dari 0'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  source: z.enum(['voice', 'manual', 'ocr', 'whatsapp']).default('manual'),
  rawInput: z.string().optional(),
});

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

// GET - Get user transactions
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const summaryOnly = searchParams.get('summary') === 'true';

    if (summaryOnly) {
      const summary = await getTransactionSummary(userId);
      return NextResponse.json({ success: true, data: summary });
    }

    const transactions = await getUserTransactions(
      userId,
      limitParam ? parseInt(limitParam, 10) : 100
    );

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = createTransactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validasi gagal',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const transactionData = {
      ...validationResult.data,
      userId,
    };

    const transactionId = await saveTransaction(transactionData);

    return NextResponse.json({
      success: true,
      data: { id: transactionId },
      message: 'Transaksi berhasil disimpan',
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan transaksi' },
      { status: 500 }
    );
  }
}
