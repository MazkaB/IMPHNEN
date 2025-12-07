import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirebase } from '@/lib/firebase/admin';

const PRODUCTS_COLLECTION = 'user_products';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET - Get user products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { adminDb } = getAdminFirebase();

    const snapshot = await adminDb
      .collection(PRODUCTS_COLLECTION)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      { success: true, products },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('Get products error:', error);
    const errorMessage = error?.message || 'Failed to get products';
    // Check if it's a missing index error
    if (errorMessage.includes('index')) {
      return NextResponse.json(
        { success: false, error: 'Database index required. Please deploy Firestore indexes.', details: errorMessage },
        { status: 500, headers: corsHeaders }
      );
    }
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST - Save new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, description, price } = body;

    if (!userId || !name || !price) {
      return NextResponse.json(
        { success: false, error: 'userId, name, and price required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { adminDb } = getAdminFirebase();

    // Check if product with same name exists for this user
    const existing = await adminDb
      .collection(PRODUCTS_COLLECTION)
      .where('userId', '==', userId)
      .where('name', '==', name)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Update existing product
      const docId = existing.docs[0].id;
      await adminDb.collection(PRODUCTS_COLLECTION).doc(docId).update({
        description: description || '',
        price,
        updatedAt: new Date(),
      });

      return NextResponse.json(
        { success: true, id: docId, message: 'Product updated' },
        { headers: corsHeaders }
      );
    }

    // Create new product
    const docRef = await adminDb.collection(PRODUCTS_COLLECTION).add({
      userId,
      name,
      description: description || '',
      price,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, id: docRef.id, message: 'Product saved' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Save product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save product' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!productId || !userId) {
      return NextResponse.json(
        { success: false, error: 'id and userId required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const { adminDb } = getAdminFirebase();

    // Verify ownership
    const doc = await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).get();
    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    await adminDb.collection(PRODUCTS_COLLECTION).doc(productId).delete();

    return NextResponse.json(
      { success: true, message: 'Product deleted' },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500, headers: corsHeaders }
    );
  }
}
