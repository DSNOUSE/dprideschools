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
        (token as any).email = (user as any).email || (user as any).admissionNo;
        (token as any).name = (user as any).name;
        (token as any).teacherId = (user as any).teacherId;
        (token as any).roles = (user as any).roles || [];
        (token as any).admissionNo = (user as any).admissionNo;
        (token as any).students = (user as any).students;
        // Store student enrollment data
        (token as any).classId = (user as any).classId;
        (token as any).sessionId = (user as any).sessionId;
        (token as any).class = (user as any).class;
        (token as any).session = (user as any).session;
        console.log('JWT callback - User:', (token as any).email || (token as any).id, 'Roles:', (user as any).roles);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = (token as any).id;
        (session.user as any).email = (token as any).email;
        (session.user as any).name = (token as any).name;
        (session.user as any).teacherId = (token as any).teacherId;
        (session.user as any).roles = (token as any).roles || [];
        (session.user as any).admissionNo = (token as any).admissionNo;
        (session.user as any).students = (token as any).students;
        // Store student enrollment data
        (session.user as any).classId = (token as any).classId;
        (session.user as any).sessionId = (token as any).sessionId;
        (session.user as any).class = (token as any).class;
        (session.user as any).session = (token as any).session;
        console.log('Session callback - User:', (token as any).email || (token as any).admissionNo, 'Roles:', (token as any).roles);
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: { 
    signIn: '/signin',
  },
};

export const getSession = () => getServerSession(authOptions);
