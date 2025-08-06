import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { projectsService } from '../services/projects.service';
import { 
  sendSuccessResponse, 
  sendErrorResponse, 
  sendNotFoundResponse,
  sendBadRequestResponse,
  sendInternalServerError
} from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

/**
 * Projects Controller
 * Handles HTTP requests for project operations
 */
export class ProjectsController {
  /**
   * Create a new project
   * POST /api/projects
   */
  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendBadRequestResponse(res, 'Validation failed', errors.array());
        return;
      }

      const creatorId = req.user.id;
      const projectData = req.body;

      const project = await projectsService.createProject(creatorId, projectData);

      logger.info('Project created', {
        projectId: project.id,
        creatorId,
        projectName: project.name
      });

      sendSuccessResponse(res, project, 'Project created successfully', 201);
    } catch (error: any) {
      logger.error('Create project failed', {
        error: error.message,
        creatorId: req.user?.id,
        body: req.body
      });

      if (error.message.includes('required')) {
        sendBadRequestResponse(res, error.message);
      } else {
        sendInternalServerError(res, 'Failed to create project');
      }
    }
  }

  /**
   * Get all projects
   * GET /api/projects
   */
  async getAllProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await projectsService.getAllProjects();

      sendSuccessResponse(res, {
        projects,
        total: projects.length
      }, 'Projects retrieved successfully');
    } catch (error: any) {
      logger.error('Get all projects failed', {
        error: error.message
      });

      sendInternalServerError(res, 'Failed to retrieve projects');
    }
  }

  /**
   * Get project by ID
   * GET /api/projects/:id
   */
  async getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const project = await projectsService.getProjectById(id);

      if (!project) {
        sendNotFoundResponse(res, 'Project not found');
        return;
      }

      sendSuccessResponse(res, project, 'Project retrieved successfully');
    } catch (error: any) {
      logger.error('Get project by ID failed', {
        error: error.message,
        projectId: req.params.id
      });

      sendInternalServerError(res, 'Failed to retrieve project');
    }
  }

  /**
   * Update project
   * PUT /api/projects/:id
   */
  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendBadRequestResponse(res, 'Validation failed', errors.array());
        return;
      }

      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const project = await projectsService.updateProject(id, userId, updateData);

      logger.info('Project updated', {
        projectId: id,
        updatedBy: userId
      });

      sendSuccessResponse(res, project, 'Project updated successfully');
    } catch (error: any) {
      logger.error('Update project failed', {
        error: error.message,
        projectId: req.params.id,
        userId: req.user?.id
      });

      if (error.message.includes('not found')) {
        sendNotFoundResponse(res, error.message);
      } else if (error.message.includes('Permission denied')) {
        sendErrorResponse(res, error.message, 403);
      } else {
        sendInternalServerError(res, 'Failed to update project');
      }
    }
  }

  /**
   * Delete project
   * DELETE /api/projects/:id
   */
  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await projectsService.deleteProject(id, userId);

      logger.info('Project deleted', {
        projectId: id,
        deletedBy: userId
      });

      sendSuccessResponse(res, { deleted: result }, 'Project deleted successfully');
    } catch (error: any) {
      logger.error('Delete project failed', {
        error: error.message,
        projectId: req.params.id,
        userId: req.user?.id
      });

      if (error.message.includes('not found')) {
        sendNotFoundResponse(res, error.message);
      } else if (error.message.includes('Permission denied')) {
        sendErrorResponse(res, error.message, 403);
      } else {
        sendInternalServerError(res, 'Failed to delete project');
      }
    }
  }

  /**
   * Add member to project
   * POST /api/projects/:id/members
   */
  async addProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendBadRequestResponse(res, 'Validation failed', errors.array());
        return;
      }

      const { id: projectId } = req.params;
      const { userId, role } = req.body;
      const addedBy = req.user.id;

      // Check if user has permission to add members
      const adderMembership = await projectsService.getUserProjectMembership(projectId, addedBy);
      if (!adderMembership || adderMembership.role !== 'LEAD') {
        sendErrorResponse(res, 'Permission denied: Only project leads can add members', 403);
        return;
      }

      const member = await projectsService.addProjectMember(projectId, userId, role);

      logger.info('Project member added', {
        projectId,
        userId,
        role,
        addedBy
      });

      sendSuccessResponse(res, member, 'Member added to project successfully', 201);
    } catch (error: any) {
      logger.error('Add project member failed', {
        error: error.message,
        projectId: req.params.id,
        userId: req.body.userId,
        addedBy: req.user?.id
      });

      if (error.message.includes('not found')) {
        sendNotFoundResponse(res, error.message);
      } else if (error.message.includes('already a member')) {
        sendBadRequestResponse(res, error.message);
      } else {
        sendInternalServerError(res, 'Failed to add member to project');
      }
    }
  }

  /**
   * Remove member from project
   * DELETE /api/projects/:id/members/:userId
   */
  async removeProjectMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: projectId, userId } = req.params;
      const removedBy = req.user.id;

      const result = await projectsService.removeProjectMember(projectId, userId, removedBy);

      logger.info('Project member removed', {
        projectId,
        userId,
        removedBy
      });

      sendSuccessResponse(res, { removed: result }, 'Member removed from project successfully');
    } catch (error: any) {
      logger.error('Remove project member failed', {
        error: error.message,
        projectId: req.params.id,
        userId: req.params.userId,
        removedBy: req.user?.id
      });

      if (error.message.includes('Permission denied')) {
        sendErrorResponse(res, error.message, 403);
      } else {
        sendInternalServerError(res, 'Failed to remove member from project');
      }
    }
  }

  /**
   * Get project members
   * GET /api/projects/:id/members
   */
  async getProjectMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: projectId } = req.params;
      const members = await projectsService.getProjectMembers(projectId);

      sendSuccessResponse(res, {
        members,
        total: members.length
      }, 'Project members retrieved successfully');
    } catch (error: any) {
      logger.error('Get project members failed', {
        error: error.message,
        projectId: req.params.id
      });

      sendInternalServerError(res, 'Failed to retrieve project members');
    }
  }

  /**
   * Update member role
   * PUT /api/projects/:id/members/:userId/role
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        sendBadRequestResponse(res, 'Validation failed', errors.array());
        return;
      }

      const { id: projectId, userId } = req.params;
      const { role } = req.body;
      const updatedBy = req.user.id;

      const member = await projectsService.updateMemberRole(projectId, userId, role, updatedBy);

      logger.info('Project member role updated', {
        projectId,
        userId,
        newRole: role,
        updatedBy
      });

      sendSuccessResponse(res, member, 'Member role updated successfully');
    } catch (error: any) {
      logger.error('Update member role failed', {
        error: error.message,
        projectId: req.params.id,
        userId: req.params.userId,
        updatedBy: req.user?.id
      });

      if (error.message.includes('Permission denied')) {
        sendErrorResponse(res, error.message, 403);
      } else {
        sendInternalServerError(res, 'Failed to update member role');
      }
    }
  }

  /**
   * Get user's projects
   * GET /api/projects/user/:userId
   */
  async getUserProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      // Users can only see their own projects unless they're admin
      if (userId !== req.user.id && req.user.role !== 'ADMIN') {
        sendErrorResponse(res, 'Permission denied: Can only view your own projects', 403);
        return;
      }

      const projects = await projectsService.getUserProjects(userId);

      sendSuccessResponse(res, {
        projects,
        total: projects.length
      }, 'User projects retrieved successfully');
    } catch (error: any) {
      logger.error('Get user projects failed', {
        error: error.message,
        userId: req.params.userId,
        requestedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to retrieve user projects');
    }
  }

  /**
   * Get current user's projects
   * GET /api/projects/my
   */
  async getMyProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user.id;
      const projects = await projectsService.getUserProjects(userId);

      sendSuccessResponse(res, {
        projects,
        total: projects.length
      }, 'Your projects retrieved successfully');
    } catch (error: any) {
      logger.error('Get my projects failed', {
        error: error.message,
        userId: req.user?.id
      });

      sendInternalServerError(res, 'Failed to retrieve your projects');
    }
  }
}

// Export singleton instance
export const projectsController = new ProjectsController(); 