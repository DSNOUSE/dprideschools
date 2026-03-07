/**
 * Authentication Utility Functions
 * 
 * Centralized role checking and session utilities
 */

import { Session } from 'next-auth';
/**
 * Extended user interface with additional properties
 */
export interface ExtendedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  roles?: string[];
  role?: string | string[];
  admissionNo?: string;
  students?: unknown[];
}

/**
 * Extended session interface
 */

export interface SessionUser extends Session {
  user: ExtendedUser;
}

/**
 * Check if user has any of the specified roles
 */
export function hasRole(session: Session | null, ...roles: string[]): boolean {
  if (!session?.user) return false;
  
  const userRoles = (session.user as ExtendedUser)?.roles;
  if (!userRoles) return false;
  
  return roles.some(role => userRoles.includes(role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(session: Session | null, ...roles: string[]): boolean {
  if (!session?.user) return false;
  
  const userRoles = (session.user as ExtendedUser)?.roles;
  if (!userRoles) return false;
  
  return roles.every(role => userRoles.includes(role));
}

/**
 * Check if user is an administrator
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, 'Administrator');
}

/**
 * Check if user is a teacher
 */
export function isTeacher(session: Session | null): boolean {
  return hasRole(session, 'Teacher');
}

/**
 * Check if user is a parent
 */
export function isParent(session: Session | null): boolean {
  return (session?.user as ExtendedUser)?.role === 'parent';
}

/**
 * Check if user is a student
 */
export function isStudent(session: Session | null): boolean {
  return (session?.user as ExtendedUser)?.role === 'student';
}

/**
 * Get user roles as array
 */
export function getUserRoles(session: Session | null): string[] {
  if (!session?.user) return [];
  return (session.user as ExtendedUser)?.roles || [];
}
