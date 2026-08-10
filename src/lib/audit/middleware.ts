/**
 * Audit Middleware for tracking teacher activities
 * Can be used in API routes to automatically log teacher actions
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logTeacherActivity, extractRequestInfo, extractTeacherInfo } from './service';

export async function trackTeacherActivity(
  request: NextRequest,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any,
  duration?: number,
  recordsAffected?: number,
  classId?: number,
  termId?: number,
  sessionIdAcademic?: number
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    const roles = (session.user as any)?.roles as string[] | undefined;
    if (!roles?.includes('Teacher') && !roles?.includes('Administrator')) {
      return null; // Only track teachers and admins
    }

    const requestInfo = extractRequestInfo(request, session);
    
    // Get user information safely
    const userId = (session.user as any)?.id || 'unknown';
    
    // Extract teacher information
    const teacherInfo = extractTeacherInfo(session);

    return await logTeacherActivity({
      userId,
      action,
      resourceType,
      resourceId,
      details,
      teacherId: teacherInfo.teacherId,
      teacherFullName: teacherInfo.teacherFullName,
      duration,
      recordsAffected,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      sessionId: requestInfo.sessionId,
      classId,
      termId,
      sessionIdAcademic
    });
  } catch (error) {
    console.error('Failed to track teacher activity:', error);
    return null;
  }
}

/**
 * Higher-order function to wrap API handlers with activity tracking
 */
export function withActivityTracking(
  action: string,
  resourceType: string,
  handler: (request: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (request: NextRequest, ...args: any[]) => {
    const startTime = Date.now();
    let response: Response;
    let error: Error | null = null;

    try {
      response = await handler(request, ...args);
    } catch (e) {
      error = e as Error;
      throw e;
    } finally {
      const duration = Date.now() - startTime;
      
      // Extract resource ID from request if possible
      const url = new URL(request.url);
      const resourceId = url.searchParams.get('id') || 
                        url.pathname.split('/').pop() || 
                        undefined;

      await trackTeacherActivity(
        request,
        action,
        resourceType,
        resourceId,
        {
          method: request.method,
          path: url.pathname,
          success: !error,
          error: error?.message
        },
        duration
      );
    }

    return response;
  };
}

/**
 * Track login activity specifically
 */
export async function trackLoginActivity(request: NextRequest, success: boolean, userEmail?: string, error?: string) {
  try {
    const requestInfo = extractRequestInfo(request, { sessionToken: 'login_attempt' });
    
    // For login attempts, we might not have a session yet, so we'll create a special log entry
    const { prisma } = await import('@/lib/prisma');
    
    await prisma.teacherActivityLog.create({
      data: {
        userId: 'system', // Special user ID for login attempts
        action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
        resourceType: 'AUTHENTICATION',
        details: {
          userEmail,
          success,
          error,
          userAgent: requestInfo.userAgent
        },
        ipAddress: requestInfo.ipAddress,
        userAgent: requestInfo.userAgent,
        clientSessionId: requestInfo.sessionId,
        timestamp: new Date()
      }
    });
  } catch (logError) {
    console.error('Failed to track login activity:', logError);
  }
}

/**
 * Track bulk operations
 */
export async function trackBulkOperation(
  request: NextRequest,
  operation: string,
  resourceType: string,
  recordCount: number,
  details?: any
) {
  return await trackTeacherActivity(
    request,
    `BULK_${operation.toUpperCase()}`,
    resourceType,
    undefined,
    {
      ...details,
      recordCount,
      operation
    },
    undefined,
    recordCount
  );
}
