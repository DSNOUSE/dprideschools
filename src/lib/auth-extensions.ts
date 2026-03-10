import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import argon2 from 'argon2';

// Unified authentication provider for both students and parents
export const unifiedCredentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    admissionNo: { label: 'Admission Number', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    if (!credentials?.password) {
      return null;
    }
    
    try {
      // Try application user (admin/teacher) login first (email-based)
      if (credentials.email) {
        const appUser = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { roles: { include: { role: true } } }
        });

        if (appUser) {
          const userPasswordMatch = await argon2.verify(appUser.passwordHash, credentials.password).catch(() => false);
          if (userPasswordMatch) {
            const roles = (appUser.roles || []).map(r => r.role?.name).filter(Boolean);
            console.log('Authenticated admin user:', appUser.email, 'Roles:', roles);
            return {
              id: appUser.id,
              email: appUser.email,
              name: appUser.name,
              roles,
            } as any;
          }
        }
      }

      // Try parent login next (email-based)
      if (credentials.email) {
        const parent = await prisma.parent.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            students: {
              include: {
                student: {
                  include: {
                    class: true,
                    session: true
                  }
                }
              }
            }
          }
        });

        if (parent) {
          const parentPasswordMatch = await argon2.verify(parent.passwordHash, credentials.password).catch(() => false);
          if (parentPasswordMatch) {
            return {
              id: parent.id,
              email: parent.email,
              name: parent.name,
              roles: ['parent'],
              students: parent.students.map(sp => sp.student)
            } as any;
          }
        }
      }
      
      // Try student login (admission number-based)
      if (credentials.admissionNo) {
        const student = await prisma.student.findUnique({
          where: { admissionNo: credentials.admissionNo.toUpperCase() },
          include: {
            class: true,
            session: true
          }
        });
        
        if (student && student.admissionNo === credentials.password.toUpperCase()) {
          return {
            id: student.id,
            admissionNo: student.admissionNo,
            name: `${student.firstName} ${student.lastName}`,
            roles: ['student'],
            classId: student.classId,
            sessionId: student.sessionId,
            class: student.class,
            session: student.session
          } as any;
        }
      }
      
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }

    return null;
  },
});
