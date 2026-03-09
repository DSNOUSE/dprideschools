import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { unifiedCredentialsProvider } from './auth-extensions';
import { env } from './env';

// Debug logging for Vercel
console.log('🔧 NextAuth Debug:');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Validate environment variables on import
if (!env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is required but not set in environment variables');
}

export const authOptions: NextAuthOptions = {
  providers: [
    unifiedCredentialsProvider,
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // normalize roles: support `role` (string/array) and `roles` (array)
        const userRoles = (user as any).roles || (user as any).role || [];
        (token as any).roles = Array.isArray(userRoles) ? userRoles : [userRoles];
        (token as any).role = Array.isArray(userRoles) ? (userRoles.length === 1 ? userRoles[0] : userRoles) : userRoles;
        (token as any).admissionNo = (user as any).admissionNo;
        (token as any).email = (user as any).email;
        (token as any).students = (user as any).students;
        
        // Debug log
        console.log('🔐 JWT Callback - User roles:', (token as any).roles);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).roles = (token as any).roles || [];
        (session.user as any).role = (token as any).role || ((token as any).roles ? ((token as any).roles.length === 1 ? (token as any).roles[0] : (token as any).roles) : []);
        (session.user as any).admissionNo = (token as any).admissionNo;
        (session.user as any).email = (token as any).email;
        (session.user as any).students = (token as any).students;
        
        // Debug log
        console.log('👤 Session Callback - User session:', {
          email: (session.user as any).email,
          roles: (session.user as any).roles,
          role: (session.user as any).role
        });
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
  pages: { 
    signIn: '/signin',
    error: '/signin' // Redirect errors back to signin page
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug in development
};

export const getSession = () => getServerSession(authOptions);
