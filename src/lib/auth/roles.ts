/** @package dpride-school auth roles – single source of truth.
 *  One canonical role string per user type. Every helper in auth-utils.ts must read from here.
 */

export const Role = {
  Administrator: 'Administrator',
  Teacher: 'Teacher',
  Parent: 'Parent',
  Student: 'Student',
} as const;

/** Return true if the session user has *any* of the given roles. */
export function hasRole(session: any, ...roles: string[]): boolean {
  if (!session?.user) return false;
  const userRoles = (session.user as any).roles || [];
  return roles.some(role => userRoles.includes(role));
}

/** Aliases kept for backward compatibility – all read from Role constant above. */
export const isAdmin = (session: any) => hasRole(session, Role.Administrator);
export const isTeacher = (session: any) => hasRole(session, Role.Teacher);
export const isParent = (session: any) => hasRole(session, Role.Parent);
export const isStudent = (session: any) => hasRole(session, Role.Student);

/** Normalise every role payload to an uppercase string array. Called on auth init. */
export function normaliseRoles(raw: any[] | string): string[] {
  if (Array.isArray(raw)) return raw.map((r: any) => String(r).trim());
  return [String(raw).trim()];
}