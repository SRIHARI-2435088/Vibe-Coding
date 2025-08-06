import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { knowledgeController } from '../controllers/knowledge.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { KnowledgeType, DifficultyLevel, ContentStatus } from '../types/knowledge.types';

const router = Router();

// Validation middleware for creating knowledge items
const createKnowledgeValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  
  body('type')
    .isIn(Object.values(KnowledgeType))
    .withMessage('Invalid knowledge type'),
  
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('difficulty')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage('Invalid difficulty level'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// Validation middleware for updating knowledge items
const updateKnowledgeValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('content')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters long'),
  
  body('type')
    .optional()
    .isIn(Object.values(KnowledgeType))
    .withMessage('Invalid knowledge type'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('category')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Category must be less than 100 characters'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('difficulty')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage('Invalid difficulty level'),
  
  body('status')
    .optional()
    .isIn(Object.values(ContentStatus))
    .withMessage('Invalid status'),
  
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean')
];

// Validation middleware for search queries
const searchQueryValidation = [
  query('search')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Search query must be less than 200 characters'),
  
  query('type')
    .optional()
    .isIn(Object.values(KnowledgeType))
    .withMessage('Invalid knowledge type'),
  
  query('difficulty')
    .optional()
    .isIn(Object.values(DifficultyLevel))
    .withMessage('Invalid difficulty level'),
  
  query('status')
    .optional()
    .isIn(Object.values(ContentStatus))
    .withMessage('Invalid status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title', 'viewCount', 'rating'])
    .withMessage('Invalid sort field'),
  
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Parameter validation
const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid ID format')
];

// ===== KNOWLEDGE ROUTES =====

/**
 * @route GET /api/knowledge/stats
 * @description Get knowledge statistics
 * @access Public
 */
router.get(
  '/stats',
  knowledgeController.getKnowledgeStats.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge/featured
 * @description Get featured/popular knowledge items
 * @access Public
 */
router.get(
  '/featured',
  knowledgeController.getFeaturedKnowledgeItems.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge/search
 * @description Search knowledge items with filtering
 * @access Public
 */
router.get(
  '/search',
  searchQueryValidation,
  knowledgeController.searchKnowledgeItems.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge
 * @description Get knowledge items with search and filtering
 * @access Public
 */
router.get(
  '/',
  searchQueryValidation,
  knowledgeController.getKnowledgeItems.bind(knowledgeController)
);

/**
 * @route POST /api/knowledge
 * @description Create a new knowledge item
 * @access Private (requires authentication)
 */
router.post(
  '/',
  authMiddleware,
  createKnowledgeValidation,
  knowledgeController.createKnowledgeItem.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge/:id
 * @description Get a specific knowledge item by ID
 * @access Public
 */
router.get(
  '/:id',
  idValidation,
  knowledgeController.getKnowledgeItemById.bind(knowledgeController)
);

/**
 * @route PUT /api/knowledge/:id
 * @description Update a knowledge item
 * @access Private (requires authentication and ownership)
 */
router.put(
  '/:id',
  authMiddleware,
  idValidation,
  updateKnowledgeValidation,
  knowledgeController.updateKnowledgeItem.bind(knowledgeController)
);

/**
 * @route DELETE /api/knowledge/:id
 * @description Delete a knowledge item
 * @access Private (requires authentication and ownership)
 */
router.delete(
  '/:id',
  authMiddleware,
  idValidation,
  knowledgeController.deleteKnowledgeItem.bind(knowledgeController)
);

/**
 * @route PUT /api/knowledge/:id/publish
 * @description Publish a knowledge item
 * @access Private (requires authentication and ownership)
 */
router.put(
  '/:id/publish',
  authMiddleware,
  idValidation,
  knowledgeController.publishKnowledgeItem.bind(knowledgeController)
);

/**
 * @route PUT /api/knowledge/:id/archive
 * @description Archive a knowledge item
 * @access Private (requires authentication and ownership)
 */
router.put(
  '/:id/archive',
  authMiddleware,
  idValidation,
  knowledgeController.archiveKnowledgeItem.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge/project/:projectId
 * @description Get knowledge items by project
 * @access Public
 */
router.get(
  '/project/:projectId',
  [
    param('projectId')
      .notEmpty()
      .withMessage('Project ID is required'),
    ...searchQueryValidation
  ],
  knowledgeController.getKnowledgeItemsByProject.bind(knowledgeController)
);

/**
 * @route GET /api/knowledge/author/:authorId
 * @description Get knowledge items by author
 * @access Public
 */
router.get(
  '/author/:authorId',
  [
    param('authorId')
      .notEmpty()
      .withMessage('Author ID is required'),
    ...searchQueryValidation
  ],
  knowledgeController.getKnowledgeItemsByAuthor.bind(knowledgeController)
);

export default router; 