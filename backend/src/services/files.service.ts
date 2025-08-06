import fs from 'fs';
import path from 'path';
import { simpleDb } from '../config/simple-db';

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export interface FileAttachment {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  isVideo: boolean;
  videoDuration?: number;
  thumbnailPath?: string;
  knowledgeItemId?: string;
  uploadedAt: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

/**
 * Files Service
 * Handles file upload, storage, and management operations
 */
export class FilesService {
  private readonly uploadsDir = path.join(__dirname, '../../uploads');
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly allowedMimeTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // Videos
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
    // Documents
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'application/json',
    // Archives
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
  ];

  constructor() {
    this.ensureUploadsDirectoryExists();
  }

  /**
   * Ensure uploads directory exists
   */
  private ensureUploadsDirectoryExists(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Validate uploaded file
   */
  validateFile(file: UploadedFile): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(this.maxFileSize)}`
      };
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `File type ${file.mimetype} is not supported`
      };
    }

    return { isValid: true };
  }

  /**
   * Process uploaded file and save to database
   */
  async processUploadedFile(file: UploadedFile, knowledgeItemId?: string): Promise<FileAttachment> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generate unique filename to avoid conflicts
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${generateId()}${fileExtension}`;
      const finalPath = path.join(this.uploadsDir, uniqueFilename);

      // Move file to final location
      if (file.path !== finalPath) {
        fs.renameSync(file.path, finalPath);
      }

      // Create file attachment record
      const fileAttachment: FileAttachment = {
        id: generateId(),
        filename: uniqueFilename,
        originalName: file.originalname,
        fileType: fileExtension.toLowerCase(),
        fileSize: file.size,
        filePath: finalPath,
        mimeType: file.mimetype,
        isVideo: file.mimetype.startsWith('video/'),
        knowledgeItemId: knowledgeItemId || null,
        uploadedAt: new Date().toISOString()
      };

      // Save to database
      const result = await simpleDb.createAttachment(fileAttachment);
      
      return {
        ...fileAttachment,
        id: result.id
      };
    } catch (error) {
      // Clean up file if something went wrong
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  /**
   * Get file attachment by ID
   */
  async getFileById(id: string): Promise<FileAttachment | null> {
    try {
      const file = await simpleDb.findAttachmentById(id);
      return file;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      throw error;
    }
  }

  /**
   * Get attachments for knowledge item
   */
  async getKnowledgeAttachments(knowledgeItemId: string): Promise<FileAttachment[]> {
    try {
      const attachments = await simpleDb.getKnowledgeAttachments(knowledgeItemId);
      return attachments;
    } catch (error) {
      console.error('Error getting knowledge attachments:', error);
      throw error;
    }
  }

  /**
   * Delete file attachment
   */
  async deleteFile(id: string): Promise<boolean> {
    try {
      const file = await this.getFileById(id);
      if (!file) {
        return false;
      }

      // Delete file from filesystem
      if (fs.existsSync(file.filePath)) {
        fs.unlinkSync(file.filePath);
      }

      // Delete thumbnail if exists
      if (file.thumbnailPath && fs.existsSync(file.thumbnailPath)) {
        fs.unlinkSync(file.thumbnailPath);
      }

      // Delete from database
      const result = await simpleDb.deleteAttachment(id);
      return result;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Attach file to knowledge item
   */
  async attachToKnowledgeItem(fileId: string, knowledgeItemId: string): Promise<void> {
    try {
      await simpleDb.updateAttachmentKnowledgeItem(fileId, knowledgeItemId);
    } catch (error) {
      console.error('Error attaching file to knowledge item:', error);
      throw error;
    }
  }

  /**
   * Get file download path
   */
  getFileDownloadPath(filename: string): string {
    return path.join(this.uploadsDir, filename);
  }

  /**
   * Check if file exists
   */
  fileExists(filename: string): boolean {
    const filePath = path.join(this.uploadsDir, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file category based on MIME type
   */
  getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'archive' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('csv')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'other';
  }

  /**
   * Get file icon based on MIME type
   */
  getFileIcon(mimeType: string): string {
    const category = this.getFileCategory(mimeType);
    
    switch (category) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'archive': return '📦';
      default: return '📁';
    }
  }

  /**
   * Clean up orphaned files (files not attached to any knowledge item)
   */
  async cleanupOrphanedFiles(): Promise<number> {
    try {
      const orphanedFiles = await simpleDb.getOrphanedAttachments();
      let deletedCount = 0;

      for (const file of orphanedFiles) {
        const success = await this.deleteFile(file.id);
        if (success) {
          deletedCount++;
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up orphaned files:', error);
      throw error;
    }
  }

  /**
   * Get files with filtering
   */
  async getFiles(filters: {
    type?: string;
    category?: string;
    uploadedBy?: string;
    projectId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    try {
      // For now, return mock data - this would need to be implemented with proper database queries
      // In a real implementation, this would query the files table with the given filters
      return [];
    } catch (error) {
      console.error('Error getting files:', error);
      throw error;
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(fileId: string, metadata: {
    title?: string;
    description?: string;
    category?: string;
    tags?: string;
    isPublic?: boolean;
    projectId?: string;
  }): Promise<any> {
    try {
      // For now, return mock data - this would need to be implemented with proper database updates
      // In a real implementation, this would update the file record in the database
      return { id: fileId, ...metadata };
    } catch (error) {
      console.error('Error updating file metadata:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const filesService = new FilesService(); 