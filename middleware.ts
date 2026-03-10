import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and NextAuth
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Protect admin routes only
  if (pathname.startsWith('/admin')) {
    // Allow access to signin pages
    if (pathname === '/admin-signin' || pathname === '/admin/signin') {
      return NextResponse.next();
    }

    try {
      const token = await getToken({ req: request });
      
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
    } catch (error) {
      console.error('Middleware auth error:', error);
      // If there's an error, allow the request to proceed
      // The page-level auth will handle the protection
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
