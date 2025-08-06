import { prismaClient as prisma } from '../config/prisma';
import { logger } from '../utils/logger.utils';

export interface ActivityData {
  type: string;
  description: string;
  userId: string;
  knowledgeItemId?: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  /**
   * Log user activity
   */
  static async logActivity(data: ActivityData): Promise<void> {
    try {
      await prisma.activity.create({
        data: {
          type: data.type,
          description: data.description,
          userId: data.userId,
          knowledgeItemId: data.knowledgeItemId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null
        }
      });

      logger.info('Activity logged', {
        type: data.type,
        userId: data.userId,
        description: data.description
      });
    } catch (error: any) {
      logger.error('Failed to log activity', {
        error: error.message,
        activityData: data
      });
    }
  }

  /**
   * Log user login activity
   */
  static async logLogin(userId: string, email: string): Promise<void> {
    await this.logActivity({
      type: 'USER_LOGIN',
      description: `User ${email} logged in`,
      userId
    });
  }

  /**
   * Log knowledge creation activity
   */
  static async logKnowledgeCreated(userId: string, knowledgeId: string, title: string): Promise<void> {
    await this.logActivity({
      type: 'KNOWLEDGE_CREATED',
      description: `Created knowledge item: ${title}`,
      userId,
      knowledgeItemId: knowledgeId
    });
  }

  /**
   * Log knowledge update activity
   */
  static async logKnowledgeUpdated(userId: string, knowledgeId: string, title: string): Promise<void> {
    await this.logActivity({
      type: 'KNOWLEDGE_UPDATED',
      description: `Updated knowledge item: ${title}`,
      userId,
      knowledgeItemId: knowledgeId
    });
  }

  /**
   * Log project join activity
   */
  static async logProjectJoined(userId: string, projectId: string, projectName: string): Promise<void> {
    await this.logActivity({
      type: 'PROJECT_JOINED',
      description: `Joined project: ${projectName}`,
      userId,
      metadata: { projectId }
    });
  }

  /**
   * Log user registration activity
   */
  static async logUserRegistration(userId: string, email: string): Promise<void> {
    await this.logActivity({
      type: 'USER_SIGNUP',
      description: `New user registered: ${email}`,
      userId
    });
  }

  /**
   * Log user approval activity
   */
  static async logUserApproved(adminUserId: string, approvedUserId: string, email: string): Promise<void> {
    await this.logActivity({
      type: 'USER_APPROVED',
      description: `User approved: ${email}`,
      userId: adminUserId,
      metadata: { approvedUserId }
    });
  }

  /**
   * Get recent activities for a user
   */
  static async getUserActivities(userId: string, limit: number = 10) {
    try {
      const activities = await prisma.activity.findMany({
        where: { userId },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          knowledgeItem: {
            select: {
              title: true
            }
          }
        }
      });

      return activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.createdAt,
        knowledgeTitle: activity.knowledgeItem?.title,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      }));
    } catch (error: any) {
      logger.error('Failed to get user activities', {
        error: error.message,
        userId
      });
      return [];
    }
  }

  /**
   * Get recent system activities
   */
  static async getRecentActivities(limit: number = 20) {
    try {
      const activities = await prisma.activity.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          },
          knowledgeItem: {
            select: {
              title: true
            }
          }
        }
      });

      return activities.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.createdAt,
        user: activity.user,
        knowledgeTitle: activity.knowledgeItem?.title,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      }));
    } catch (error: any) {
      logger.error('Failed to get recent activities', {
        error: error.message
      });
      return [];
    }
  }
}

export const activityService = ActivityService; 