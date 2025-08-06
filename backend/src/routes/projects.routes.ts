import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { projectsController } from '../controllers/projects.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { ProjectStatus, ProjectRole } from '../types/projects.types';

const router = Router();

// Validation middleware for creating projects
const createProjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Invalid project status'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  
  body('clientName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Client name must be less than 100 characters'),
  
  body('technology')
    .optional()
    .isArray()
    .withMessage('Technology must be an array')
];

// Validation middleware for updating projects
const updateProjectValidation = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage('Invalid project status'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  
  body('clientName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Client name must be less than 100 characters'),
  
  body('technology')
    .optional()
    .isArray()
    .withMessage('Technology must be an array')
];

// Validation middleware for adding members
const addMemberValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  
  body('role')
    .optional()
    .isIn(Object.values(ProjectRole))
    .withMessage('Invalid project role')
];

// Validation middleware for updating member role
const updateMemberRoleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(ProjectRole))
    .withMessage('Invalid project role')
];

// Parameter validation
const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid project ID format')
];

const userIdValidation = [
  param('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid user ID format')
];

// ===== PROJECT ROUTES =====

/**
 * @route GET /api/projects/my
 * @description Get current user's projects
 * @access Private
 */
router.get(
  '/my',
  authMiddleware,
  projectsController.getMyProjects.bind(projectsController)
);

/**
 * @route GET /api/projects/user/:userId
 * @description Get projects for specific user
 * @access Private (Admin or self only)
 */
router.get(
  '/user/:userId',
  authMiddleware,
  userIdValidation,
  projectsController.getUserProjects.bind(projectsController)
);

/**
 * @route GET /api/projects
 * @description Get all projects
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  projectsController.getAllProjects.bind(projectsController)
);

/**
 * @route POST /api/projects
 * @description Create a new project
 * @access Private
 */
router.post(
  '/',
  authMiddleware,
  createProjectValidation,
  projectsController.createProject.bind(projectsController)
);

/**
 * @route GET /api/projects/:id
 * @description Get a specific project by ID
 * @access Private
 */
router.get(
  '/:id',
  authMiddleware,
  idValidation,
  projectsController.getProjectById.bind(projectsController)
);

/**
 * @route PUT /api/projects/:id
 * @description Update a project
 * @access Private (Project lead only)
 */
router.put(
  '/:id',
  authMiddleware,
  idValidation,
  updateProjectValidation,
  projectsController.updateProject.bind(projectsController)
);

/**
 * @route DELETE /api/projects/:id
 * @description Delete a project
 * @access Private (Project lead only)
 */
router.delete(
  '/:id',
  authMiddleware,
  idValidation,
  projectsController.deleteProject.bind(projectsController)
);

// ===== PROJECT MEMBER ROUTES =====

/**
 * @route GET /api/projects/:id/members
 * @description Get project members
 * @access Private
 */
router.get(
  '/:id/members',
  authMiddleware,
  idValidation,
  projectsController.getProjectMembers.bind(projectsController)
);

/**
 * @route POST /api/projects/:id/members
 * @description Add member to project
 * @access Private (Project lead only)
 */
router.post(
  '/:id/members',
  authMiddleware,
  idValidation,
  addMemberValidation,
  projectsController.addProjectMember.bind(projectsController)
);

/**
 * @route DELETE /api/projects/:id/members/:userId
 * @description Remove member from project
 * @access Private (Project lead only)
 */
router.delete(
  '/:id/members/:userId',
  authMiddleware,
  idValidation,
  userIdValidation,
  projectsController.removeProjectMember.bind(projectsController)
);

/**
 * @route PUT /api/projects/:id/members/:userId/role
 * @description Update member role in project
 * @access Private (Project lead only)
 */
router.put(
  '/:id/members/:userId/role',
  authMiddleware,
  idValidation,
  userIdValidation,
  updateMemberRoleValidation,
  projectsController.updateMemberRole.bind(projectsController)
);

export default router; 