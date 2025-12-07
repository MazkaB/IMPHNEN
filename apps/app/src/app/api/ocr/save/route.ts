import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

// Enable CORS for cross-domain requests from OCR app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-id',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from header (passed from OCR app)
    const userId = request.headers.get('x-user-id') || 'anonymous_ocr_user';

    const body = await request.json();
    const { documentType, rawText, parsedData } = body;

    if (!documentType || !rawText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Save to Firestore using Admin SDK (bypasses security rules)
    const { adminDb } = getAdminFirebase();
    const docRef = await adminDb.collection('ocr_archives').add({
      documentType,
      rawText,
      parsedData: parsedData || {},
      userId,
      createdAt: Timestamp.now(),
      processedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'OCR data saved successfully'
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Error saving OCR data:', error);
    return NextResponse.json(
      { error: 'Failed to save OCR data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
