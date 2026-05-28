import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Protect /schedule/[dni] — public sub-paths (setup, login) are excluded by matcher
  if (pathname.startsWith('/schedule/') && !pathname.startsWith('/schedule/setup') && !pathname.startsWith('/schedule/login')) {
    const session = request.cookies.get('athlete_session');
    if (!session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/schedule/:path*'],
};
