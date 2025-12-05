import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';
import {
  getTransaction,
  updateTransaction,
  deleteTransaction,
} from '@/lib/firebase/transaction-service';
import { z } from 'zod';

// Schema validasi untuk update transaction
const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().positive('Jumlah harus lebih dari 0').optional(),
  description: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
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

// GET - Get single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const transaction = await getTransaction(id);

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (transaction.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data transaksi' },
      { status: 500 }
    );
  }
}

// PATCH - Update transaction
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingTransaction = await getTransaction(id);
    
    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = updateTransactionSchema.safeParse(body);
    
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

    await updateTransaction(id, validationResult.data);

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil diupdate',
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengupdate transaksi' },
      { status: 500 }
    );
  }
}

// DELETE - Delete transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await verifyAuthToken(request);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const existingTransaction = await getTransaction(id);
    
    if (!existingTransaction) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    await deleteTransaction(id);

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus transaksi' },
      { status: 500 }
    );
  }
}
