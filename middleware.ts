import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      const response = NextResponse.redirect(new URL('/admin-signin', request.url));
      return response;
    }
    const roles = (token as any).roles as string[] | undefined;
    if (!roles?.includes('Administrator') && !roles?.includes('Teacher')) {
      const response = NextResponse.redirect(new URL('/admin-signin', request.url));
      return response;
    }
  }
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
