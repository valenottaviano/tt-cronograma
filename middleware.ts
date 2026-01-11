import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all /admin/* routes (except login)
  if (pathname.startsWith('/admin')) {
    // Note: We can't check Firebase auth in middleware (runs on Edge)
    // Auth verification happens client-side in AdminGuard component
    // This middleware just ensures a consistent structure
    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
