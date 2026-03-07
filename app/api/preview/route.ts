import { client } from '@/lib/sanity';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new Response('Invalid token', { status: 401 });
  }

  // Enable draft mode
  const cookies = request.headers.get('cookie');
  const response = new NextResponse(null, { status: 307 });
  response.headers.set('Location', '/');
  response.headers.set(
    'Set-Cookie',
    `__next_preview_data=${JSON.stringify({})}; Path=/; HttpOnly; SameSite=Lax`
  );
  return response;
}
