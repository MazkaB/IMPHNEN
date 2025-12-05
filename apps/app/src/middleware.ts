import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes yang membutuhkan authentication
const protectedRoutes = [
  '/dashboard',
  '/voice',
  '/ocr',
  '/insights',
  '/content',
  '/whatsapp',
  '/settings',
];

// Routes yang hanya untuk guest (belum login)
const guestRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if route is guest-only
  const isGuestRoute = guestRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Get auth cookie/token (Firebase auth state is handled client-side)
  // This middleware mainly handles initial redirects
  // Actual auth check happens in the protected layout component

  // For API routes, let them handle their own auth
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
