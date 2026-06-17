import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = [
  '/', '/login', '/signup', '/verify-otp',
  '/ai-assistant', '/locator', '/pharmacy',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let API routes and static files pass through
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Let public routes pass through
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected routes pass through - individual pages handle their own auth
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
