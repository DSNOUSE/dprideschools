import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import argon2 from 'argon2';
import { trackLoginActivity } from './audit/middleware';

console.log('🔍 Auth extensions module loaded');

// Unified authentication provider for both students and parents
export const unifiedCredentialsProvider = Credentials({
  name: 'Credentials',
  credentials: {
    email: { label: 'Email', type: 'email' },
    admissionNo: { label: 'Admission Number', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials) {
    console.log('🔍 Auth provider called with:', {
      email: credentials?.email,
      admissionNo: credentials?.admissionNo,
      hasPassword: !!credentials?.password
    });

    // Create a mock request for activity tracking
    const mockRequest = {
      headers: {
        get: (name: string) => {
          switch (name) {
            case 'x-forwarded-for': return '127.0.0.1';
            case 'x-real-ip': return '127.0.0.1';
            case 'user-agent': return 'NextAuth Credentials Provider';
            default: return null;
          }
        }
      },
      ip: '127.0.0.1',
      url: 'http://localhost:3000/api/auth/callback/credentials'
    } as any;

    if (!credentials?.password) {
      console.log('❌ No password provided');
      await trackLoginActivity(mockRequest, false, credentials?.email, 'No password provided');
      return null;
    }
    
    try {
      // Check if email field contains an admission number (starts with DPS)
      const isAdmissionNumber = credentials.email && /^DPS\d+/i.test(credentials.email);
      const admissionNumber = isAdmissionNumber ? credentials.email.toUpperCase() : credentials.admissionNo?.toUpperCase();
      
      // Try application user (admin/teacher) login first (email-based)
      if (credentials.email && !isAdmissionNumber) {
        console.log('🔍 Checking admin user for:', credentials.email);
        
        const appUser = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { roles: { include: { role: true } } }
        });

        console.log('Database query result:', appUser ? 'User found' : 'User not found');

        if (appUser) {
          console.log('🔍 Verifying password for user:', appUser.email);
          
          const userPasswordMatch = await argon2.verify(appUser.passwordHash, credentials.password)
            .catch((error) => {
              console.error('❌ Password verification error:', error);
              return false;
            });
            
          console.log('Password match result:', userPasswordMatch);
          
          if (userPasswordMatch) {
            const roles = (appUser.roles || []).map(r => r.role?.name).filter(Boolean);
            console.log('✅ Authenticated admin user:', appUser.email, 'Roles:', roles);
            
            // Track successful login
            await trackLoginActivity(mockRequest, true, appUser.email);
            
            const result = {
              id: appUser.id.toString(),
              email: appUser.email,
              name: appUser.name,
              teacherId: appUser.teacherId ?? undefined,
              roles,
            };
            console.log('✅ Returning user object:', result);
            return result as any;
          } else {
            console.log('❌ Password mismatch for:', appUser.email);
            await trackLoginActivity(mockRequest, false, appUser.email, 'Password mismatch');
          }
        } else {
          console.log('❌ No user found with email:', credentials.email);
          await trackLoginActivity(mockRequest, false, credentials.email, 'User not found');
        }
      }

      // Try parent login next (email-based)
      if (credentials.email && !isAdmissionNumber) {
        console.log('🔍 Checking parent for:', credentials.email);
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
            console.log('✅ Authenticated parent:', parent.email);
            await trackLoginActivity(mockRequest, true, parent.email);
            return {
              id: parent.id.toString(),
              email: parent.email,
              name: parent.name,
              roles: ['parent'],
              students: parent.students.map(sp => sp.student)
            } as any;
          } else {
            await trackLoginActivity(mockRequest, false, parent.email, 'Parent password mismatch');
          }
        }
      }
      
      // Try student login (admission number-based)
      if (admissionNumber) {
        console.log('🔍 Checking student with admission number:', admissionNumber);
        const student = await prisma.student.findUnique({
          where: { admissionNo: admissionNumber },
          include: {
            class: true,
            session: true
          }
        });
        
        if (student) {
          console.log('🔍 Student found, verifying password');
          // For students, password is typically the admission number
          const studentPasswordMatch = student.admissionNo === credentials.password.toUpperCase();
          console.log('Student password match result:', studentPasswordMatch);
          
          if (studentPasswordMatch) {
            console.log('✅ Authenticated student:', student.admissionNo);
            await trackLoginActivity(mockRequest, true, student.admissionNo);
            return {
              id: student.id.toString(),
              admissionNo: student.admissionNo,
              name: `${student.firstName} ${student.lastName}`,
              roles: ['student'],
              classId: student.classId,
              sessionId: student.sessionId,
              class: student.class,
              session: student.session
            } as any;
          } else {
            console.log('❌ Student password mismatch');
            await trackLoginActivity(mockRequest, false, student.admissionNo, 'Student password mismatch');
          }
        } else {
          console.log('❌ No student found with admission number:', admissionNumber);
          await trackLoginActivity(mockRequest, false, admissionNumber, 'Student not found');
        }
      }
      
    } catch (error) {
      console.error('❌ Authentication error:', error);
      await trackLoginActivity(mockRequest, false, credentials?.email, 'Authentication error');
      return null;
    }

    console.log('❌ Authentication failed - no matching credentials');
    await trackLoginActivity(mockRequest, false, credentials?.email, 'No matching credentials');
    return null;
  },
});
