import { NextRequest, NextResponse } from 'next/server';

// Call OpenAI API directly using fetch
const callOpenAI = async (prompt: string) => {
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
      messages: [
        { role: 'system', content: 'Kamu adalah konsultan bisnis UMKM Indonesia yang ahli dalam analisis keuangan.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI API error');
  }

  return data.choices?.[0]?.message?.content || '';
};

export async function POST(request: NextRequest) {
  try {
    const { transactions, profitLoss, bestSellers } = await request.json();

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        success: true,
        recommendations: [
          { type: 'info', title: 'Mulai Catat Transaksi', suggestion: 'Tambahkan transaksi pertama Anda untuk mendapatkan rekomendasi AI yang personal.' }
        ]
      });
    }

    const prompt = `Analisis data bisnis berikut dan berikan 3 rekomendasi singkat dan actionable dalam Bahasa Indonesia.

DATA BISNIS:
- Total Pemasukan: Rp ${profitLoss.totalRevenue.toLocaleString('id-ID')}
- Total Pengeluaran: Rp ${profitLoss.totalCost.toLocaleString('id-ID')}
- Keuntungan Bersih: Rp ${profitLoss.netProfit.toLocaleString('id-ID')}
- Margin Keuntungan: ${profitLoss.profitMargin.toFixed(1)}%
- Jumlah Transaksi: ${transactions.length}

PRODUK TERLARIS:
${bestSellers.slice(0, 3).map((p: { productName: string; quantitySold: number; revenue: number }, i: number) => 
  `${i + 1}. ${p.productName} - ${p.quantitySold} terjual - Rp ${p.revenue.toLocaleString('id-ID')}`
).join('\n')}

TRANSAKSI TERBARU:
${transactions.slice(0, 5).map((t: { description?: string; product?: string; type?: string; amount?: number; totalAmount?: number }) => 
  `- ${t.description || t.product}: ${t.type === 'income' ? '+' : '-'}Rp ${(t.amount || t.totalAmount || 0).toLocaleString('id-ID')}`
).join('\n')}

Berikan response dalam format JSON array dengan struktur:
[
  {"type": "price|stock|promo|saving", "title": "Judul singkat", "suggestion": "Saran detail dalam 1-2 kalimat"}
]

Fokus pada:
1. Optimasi harga atau margin
2. Manajemen stok atau cash flow
3. Strategi promosi atau penghematan`;

    const responseText = await callOpenAI(prompt);
    
    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    let recommendations = [];
    
    if (jsonMatch) {
      try {
        recommendations = JSON.parse(jsonMatch[0]);
      } catch {
        recommendations = [
          { type: 'info', title: 'Analisis Bisnis', suggestion: responseText.slice(0, 200) }
        ];
      }
    } else {
      recommendations = [
        { type: 'info', title: 'Analisis Bisnis', suggestion: responseText.slice(0, 200) }
      ];
    }

    return NextResponse.json({ success: true, recommendations });
  } catch (error) {
    console.error('AI Recommendation error:', error);
    return NextResponse.json({
      success: true,
      recommendations: [
        { type: 'info', title: 'Analisis Tidak Tersedia', suggestion: 'Tambahkan lebih banyak data transaksi untuk mendapatkan rekomendasi AI.' }
      ]
    });
  }
}
