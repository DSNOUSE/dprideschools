import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: Request & { nextUrl: URL }) {
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  const url = new URL(req.nextUrl as any);
  const pathname = url.pathname;

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/signin', url));
    }
    const roles = (token as any).roles as string[] | undefined;
    if (!roles?.includes('Administrator')) {
      return NextResponse.redirect(new URL('/signin', url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
