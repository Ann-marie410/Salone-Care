import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/', '/login', '/signup', '/verify-otp', '/emergency', '/ai-assistant', '/locator', '/pharmacy', '/api/test-email'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API routes and public routes pass through immediately
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // For protected pages, return next() — individual pages handle their own auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
