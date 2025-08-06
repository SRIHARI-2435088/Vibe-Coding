import { Router } from 'express';
import { body, param } from 'express-validator';
import { filesController } from '../controllers/files.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Parameter validation
const idValidation = [
  param('id')
    .notEmpty()
    .withMessage('File ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid file ID format')
];

const knowledgeItemIdValidation = [
  param('knowledgeItemId')
    .notEmpty()
    .withMessage('Knowledge Item ID is required')
    .isLength({ min: 1 })
    .withMessage('Invalid knowledge item ID format')
];

// Body validation for attaching files
const attachValidation = [
  body('knowledgeItemId')
    .notEmpty()
    .withMessage('Knowledge item ID is required')
];

// ===== FILE ROUTES =====

/**
 * @route POST /api/files/upload
 * @description Upload a single file
 * @access Private
 */
router.post(
  '/upload',
  authMiddleware,
  filesController.uploadFile.bind(filesController)
);

/**
 * @route POST /api/files/upload-multiple
 * @description Upload multiple files
 * @access Private
 */
router.post(
  '/upload-multiple',
  authMiddleware,
  filesController.uploadMultipleFiles.bind(filesController)
);

/**
 * @route GET /api/files/:id
 * @description Get file information by ID
 * @access Private
 */
router.get(
  '/:id',
  authMiddleware,
  idValidation,
  filesController.getFileById.bind(filesController)
);

/**
 * @route GET /api/files/:id/download
 * @description Download file by ID
 * @access Private
 */
router.get(
  '/:id/download',
  authMiddleware,
  idValidation,
  filesController.downloadFile.bind(filesController)
);

/**
 * @route GET /api/files/:id/preview
 * @description Get file preview (for images)
 * @access Private
 */
router.get(
  '/:id/preview',
  authMiddleware,
  idValidation,
  filesController.getFilePreview.bind(filesController)
);

/**
 * @route GET /api/files
 * @description Get files with filtering
 * @access Private
 */
router.get(
  '/',
  authMiddleware,
  filesController.getFiles.bind(filesController)
);

/**
 * @route PUT /api/files/:id/metadata
 * @description Update file metadata
 * @access Private
 */
router.put(
  '/:id/metadata',
  authMiddleware,
  idValidation,
  filesController.updateFileMetadata.bind(filesController)
);

/**
 * @route DELETE /api/files/:id
 * @description Delete file by ID
 * @access Private
 */
router.delete(
  '/:id',
  authMiddleware,
  idValidation,
  filesController.deleteFile.bind(filesController)
);

/**
 * @route POST /api/files/:id/attach
 * @description Attach file to knowledge item
 * @access Private
 */
router.post(
  '/:id/attach',
  authMiddleware,
  idValidation,
  attachValidation,
  filesController.attachToKnowledgeItem.bind(filesController)
);

/**
 * @route GET /api/files/knowledge/:knowledgeItemId
 * @description Get all attachments for a knowledge item
 * @access Private
 */
router.get(
  '/knowledge/:knowledgeItemId',
  authMiddleware,
  knowledgeItemIdValidation,
  filesController.getKnowledgeAttachments.bind(filesController)
);

export default router; 