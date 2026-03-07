import { describe, it, expect } from 'vitest';
import { hasRole, isAdmin, isTeacher, getUserRoles } from '@/lib/auth-utils';
import { SessionUser } from '@/lib/auth-utils';

describe('Auth Utilities', () => {
  describe('hasRole', () => {
    it('should return true if user has the specified role', () => {
      const session: SessionUser = {
        user: {
          roles: ['Administrator', 'Teacher'],
        },
        expires: '2024-12-31',
      };

      expect(hasRole(session, 'Administrator')).toBe(true);
      expect(hasRole(session, 'Teacher')).toBe(true);
    });

    it('should return false if user does not have the specified role', () => {
      const session: SessionUser = {
        user: {
          roles: ['Teacher'],
        },
        expires: '2024-12-31',
      };

      expect(hasRole(session, 'Administrator')).toBe(false);
    });

    it('should return false if session is null', () => {
      expect(hasRole(null, 'Administrator')).toBe(false);
    });

    it('should return false if user has no roles', () => {
      const session = {
        user: {},
        expires: '2024-12-31',
      };

      expect(hasRole(session, 'Administrator')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true for administrator', () => {
      const session: SessionUser = {
        user: {
          roles: ['Administrator'],
        },
        expires: '2024-12-31',
      };

      expect(isAdmin(session)).toBe(true);
    });

    it('should return false for non-administrator', () => {
      const session: SessionUser = {
        user: {
          roles: ['Teacher'],
        },
        expires: '2024-12-31',
      };

      expect(isAdmin(session)).toBe(false);
    });
  });

  describe('isTeacher', () => {
    it('should return true for teacher', () => {
      const session: SessionUser = {
        user: {
          roles: ['Teacher'],
        },
        expires: '2024-12-31',
      };

      expect(isTeacher(session)).toBe(true);
    });
  });

  describe('getUserRoles', () => {
    it('should return array of roles', () => {
      const session: SessionUser = {
        user: {
          roles: ['Administrator', 'Teacher'],
        },
        expires: '2024-12-31',
      };

      expect(getUserRoles(session)).toEqual(['Administrator', 'Teacher']);
    });

    it('should return empty array if no roles', () => {
      const session = {
        user: {},
        expires: '2024-12-31',
      };

      expect(getUserRoles(session)).toEqual([]);
    });
  });
});
