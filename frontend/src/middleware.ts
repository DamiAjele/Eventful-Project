import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/register', '/events'];
const CREATOR_ROUTES = ['/creator'];
const EVENTEE_ROUTES = ['/eventee'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith('/events/'));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && (pathname === '/login' || pathname === '/register')) {
    const redirect = userRole === 'CREATOR' ? '/creator' : '/eventee';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  if (token && userRole === 'EVENTEE' && CREATOR_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/eventee', request.url));
  }

  if (token && userRole === 'CREATOR' && EVENTEE_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/creator', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
