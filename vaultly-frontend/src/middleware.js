import { NextResponse } from 'next/server';

const PROTECTED_ROUTES = [
  '/dashboard',
  '/expenses',
  '/groups',
  '/goals',
  '/reports',
  '/profile',
];

const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const hasAuth = Boolean(
    request.cookies.get('accessToken')?.value ||
    request.cookies.get('refreshToken')?.value
  );

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected && !hasAuth) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/expenses/:path*',
    '/groups/:path*',
    '/goals/:path*',
    '/reports/:path*',
    '/profile/:path*',
    '/login',
    '/signup',
  ],
};
