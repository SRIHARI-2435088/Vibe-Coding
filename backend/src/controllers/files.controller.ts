import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { filesService, UploadedFile } from '../services/files.service';
import { 
  sendSuccessResponse, 
  sendErrorResponse, 
  sendNotFoundResponse,
  sendBadRequestResponse,
  sendInternalServerError
} from '../utils/response.utils';
import { logger } from '../utils/logger.utils';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/temp');
    
    // Ensure temp directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp and random string to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = path.extname(file.originalname);
    cb(null, 'temp_' + uniqueSuffix + fileExtension);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 5 // Maximum 5 files at once
  },
  fileFilter: (req, file, cb) => {
    // Basic file type validation (more detailed validation in service)
    const allowedMimes = [
      'image/', 'video/', 'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats', 'text/', 'application/zip',
      'application/x-rar', 'application/x-7z', 'application/json'
    ];
    
    const isAllowed = allowedMimes.some(type => file.mimetype.startsWith(type) || file.mimetype.includes(type));
    
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not supported`));
    }
  }
});

/**
 * Files Controller
 * Handles HTTP requests for file operations
 */
export class FilesController {
  /**
   * Upload single file
   * POST /api/files/upload
   */
  async uploadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uploadSingle = upload.single('file');
      
      uploadSingle(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              sendBadRequestResponse(res, 'File size exceeds maximum allowed size of 100MB');
              return;
            }
            sendBadRequestResponse(res, `Upload error: ${err.message}`);
            return;
          }
          sendBadRequestResponse(res, err.message);
          return;
        }

        if (!req.file) {
          sendBadRequestResponse(res, 'No file uploaded');
          return;
        }

        try {
          const knowledgeItemId = req.body.knowledgeItemId;
          const file = req.file as UploadedFile;
          
          const fileAttachment = await filesService.processUploadedFile(file, knowledgeItemId);

          logger.info('File uploaded successfully', {
            fileId: fileAttachment.id,
            originalName: fileAttachment.originalName,
            fileSize: fileAttachment.fileSize,
            uploadedBy: req.user?.id,
            knowledgeItemId
          });

          sendSuccessResponse(res, fileAttachment, 'File uploaded successfully', 201);
        } catch (error: any) {
          logger.error('File upload processing failed', {
            error: error.message,
            fileName: req.file?.originalname,
            uploadedBy: req.user?.id
          });

          sendBadRequestResponse(res, error.message);
        }
      });
    } catch (error: any) {
      logger.error('File upload failed', {
        error: error.message,
        uploadedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   * POST /api/files/upload-multiple
   */
  async uploadMultipleFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uploadMultiple = upload.array('files', 5);
      
      uploadMultiple(req, res, async (err) => {
        if (err) {
          if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
              sendBadRequestResponse(res, 'One or more files exceed maximum allowed size of 100MB');
              return;
            }
            if (err.code === 'LIMIT_FILE_COUNT') {
              sendBadRequestResponse(res, 'Too many files. Maximum 5 files allowed');
              return;
            }
            sendBadRequestResponse(res, `Upload error: ${err.message}`);
            return;
          }
          sendBadRequestResponse(res, err.message);
          return;
        }

        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          sendBadRequestResponse(res, 'No files uploaded');
          return;
        }

        try {
          const knowledgeItemId = req.body.knowledgeItemId;
          const files = req.files as UploadedFile[];
          
          const uploadedFiles = [];
          const errors = [];

          for (let i = 0; i < files.length; i++) {
            try {
              const fileAttachment = await filesService.processUploadedFile(files[i], knowledgeItemId);
              uploadedFiles.push(fileAttachment);
            } catch (error: any) {
              errors.push({
                fileName: files[i].originalname,
                error: error.message
              });
            }
          }

          logger.info('Multiple files upload completed', {
            totalFiles: files.length,
            successfulUploads: uploadedFiles.length,
            errors: errors.length,
            uploadedBy: req.user?.id,
            knowledgeItemId
          });

          sendSuccessResponse(res, {
            uploadedFiles,
            errors,
            summary: {
              total: files.length,
              successful: uploadedFiles.length,
              failed: errors.length
            }
          }, 'File upload completed', 201);
        } catch (error: any) {
          logger.error('Multiple file upload processing failed', {
            error: error.message,
            uploadedBy: req.user?.id
          });

          sendInternalServerError(res, 'Failed to process uploaded files');
        }
      });
    } catch (error: any) {
      logger.error('Multiple file upload failed', {
        error: error.message,
        uploadedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to upload files');
    }
  }

  /**
   * Get file by ID
   * GET /api/files/:id
   */
  async getFileById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = await filesService.getFileById(id);

      if (!file) {
        sendNotFoundResponse(res, 'File not found');
        return;
      }

      sendSuccessResponse(res, file, 'File retrieved successfully');
    } catch (error: any) {
      logger.error('Get file by ID failed', {
        error: error.message,
        fileId: req.params.id
      });

      sendInternalServerError(res, 'Failed to retrieve file');
    }
  }

  /**
   * Download file
   * GET /api/files/:id/download
   */
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = await filesService.getFileById(id);

      if (!file) {
        sendNotFoundResponse(res, 'File not found');
        return;
      }

      if (!filesService.fileExists(file.filename)) {
        sendNotFoundResponse(res, 'File not found on disk');
        return;
      }

      const filePath = filesService.getFileDownloadPath(file.filename);
      
      // Set appropriate headers
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Length', file.fileSize.toString());

      logger.info('File download', {
        fileId: id,
        fileName: file.originalName,
        downloadedBy: req.user?.id
      });

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('File download failed', {
        error: error.message,
        fileId: req.params.id,
        downloadedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to download file');
    }
  }

  /**
   * Get file preview (for images)
   * GET /api/files/:id/preview
   */
  async getFilePreview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const file = await filesService.getFileById(id);

      if (!file) {
        sendNotFoundResponse(res, 'File not found');
        return;
      }

      // Only allow preview for images
      if (!file.mimeType.startsWith('image/')) {
        sendBadRequestResponse(res, 'Preview only available for images');
        return;
      }

      if (!filesService.fileExists(file.filename)) {
        sendNotFoundResponse(res, 'File not found on disk');
        return;
      }

      const filePath = filesService.getFileDownloadPath(file.filename);
      
      // Set appropriate headers for image display
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

      // Stream the image
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error: any) {
      logger.error('File preview failed', {
        error: error.message,
        fileId: req.params.id
      });

      sendInternalServerError(res, 'Failed to load file preview');
    }
  }

  /**
   * Get files with filtering
   * GET /api/files
   */
  async getFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { type, category, uploadedBy, projectId, limit = 50, offset = 0 } = req.query;
      
      const filters = {
        type: type as string,
        category: category as string,
        uploadedBy: uploadedBy as string,
        projectId: projectId as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      };

      const files = await filesService.getFiles(filters);

      sendSuccessResponse(res, { files }, 'Files retrieved successfully');
    } catch (error: any) {
      logger.error('Failed to get files', {
        error: error.message,
        userId: req.user?.id
      });

      sendInternalServerError(res, 'Failed to retrieve files');
    }
  }

  /**
   * Update file metadata
   * PUT /api/files/:id/metadata
   */
  async updateFileMetadata(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, category, tags, isPublic, projectId } = req.body;

      const updatedFile = await filesService.updateFileMetadata(id, {
        title,
        description,
        category,
        tags,
        isPublic,
        projectId
      });

      if (!updatedFile) {
        sendNotFoundResponse(res, 'File not found');
        return;
      }

      logger.info('File metadata updated', {
        fileId: id,
        updatedBy: req.user?.id
      });

      sendSuccessResponse(res, updatedFile, 'File metadata updated successfully');
    } catch (error: any) {
      logger.error('Failed to update file metadata', {
        error: error.message,
        fileId: req.params.id,
        userId: req.user?.id
      });

      sendInternalServerError(res, 'Failed to update file metadata');
    }
  }

  /**
   * Delete file
   * DELETE /api/files/:id
   */
  async deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await filesService.deleteFile(id);

      if (!result) {
        sendNotFoundResponse(res, 'File not found');
        return;
      }

      logger.info('File deleted', {
        fileId: id,
        deletedBy: req.user?.id
      });

      sendSuccessResponse(res, { deleted: true }, 'File deleted successfully');
    } catch (error: any) {
      logger.error('File deletion failed', {
        error: error.message,
        fileId: req.params.id,
        deletedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to delete file');
    }
  }

  /**
   * Get knowledge item attachments
   * GET /api/files/knowledge/:knowledgeItemId
   */
  async getKnowledgeAttachments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { knowledgeItemId } = req.params;
      const attachments = await filesService.getKnowledgeAttachments(knowledgeItemId);

      sendSuccessResponse(res, {
        attachments,
        total: attachments.length
      }, 'Knowledge attachments retrieved successfully');
    } catch (error: any) {
      logger.error('Get knowledge attachments failed', {
        error: error.message,
        knowledgeItemId: req.params.knowledgeItemId
      });

      sendInternalServerError(res, 'Failed to retrieve knowledge attachments');
    }
  }

  /**
   * Attach file to knowledge item
   * POST /api/files/:id/attach
   */
  async attachToKnowledgeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { knowledgeItemId } = req.body;

      if (!knowledgeItemId) {
        sendBadRequestResponse(res, 'Knowledge item ID is required');
        return;
      }

      await filesService.attachToKnowledgeItem(id, knowledgeItemId);

      logger.info('File attached to knowledge item', {
        fileId: id,
        knowledgeItemId,
        attachedBy: req.user?.id
      });

      sendSuccessResponse(res, { attached: true }, 'File attached to knowledge item successfully');
    } catch (error: any) {
      logger.error('Attach file to knowledge item failed', {
        error: error.message,
        fileId: req.params.id,
        knowledgeItemId: req.body.knowledgeItemId,
        attachedBy: req.user?.id
      });

      sendInternalServerError(res, 'Failed to attach file to knowledge item');
    }
  }
}

// Export singleton instance
export const filesController = new FilesController(); 