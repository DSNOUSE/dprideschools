import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { unifiedCredentialsProvider } from './auth-extensions';
import { env } from './env';

console.log('🔍 Auth module loading...');

// Validate environment variables on import
if (!env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required but not set in environment variables');
}

// Use production URL when deployed to Vercel
const nextAuthUrl = process.env.NODE_ENV === 'production' 
  ? 'https://www.dprideschools.com'
  : env.NEXTAUTH_URL;

console.log('🔍 Environment variables validated');
console.log('🔍 Using NextAuth URL:', nextAuthUrl);

export const authOptions: NextAuthOptions = {
  providers: [
    unifiedCredentialsProvider,
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours in seconds
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Store basic user information in token
        (token as any).id = (user as any).id;
        (token as any).email = (user as any).email;
        (token as any).name = (user as any).name;
        (token as any).roles = (user as any).roles || [];
        (token as any).admissionNo = (user as any).admissionNo;
        (token as any).students = (user as any).students;
        console.log('JWT callback - User:', (user as any).email, 'Roles:', (user as any).roles);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = (token as any).id;
        (session.user as any).email = (token as any).email;
        (session.user as any).roles = (token as any).roles || [];
        (session.user as any).admissionNo = (token as any).admissionNo;
        (session.user as any).students = (token as any).students;
        console.log('Session callback - User:', (token as any).email, 'Roles:', (token as any).roles);
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: { 
    signIn: '/admin-signin',
  },
};

export const getSession = () => getServerSession(authOptions);
