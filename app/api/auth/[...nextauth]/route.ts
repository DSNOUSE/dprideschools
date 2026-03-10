import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

console.log('🔍 NextAuth API route loaded with options:', {
  providers: authOptions.providers?.length || 0,
  strategy: authOptions.session?.strategy,
  hasSecret: !!authOptions.secret
});

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
