/**
 * Audit Service for tracking result modifications
 * Provides comprehensive logging for compliance and security
 */

import { prisma } from '@/lib/prisma';
import { createResultChangeNotification, createSecurityAlert } from '@/lib/notifications/service';
import type { NextRequest } from 'next/server';

export interface AuditLogData {
  entityType: 'Grade' | 'Result' | 'SUBJECT_RESULT' | 'TERM_RESULT' | 'REPORT' | string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValues?: any;
  newValues: any;
  changedFields?: string[];
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  teacherId?: string;
  teacherFullName?: string;
  sessionId: string;
  ipAddress: string;
  userAgent?: string;
  classId?: number;
  studentId?: string;
  subjectId?: number;
  termId?: number;
  sessionIdAcademic?: number;
  source?: string;
  batchId?: string;
  notes?: string;
}

export interface TeacherActivityData {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: any;
  teacherId?: string;
  teacherFullName?: string;
  duration?: number;
  recordsAffected?: number;
  ipAddress: string;
  userAgent?: string;
  sessionId: string;
  classId?: number;
  termId?: number;
  sessionIdAcademic?: number;
}

/**
 * Extract teacher information from user session
 */
export function extractTeacherInfo(session: any): { teacherId?: string; teacherFullName?: string } {
  const user = session?.user as any;
  return {
    teacherId: user?.teacherId || undefined,
    teacherFullName: user?.name || undefined
  };
}

/**
 * Create an audit log entry for result modifications
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // Calculate changed fields if not provided
    let changedFields = data.changedFields;
    if (!changedFields && data.oldValues && data.newValues) {
      changedFields = calculateChangedFields(data.oldValues, data.newValues);
    }

    const {
      sessionId,
      sessionIdAcademic,
      teacherFullName,
      teacherId,
      ...rest
    } = data as any;

    let resolvedTeacherId: string | undefined = teacherId;
    if (teacherId) {
      const byId = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!byId) {
        const byStaff = await prisma.teacher.findUnique({ where: { staffNumber: teacherId } });
        resolvedTeacherId = byStaff?.id;
      }
    }

    const auditLog = await prisma.resultAuditLog.create({
      data: {
        ...rest,
        changedFields,
        teacherId: resolvedTeacherId,
        clientSessionId: sessionId,
        academicSessionId: sessionIdAcademic,
        timestamp: new Date(),
      },
    });

    // Create notification for result changes (non-bulk operations)
    if (!data.batchId) {
      await createResultChangeNotification({
        entityType: data.entityType as any,
        action: data.action,
        userId: data.userId,
        userName: data.userName,
        changedFields,
        isBulk: false
      });
    }

    // Check for suspicious activities
    await checkForSuspiciousActivity(data);

    return auditLog;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging failure shouldn't break the main operation
    return null;
  }
}

/**
 * Log teacher activity for performance tracking
 */
export async function logTeacherActivity(data: TeacherActivityData) {
  try {
    const {
      sessionId,
      sessionIdAcademic,
      teacherFullName,
      teacherId,
      ...rest
    } = data as any;

    let resolvedTeacherId: string | undefined = teacherId;
    if (teacherId) {
      const byId = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!byId) {
        const byStaff = await prisma.teacher.findUnique({ where: { staffNumber: teacherId } });
        resolvedTeacherId = byStaff?.id;
      }
    }

    const activity = await prisma.teacherActivityLog.create({
      data: {
        ...rest,
        teacherId: resolvedTeacherId,
        clientSessionId: sessionId,
        academicSessionId: sessionIdAcademic,
        timestamp: new Date(),
      },
    });

    return activity;
  } catch (error) {
    console.error('Failed to log teacher activity:', error);
    return null;
  }
}

/**
 * Get audit logs with filtering options
 */
export async function getAuditLogs(filters: {
  entityType?: string;
  entityId?: string;
  userId?: string;
  classId?: number;
  studentId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters.entityType) where.entityType = filters.entityType;
  if (filters.entityId) where.entityId = filters.entityId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.classId) where.classId = filters.classId;
  if (filters.studentId) where.studentId = filters.studentId;
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  const logs = await prisma.resultAuditLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      student: {
        select: {
          admissionNo: true,
          firstName: true,
          lastName: true,
        }
      },
      subject: {
        select: {
          name: true,
        }
      },
      class: {
        select: {
          name: true,
        }
      },
      term: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: filters.limit || 100,
    skip: filters.offset || 0,
  });

  return logs;
}

/**
 * Get teacher activity logs
 */
export async function getTeacherActivityLogs(filters: {
  userId?: string;
  action?: string;
  classId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const where: any = {};
  
  if (filters.userId) where.userId = filters.userId;
  if (filters.action) where.action = filters.action;
  if (filters.classId) where.classId = filters.classId;
  
  if (filters.startDate || filters.endDate) {
    where.timestamp = {};
    if (filters.startDate) where.timestamp.gte = filters.startDate;
    if (filters.endDate) where.timestamp.lte = filters.endDate;
  }

  const logs = await prisma.teacherActivityLog.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      class: {
        select: {
          name: true,
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: filters.limit || 100,
    skip: filters.offset || 0,
  });

  return logs;
}

/**
 * Get audit statistics for admin dashboard
 */
export async function getAuditStats(timeframe: 'day' | 'week' | 'month' = 'week') {
  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
  }

  const [
    totalChanges,
    uniqueTeachers,
    gradeChanges,
    resultChanges,
    bulkOperations,
    recentActivity
  ] = await Promise.all([
    // Total changes in timeframe
    prisma.resultAuditLog.count({
      where: {
        timestamp: { gte: startDate }
      }
    }),
    
    // Unique teachers who made changes
    prisma.resultAuditLog.findMany({
      where: {
        timestamp: { gte: startDate }
      },
      select: { userId: true },
      distinct: ['userId']
    }).then(logs => logs.length),
    
    // Grade-specific changes
    prisma.resultAuditLog.count({
      where: {
        entityType: 'Grade',
        timestamp: { gte: startDate }
      }
    }),
    
    // Result-specific changes
    prisma.resultAuditLog.count({
      where: {
        entityType: 'Result',
        timestamp: { gte: startDate }
      }
    }),
    
    // Bulk operations
    prisma.resultAuditLog.count({
      where: {
        batchId: { not: null },
        timestamp: { gte: startDate }
      }
    }),
    
    // Recent activity (last 24 hours)
    prisma.resultAuditLog.findMany({
      where: {
        timestamp: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
      },
      include: {
        user: { select: { name: true } },
        student: { select: { firstName: true, lastName: true } }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    })
  ]);

  return {
    totalChanges,
    uniqueTeachers,
    gradeChanges,
    resultChanges,
    bulkOperations,
    recentActivity,
    timeframe,
    startDate,
    endDate: now
  };
}

/**
 * Extract request information for audit logging
 */
export function extractRequestInfo(request: NextRequest, session: any) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
               request.headers.get('x-real-ip') || 
               'unknown';

  return {
    ipAddress: ip,
    userAgent: request.headers.get('user-agent') || undefined,
    sessionId: session?.sessionToken || 'unknown',
  };
}

/**
 * Calculate which fields changed between old and new values
 */
function calculateChangedFields(oldValues: any, newValues: any): string[] {
  const changedFields: string[] = [];
  
  for (const key in newValues) {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key);
    }
  }
  
  return changedFields;
}

/**
 * Check for suspicious activities and create security alerts
 */
async function checkForSuspiciousActivity(data: AuditLogData) {
  try {
    // Check for rapid deletions
    if (data.action === 'DELETE') {
      const recentDeletions = await prisma.resultAuditLog.count({
        where: {
          userId: data.userId,
          action: 'DELETE',
          timestamp: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
          }
        }
      });

      if (recentDeletions >= 5) {
        await createSecurityAlert({
          type: 'BULK_DELETION',
          userId: data.userId,
          ipAddress: data.ipAddress,
          details: {
            deletionCount: recentDeletions + 1,
            timeWindow: '5 minutes',
            entityType: data.entityType
          }
        });
      }
    }

    // Check for unusual score changes (large grade variations)
    if (data.action === 'UPDATE' && data.entityType === 'Grade' && data.oldValues && data.newValues) {
      const oldAverage = data.oldValues.average || 0;
      const newAverage = data.newValues.average || 0;
      const difference = Math.abs(newAverage - oldAverage);

      if (difference > 30) { // More than 30 point change
        await createSecurityAlert({
          type: 'UNUSUAL_ACTIVITY',
          userId: data.userId,
          ipAddress: data.ipAddress,
          details: {
            activityType: 'LARGE_GRADE_CHANGE',
            oldScore: oldAverage,
            newScore: newAverage,
            difference,
            studentId: data.studentId,
            subjectId: data.subjectId
          }
        });
      }
    }

    // Check for activities from unusual IP addresses
    const recentLogs = await prisma.resultAuditLog.findMany({
      where: {
        userId: data.userId,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      select: {
        ipAddress: true
      },
      distinct: ['ipAddress']
    });

    const uniqueIPs = recentLogs.map(log => log.ipAddress);
    if (uniqueIPs.length > 3) { // More than 3 different IPs in 24 hours
      await createSecurityAlert({
        type: 'UNUSUAL_ACTIVITY',
        userId: data.userId,
        ipAddress: data.ipAddress,
        details: {
          activityType: 'MULTIPLE_IP_ADDRESSES',
          uniqueIPCount: uniqueIPs.length,
          ipAddresses: uniqueIPs,
          timeWindow: '24 hours'
        }
      });
    }

  } catch (error) {
    console.error('Failed to check for suspicious activity:', error);
  }
}

/**
 * Create approval workflow entry
 */
export async function createResultApproval(data: {
  entityType: string;
  entityId: string;
  entityTypeFull?: string;
  submittedBy: string;
  classId?: number;
  studentId?: string;
  termId?: number;
  sessionIdAcademic?: number;
  submitterNotes?: string;
}) {
  try {
    const mappedEntityType =
      data.entityType === 'Result' || data.entityType === 'TERM_RESULT'
        ? 'TERM_RESULT'
        : data.entityType === 'Report' || data.entityType === 'REPORT'
          ? 'REPORT'
          : data.entityType === 'Assessment' || data.entityType === 'ASSESSMENT'
            ? 'ASSESSMENT'
            : 'SUBJECT_RESULT';

    const approval = await prisma.resultApproval.create({
      data: {
        entityType: mappedEntityType as any,
        entityId: data.entityId,
        submittedBy: data.submittedBy,
        classId: data.classId,
        studentId: data.studentId,
        termId: data.termId,
        sessionId: data.sessionIdAcademic,
        submitterNotes: data.submitterNotes,
        submittedAt: new Date(),
        status: 'PENDING',
      },
    });

    return approval;
  } catch (error) {
    console.error('Failed to create result approval:', error);
    return null;
  }
}

/**
 * Update approval status
 */
export async function updateApprovalStatus(
  approvalId: string,
  status: 'APPROVED' | 'REJECTED',
  userId: string,
  notes?: string
) {
  try {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'APPROVED') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
      updateData.approverNotes = notes;
    } else if (status === 'REJECTED') {
      updateData.rejectedBy = userId;
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = notes;
    }

    const approval = await prisma.resultApproval.update({
      where: { id: approvalId },
      data: updateData,
    });

    return approval;
  } catch (error) {
    console.error('Failed to update approval status:', error);
    return null;
  }
}
