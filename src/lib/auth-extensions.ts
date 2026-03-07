import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import argon2 from 'argon2';
import { logger } from './logger';

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
      logger.debug('Authorization attempt without password');
      return null;
    }
    
    try {
      // Try application user (admin/teacher) login first (email-based)
      if (credentials.email) {
        logger.debug('Attempting application user login', { email: credentials.email });
        const appUser = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: { roles: { include: { role: true } } }
        });

        if (appUser) {
          const userPasswordMatch = await argon2.verify(appUser.passwordHash, credentials.password).catch(err => {
            logger.error('Password verification failed', err);
            return false;
          });
          if (userPasswordMatch) {
            const roles = (appUser.roles || []).map(r => r.role?.name).filter(Boolean);
            logger.info('User authenticated successfully', { userId: appUser.id, roles });
            return {
              id: appUser.id,
              email: appUser.email,
              name: appUser.name,
              role: roles.length === 1 ? roles[0] : roles,
              roles,
            } as any;
          }
        }
      }

      // Try parent login next (email-based)
      if (credentials.email) {
        logger.debug('Attempting parent login', { email: credentials.email });
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
            const parentPasswordMatch = await argon2.verify(parent.passwordHash, credentials.password).catch(err => {
              logger.error('Parent password verification failed', err);
              return false;
            });
            if (parentPasswordMatch) {
              logger.info('Parent authenticated successfully', { parentId: parent.id });
              return {
                id: parent.id,
                email: parent.email,
                name: parent.name,
                role: 'parent',
                students: parent.students.map(sp => sp.student)
              } as any;
            }
          }
      }
      
      // Try student login (admission number-based)
      if (credentials.admissionNo) {
        logger.debug('Attempting student login', { admissionNo: credentials.admissionNo });
        const student = await prisma.student.findUnique({
          where: { admissionNo: credentials.admissionNo.toUpperCase() },
          include: {
            class: true,
            session: true
          }
        });
        
        if (student) {
          if (student.admissionNo === credentials.password) {
            logger.info('Student authenticated successfully', { studentId: student.id });
            return {
              id: student.id,
              admissionNo: student.admissionNo,
              name: `${student.firstName} ${student.lastName}`,
              role: 'student',
              classId: student.classId,
              sessionId: student.sessionId,
              class: student.class,
              session: student.session
            } as any;
          }
        }
      }
      
      // Also try student login with email field (for flexibility)
      if (credentials.email) {
        logger.debug('Attempting student login via email field', { email: credentials.email });
        const student = await prisma.student.findUnique({
          where: { admissionNo: credentials.email.toUpperCase() },
          include: {
            class: true,
            session: true
          }
        });
        
        if (student) {
          if (student.admissionNo === credentials.password) {
            logger.info('Student authenticated via email field', { studentId: student.id });
            return {
              id: student.id,
              admissionNo: student.admissionNo,
              name: `${student.firstName} ${student.lastName}`,
              role: 'student',
              classId: student.classId,
              sessionId: student.sessionId,
              class: student.class,
              session: student.session
            } as any;
          }
        }
      }
      
    } catch (error) {
      logger.error('Authentication error', error);
      return null;
    }

    logger.debug('Authentication failed - no matching credentials');
    return null;
  },
});
