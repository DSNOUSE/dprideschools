import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Allow access to signin page
    if (pathname === '/admin-signin' || pathname === '/admin/signin') {
      return NextResponse.next();
    }

    // Check if user has valid session
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-signin';
      return NextResponse.redirect(url);
    }

    // Check if user has required role
    const roles = (token as any).roles || [];
    if (!roles.includes('Administrator') && !roles.includes('Teacher')) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin-signin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};
