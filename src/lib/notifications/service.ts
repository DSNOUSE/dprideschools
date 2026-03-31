/**
 * Notification Service for real-time alerts on result changes
 * Provides email and in-app notifications for audit events
 */

import { prisma } from '@/lib/prisma';

export interface NotificationData {
  title: string;
  message: string;
  type: 'RESULT_CHANGE' | 'GRADE_CHANGE' | 'BULK_OPERATION' | 'SECURITY_ALERT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  recipientType: 'ALL_ADMIN' | 'SPECIFIC_USERS';
  recipientIds?: string[];
  details?: any;
}

/**
 * Create notification for result changes
 */
export async function createResultChangeNotification(data: {
  entityType: 'Grade' | 'Result';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  userId: string;
  userName: string;
  studentName?: string;
  subjectName?: string;
  className?: string;
  changedFields?: string[];
  isBulk?: boolean;
}) {
  try {
    const isHighPriority = data.action === 'DELETE' || data.isBulk;
    const isBulk = data.isBulk || false;

    const title = isBulk 
      ? `Bulk ${data.entityType} ${data.action}`
      : `${data.entityType} ${data.action}`;

    let message = `${data.userName} `;
    
    if (isBulk) {
      message += `performed bulk ${data.action.toLowerCase()} on ${data.entityType.toLowerCase()}s`;
    } else {
      message += `${data.action.toLowerCase()}d a ${data.entityType.toLowerCase()}`;
      
      if (data.studentName) {
        message += ` for ${data.studentName}`;
      }
      
      if (data.subjectName) {
        message += ` in ${data.subjectName}`;
      }
      
      if (data.className) {
        message += ` (${data.className})`;
      }
    }

    if (data.changedFields && data.changedFields.length > 0) {
      message += `. Changed: ${data.changedFields.join(', ')}`;
    }

    // Get all admin users
    const adminUsers = await prisma.userRole.findMany({
      where: {
        role: {
          name: 'Administrator'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (adminUsers.length === 0) {
      console.warn('No admin users found for notification');
      return null;
    }

    // Create in-app notification
    const notification = await prisma.notification.create({
      data: {
        senderId: data.userId, // The user who triggered notification
        title,
        message: message + (data.changedFields && data.changedFields.length > 0 
          ? `\n\nDetails: ${JSON.stringify({
              entityType: data.entityType,
              action: data.action,
              userId: data.userId,
              userName: data.userName,
              studentName: data.studentName,
              subjectName: data.subjectName,
              className: data.className,
              changedFields: data.changedFields,
              isBulk,
              timestamp: new Date().toISOString()
            })}` 
          : ''),
        type: 'ANNOUNCEMENT', // Using existing notification type
        priority: isHighPriority ? 'HIGH' : 'NORMAL',
        recipientType: 'SPECIFIC_PARENTS', // Reusing existing field, will handle differently
      }
    });

    // Create notification recipients for all admins
    const recipients = await Promise.all(
      adminUsers.map(async (adminUser) => {
        return await prisma.notificationRecipient.create({
          data: {
            notificationId: notification.id,
            parentId: adminUser.user.id, // Using parentId field to store admin user ID
            read: false
          }
        });
      })
    );

    // Log the notification creation
    console.log(`✅ Created ${data.entityType} ${data.action} notification for ${adminUsers.length} admins`);

    return {
      notification,
      recipients,
      adminCount: adminUsers.length
    };

  } catch (error) {
    console.error('Failed to create result change notification:', error);
    return null;
  }
}

/**
 * Create security alert for suspicious activities
 */
export async function createSecurityAlert(data: {
  type: 'MULTIPLE_FAILED_LOGINS' | 'UNUSUAL_ACTIVITY' | 'BULK_DELETION' | 'UNAUTHORIZED_ACCESS';
  userId?: string;
  ipAddress?: string;
  details?: any;
}) {
  try {
    const title = `Security Alert: ${data.type.replace(/_/g, ' ')}`;
    
    let message = `Security alert triggered: ${data.type.replace(/_/g, ' ').toLowerCase()}`;
    
    if (data.ipAddress) {
      message += ` from IP ${data.ipAddress}`;
    }
    
    if (data.userId) {
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { name: true, email: true }
      });
      
      if (user) {
        message += ` by user ${user.name} (${user.email})`;
      }
    }

    // Get all admin users
    const adminUsers = await prisma.userRole.findMany({
      where: {
        role: {
          name: 'Administrator'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create high-priority notification
    const notification = await prisma.notification.create({
      data: {
        senderId: 'system', // System-generated notification
        title,
        message: message + (data.details ? `\n\nDetails: ${JSON.stringify(data.details)}` : ''),
        type: 'ANNOUNCEMENT',
        priority: 'URGENT',
        recipientType: 'SPECIFIC_PARENTS'
      }
    });

    // Create notification recipients for all admins
    const recipients = await Promise.all(
      adminUsers.map(async (adminUser) => {
        return await prisma.notificationRecipient.create({
          data: {
            notificationId: notification.id,
            parentId: adminUser.user.id,
            read: false
          }
        });
      })
    );

    console.log(`🚨 Created security alert: ${data.type} for ${adminUsers.length} admins`);

    return {
      notification,
      recipients,
      adminCount: adminUsers.length
    };

  } catch (error) {
    console.error('Failed to create security alert:', error);
    return null;
  }
}

/**
 * Extract details from message if it contains JSON
 */
function extractDetailsFromMessage(message: string): any {
  try {
    const detailsMatch = message.match(/\n\nDetails: (.+)$/);
    if (detailsMatch) {
      return JSON.parse(detailsMatch[1]);
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Get unread notifications for admin users
 */
export async function getAdminNotifications(userId: string, limit = 10) {
  try {
    const notifications = await prisma.notificationRecipient.findMany({
      where: {
        parentId: userId, // Using parentId field to store admin user ID
        read: false
      },
      include: {
        notification: {
          include: {
            sender: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        notification: {
          sentAt: 'desc'
        }
      },
      take: limit
    });

    return notifications.map(nr => ({
      id: nr.notification.id,
      title: nr.notification.title,
      message: nr.notification.message,
      type: nr.notification.type,
      priority: nr.notification.priority,
      sentAt: nr.notification.sentAt,
      sender: nr.notification.sender,
      // Extract details from message if it contains JSON
      details: extractDetailsFromMessage(nr.notification.message),
      readAt: nr.readAt
    }));

  } catch (error) {
    console.error('Failed to get admin notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const updated = await prisma.notificationRecipient.updateMany({
      where: {
        notificationId,
        parentId: userId
      },
      data: {
        read: true,
        readAt: new Date()
      }
    });

    return updated.count > 0;

  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
}

/**
 * Get notification statistics for admin dashboard
 */
export async function getNotificationStats(userId?: string) {
  try {
    const whereClause = userId ? { parentId: userId } : {};
    
    const [total, unread, urgent] = await Promise.all([
      prisma.notificationRecipient.count({
        where: whereClause
      }),
      prisma.notificationRecipient.count({
        where: {
          ...whereClause,
          read: false
        }
      }),
      prisma.notificationRecipient.count({
        where: {
          ...whereClause,
          read: false,
          notification: {
            priority: 'URGENT'
          }
        }
      })
    ]);

    return {
      total,
      unread,
      urgent
    };

  } catch (error) {
    console.error('Failed to get notification stats:', error);
    return {
      total: 0,
      unread: 0,
      urgent: 0
    };
  }
}
