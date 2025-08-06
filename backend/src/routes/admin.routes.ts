import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const router = Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);

// Middleware to check admin permissions
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'PROJECT_MANAGER') {
    return sendErrorResponse(res, 'Access denied. Admin privileges required.', 403, 'FORBIDDEN');
  }
  next();
};

/**
 * @route GET /api/admin/pending-users
 * @desc Get all pending user registrations
 * @access Private (Admin only)
 */
router.get('/pending-users', requireAdmin, async (req, res) => {
  try {
    // Get users who are inactive (pending approval)
    const pendingUsers = await prisma.user.findMany({
      where: {
        isActive: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to match frontend interface
    const formattedPendingUsers = pendingUsers.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      requestedRole: user.role,
      requestedAt: user.createdAt
    }));
    
    sendSuccessResponse(res, formattedPendingUsers, 'Pending users retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching pending users:', error);
    sendErrorResponse(res, 'Failed to fetch pending users', 500);
  }
});

/**
 * @route POST /api/admin/approve-user
 * @desc Approve a pending user registration
 * @access Private (Admin only)
 */
router.post('/approve-user', requireAdmin, async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return sendErrorResponse(res, 'User ID and role are required', 400);
    }

    // Update user status and role using Prisma
    await prisma.user.update({
      where: { id: userId },
      data: {
        role: role,
        isActive: true
      }
    });
    
    sendSuccessResponse(res, null, 'User approved successfully');
  } catch (error: any) {
    console.error('Error approving user:', error);
    sendErrorResponse(res, 'Failed to approve user', 500);
  }
});

/**
 * @route GET /api/admin/stats (alias for system-stats)
 * @desc Get system statistics
 * @access Private (Admin only)
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get various system statistics using Prisma
    const [totalUsers, activeUsers, pendingUsers, totalProjects, totalKnowledgeItems, recentActivityCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.project.count(),
      prisma.knowledgeItem.count(),
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      })
    ]);

    // Get recent activity items (limit 10)
    const recentActivity = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
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

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals: pendingUsers,
      totalProjects,
      totalKnowledgeItems,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.createdAt.toISOString(),
        user: activity.user,
        knowledgeTitle: activity.knowledgeItem?.title
      }))
    };

    sendSuccessResponse(res, stats, 'System stats retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching system stats:', error);
    sendErrorResponse(res, 'Failed to fetch system stats', 500);
  }
});

/**
 * @route GET /api/admin/system-stats (alias for stats)
 * @desc Get system statistics (backward compatibility)
 * @access Private (Admin only)
 */
router.get('/system-stats', requireAdmin, async (req, res) => {
  // Redirect to the main stats endpoint logic
  try {
    const [totalUsers, activeUsers, pendingUsers, totalProjects, totalKnowledgeItems] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.project.count(),
      prisma.knowledgeItem.count()
    ]);

    const recentActivity = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
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

    const stats = {
      totalUsers,
      activeUsers,
      pendingApprovals: pendingUsers,
      totalProjects,
      totalKnowledgeItems,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.type,
        description: activity.description,
        timestamp: activity.createdAt.toISOString(),
        user: activity.user,
        knowledgeTitle: activity.knowledgeItem?.title
      }))
    };

    sendSuccessResponse(res, stats, 'System stats retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching system stats:', error);
    sendErrorResponse(res, 'Failed to fetch system stats', 500);
  }
});

/**
 * @route GET /api/admin/users
 * @desc Get all users
 * @access Private (Admin only)
 */
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    sendSuccessResponse(res, users, 'Users retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching users:', error);
    sendErrorResponse(res, 'Failed to fetch users', 500);
  }
});

/**
 * @route PUT /api/admin/users/:userId/role
 * @desc Update user role
 * @access Private (Admin only)
 */
router.put('/users/:userId/role', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['ADMIN', 'PROJECT_MANAGER', 'CONTRIBUTOR', 'VIEWER'].includes(role)) {
      return sendErrorResponse(res, 'Valid role is required', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { role: role }
    });
    
    sendSuccessResponse(res, null, 'User role updated successfully');
  } catch (error: any) {
    console.error('Error updating user role:', error);
    sendErrorResponse(res, 'Failed to update user role', 500);
  }
});

/**
 * @route PUT /api/admin/users/:userId/deactivate
 * @desc Deactivate a user
 * @access Private (Admin only)
 */
router.put('/users/:userId/deactivate', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
    
    sendSuccessResponse(res, null, 'User deactivated successfully');
  } catch (error: any) {
    console.error('Error deactivating user:', error);
    sendErrorResponse(res, 'Failed to deactivate user', 500);
  }
});

/**
 * @route PUT /api/admin/users/:userId/reactivate
 * @desc Reactivate a deactivated user
 * @access Private (Admin only)
 */
router.put('/users/:userId/reactivate', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }
    
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
    
    sendSuccessResponse(res, null, 'User reactivated successfully');
  } catch (error: any) {
    console.error('Error reactivating user:', error);
    sendErrorResponse(res, 'Failed to reactivate user', 500);
  }
});

/**
 * @route DELETE /api/admin/users/:userId
 * @desc Permanently delete a user
 * @access Private (Admin only)
 */
router.delete('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }
    
    // Check if this is the current admin
    if (userId === req.user.id) {
      return sendErrorResponse(res, 'Cannot delete your own account', 400);
    }
    
    await prisma.user.delete({
      where: { id: userId }
    });
    
    sendSuccessResponse(res, null, 'User deleted successfully');
  } catch (error: any) {
    console.error('Error deleting user:', error);
    sendErrorResponse(res, 'Failed to delete user', 500);
  }
});

/**
 * @route GET /api/admin/projects
 * @desc Get all projects for admin oversight
 * @access Private (Admin only)
 */
router.get('/projects', requireAdmin, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        knowledgeItems: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        _count: {
          select: {
            members: true,
            knowledgeItems: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    sendSuccessResponse(res, projects, 'Projects retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    sendErrorResponse(res, 'Failed to fetch projects', 500);
  }
});

/**
 * @route PUT /api/admin/projects/:projectId/status
 * @desc Update project status
 * @access Private (Admin only)
 */
router.put('/projects/:projectId/status', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    
    if (!status || !['ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED'].includes(status)) {
      return sendErrorResponse(res, 'Valid status is required', 400);
    }
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    
    if (!project) {
      return sendErrorResponse(res, 'Project not found', 404);
    }
    
    await prisma.project.update({
      where: { id: projectId },
      data: { status: status }
    });
    
    sendSuccessResponse(res, null, 'Project status updated successfully');
  } catch (error: any) {
    console.error('Error updating project status:', error);
    sendErrorResponse(res, 'Failed to update project status', 500);
  }
});

/**
 * @route GET /api/admin/knowledge
 * @desc Get all knowledge items for admin oversight
 * @access Private (Admin only)
 */
router.get('/knowledge', requireAdmin, async (req, res) => {
  try {
    const knowledgeItems = await prisma.knowledgeItem.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            comments: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Transform tags from JSON string to array
    const transformedKnowledgeItems = knowledgeItems.map(item => ({
      ...item,
      tags: item.tags ? (
        (() => {
          try {
            return JSON.parse(item.tags);
          } catch {
            // Fallback for comma-separated strings
            return item.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
          }
        })()
      ) : []
    }));
    
    sendSuccessResponse(res, transformedKnowledgeItems, 'Knowledge items retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching knowledge items:', error);
    sendErrorResponse(res, 'Failed to fetch knowledge items', 500);
  }
});

/**
 * @route PUT /api/admin/knowledge/:knowledgeId/status
 * @desc Update knowledge item status
 * @access Private (Admin only)
 */
router.put('/knowledge/:knowledgeId/status', requireAdmin, async (req, res) => {
  try {
    const { knowledgeId } = req.params;
    const { status } = req.body;
    
    if (!status || !['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
      return sendErrorResponse(res, 'Valid status is required', 400);
    }
    
    const knowledgeItem = await prisma.knowledgeItem.findUnique({ where: { id: knowledgeId } });
    
    if (!knowledgeItem) {
      return sendErrorResponse(res, 'Knowledge item not found', 404);
    }
    
    await prisma.knowledgeItem.update({
      where: { id: knowledgeId },
      data: { status: status }
    });
    
    sendSuccessResponse(res, null, 'Knowledge item status updated successfully');
  } catch (error: any) {
    console.error('Error updating knowledge item status:', error);
    sendErrorResponse(res, 'Failed to update knowledge item status', 500);
  }
});

/**
 * @route DELETE /api/admin/knowledge/:knowledgeId
 * @desc Delete knowledge item
 * @access Private (Admin only)
 */
router.delete('/knowledge/:knowledgeId', requireAdmin, async (req, res) => {
  try {
    const { knowledgeId } = req.params;
    
    const knowledgeItem = await prisma.knowledgeItem.findUnique({ where: { id: knowledgeId } });
    
    if (!knowledgeItem) {
      return sendErrorResponse(res, 'Knowledge item not found', 404);
    }
    
    await prisma.knowledgeItem.delete({
      where: { id: knowledgeId }
    });
    
    sendSuccessResponse(res, null, 'Knowledge item deleted successfully');
  } catch (error: any) {
    console.error('Error deleting knowledge item:', error);
    sendErrorResponse(res, 'Failed to delete knowledge item', 500);
  }
});

/**
 * @route GET /api/admin/roles
 * @desc Get available user roles
 * @access Private (Admin only)
 */
router.get('/roles', requireAdmin, async (req, res) => {
  try {
    const roles = [
      { value: 'ADMIN', label: 'Administrator', description: 'Full system access and user management' },
      { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Project and team management' },
      { value: 'CONTRIBUTOR', label: 'Contributor', description: 'Create and edit content' },
      { value: 'VIEWER', label: 'Viewer', description: 'Read-only access' }
    ];
    
    sendSuccessResponse(res, roles, 'Roles retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    sendErrorResponse(res, 'Failed to fetch roles', 500);
  }
});

/**
 * @route GET /api/admin/activity
 * @desc Get recent system activity
 * @access Private (Admin only)
 */
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    
    const activities = await prisma.activity.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
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
    
    // Transform to match expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      createdAt: activity.createdAt,
      firstName: activity.user?.firstName,
      lastName: activity.user?.lastName,
      email: activity.user?.email,
      knowledgeTitle: activity.knowledgeItem?.title
    }));
    
    sendSuccessResponse(res, formattedActivities, 'Activity retrieved successfully');
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    sendErrorResponse(res, 'Failed to fetch activity', 500);
  }
});

/**
 * @route POST /api/admin/users
 * @desc Create a new user
 * @access Private (Admin only)
 */
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, username, firstName, lastName, role = 'CONTRIBUTOR', isActive = true } = req.body;
    
    if (!email || !username || !firstName || !lastName) {
      return sendErrorResponse(res, 'Email, username, first name, and last name are required', 400);
    }

    if (!['ADMIN', 'PROJECT_MANAGER', 'CONTRIBUTOR', 'VIEWER'].includes(role)) {
      return sendErrorResponse(res, 'Valid role is required', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    if (existingUser) {
      return sendErrorResponse(res, 'User with this email or username already exists', 400);
    }

    // Generate a temporary password (in production, send email with reset link)
    const tempPassword = 'TempPass123!';
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        password: hashedPassword,
        role,
        isActive,
        expertiseAreas: ''
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    sendSuccessResponse(res, newUser, 'User created successfully');
  } catch (error: any) {
    console.error('Error creating user:', error);
    sendErrorResponse(res, 'Failed to create user', 500);
  }
});

/**
 * @route PUT /api/admin/users/:userId
 * @desc Update user details
 * @access Private (Admin only)
 */
router.put('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, username, firstName, lastName, role, isActive } = req.body;
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      return sendErrorResponse(res, 'User not found', 404);
    }

    // Check if email/username is taken by another user
    if (email && email !== user.email) {
      const emailExists = await prisma.user.findFirst({
        where: { email, id: { not: userId } }
      });
      if (emailExists) {
        return sendErrorResponse(res, 'Email already taken by another user', 400);
      }
    }

    if (username && username !== user.username) {
      const usernameExists = await prisma.user.findFirst({
        where: { username, id: { not: userId } }
      });
      if (usernameExists) {
        return sendErrorResponse(res, 'Username already taken by another user', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email }),
        ...(username && { username }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      }
    });
    
    sendSuccessResponse(res, updatedUser, 'User updated successfully');
  } catch (error: any) {
    console.error('Error updating user:', error);
    sendErrorResponse(res, 'Failed to update user', 500);
  }
});

export default router; 