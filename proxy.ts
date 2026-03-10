import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for API routes, static files, and NextAuth to prevent conflicts
  if (pathname.startsWith('/api') || 
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin')) {
    // Allow access to signin pages
    if (pathname === '/admin-signin' || pathname === '/admin/signin') {
      return NextResponse.next();
    }

    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === 'production'
      });
      
      console.log('Proxy token check for:', pathname, 'Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        console.log('No token found, redirecting to signin');
        const response = NextResponse.redirect(new URL('/admin-signin', request.url));
        return response;
      }
      
      const roles = (token as any).roles as string[] | undefined;
      console.log('User roles:', roles);
      
      if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
        console.log('Invalid roles, redirecting to signin');
        const response = NextResponse.redirect(new URL('/admin-signin', request.url));
        return response;
      }
      
      console.log('Access granted for:', pathname);
    } catch (error) {
      console.error('Proxy middleware error:', error);
      // If there's an error, allow request to proceed
      // The page-level auth will handle protection
      return NextResponse.next();
    }
  }
  
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
