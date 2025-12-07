import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';

interface TransactionData {
  userId: string;
  type: string;
  amount: number;
  description: string;
  category: string;
  createdAt?: { toDate: () => Date };
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || 'month';

    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400, headers: corsHeaders });
    }

    const { adminDb } = getAdminFirebase();
    
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database not configured' }, { status: 500, headers: corsHeaders });
    }

    // Get date range
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Fetch transactions
    const transactionsRef = adminDb.collection('transactions');
    const snapshot = await transactionsRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const transactions = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      const data = doc.data() as TransactionData;
      const createdAt = data.createdAt?.toDate?.() || new Date();
      return {
        id: doc.id,
        ...data,
        createdAt: createdAt.toISOString(),
        date: createdAt.toISOString(),
      };
    });

    // Filter by date range
    const filteredTransactions = transactions.filter((t: { date: string }) => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= now;
    });

    // Calculate analytics
    let totalIncome = 0;
    let totalExpense = 0;
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    filteredTransactions.forEach((t) => {
      const amount = t.amount || 0;
      if (t.type === 'income') {
        totalIncome += amount;
        const productName = t.description || 'Produk';
        if (!productSales[productName]) {
          productSales[productName] = { name: productName, quantity: 0, revenue: 0 };
        }
        productSales[productName].quantity += 1;
        productSales[productName].revenue += amount;
      } else if (t.type === 'expense') {
        totalExpense += amount;
      }
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Best sellers
    const bestSellers = Object.entries(productSales)
      .map(([_, data]) => ({
        productName: data.name,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        profitLoss: {
          totalRevenue: totalIncome,
          totalCost: totalExpense,
          netProfit,
          profitMargin,
        },
        bestSellers,
        transactions: filteredTransactions,
        transactionCount: filteredTransactions.length,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500, headers: corsHeaders });
  }
}
