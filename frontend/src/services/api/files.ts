import { apiClient } from './client';
import { handleApiError } from '@/lib/error-handler';

// File types
export interface FileAttachment {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  mimeType: string;
  category: 'image' | 'video' | 'document' | 'archive' | 'other';
  uploadedBy: string;
  uploadedAt: string;
  knowledgeItemId?: string;
  projectId?: string;
  path: string;
  url: string;
  previewUrl?: string;
  downloadUrl: string;
  metadata?: {
    duration?: number;
    resolution?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    pages?: number;
  };
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface UploadResponse {
  success: boolean;
  file: FileAttachment;
  message: string;
}

export interface FilesListResponse {
  files: FileAttachment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FileUploadOptions {
  projectId?: string;
  knowledgeItemId?: string;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface FileSearchParams {
  search?: string;
  category?: string;
  projectId?: string;
  knowledgeItemId?: string;
  mimeType?: string;
  sortBy?: 'name' | 'size' | 'date' | 'type';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/**
 * Files API Service
 * Handles file upload, download, and management operations
 */
export const filesApi = {
  /**
   * Upload a single file
   */
  async uploadFile(file: File, options: FileUploadOptions = {}): Promise<FileAttachment> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.projectId) formData.append('projectId', options.projectId);
      if (options.knowledgeItemId) formData.append('knowledgeItemId', options.knowledgeItemId);
      if (options.category) formData.append('category', options.category);
      if (options.description) formData.append('description', options.description);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));

      const response = await apiClient.post<UploadResponse>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.file;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw handleApiError(error, 'Failed to upload file');
    }
  },

  /**
   * Upload multiple files
   */
  async uploadFiles(files: File[], options: FileUploadOptions = {}): Promise<FileAttachment[]> {
    try {
      const formData = new FormData();
      
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      if (options.projectId) formData.append('projectId', options.projectId);
      if (options.knowledgeItemId) formData.append('knowledgeItemId', options.knowledgeItemId);
      if (options.category) formData.append('category', options.category);
      if (options.description) formData.append('description', options.description);
      if (options.tags) formData.append('tags', JSON.stringify(options.tags));

      const response = await apiClient.post<{ success: boolean; files: FileAttachment[] }>('/files/upload-multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.files;
    } catch (error) {
      console.error('Failed to upload files:', error);
      throw handleApiError(error, 'Failed to upload files');
    }
  },

  /**
   * Get file by ID
   */
  async getFile(id: string): Promise<FileAttachment> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FileAttachment }>(`/files/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get file:', error);
      throw handleApiError(error, 'Failed to load file');
    }
  },

  /**
   * Search/filter files
   */
  async searchFiles(params: FileSearchParams = {}): Promise<FilesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.projectId) queryParams.append('projectId', params.projectId);
      if (params.knowledgeItemId) queryParams.append('knowledgeItemId', params.knowledgeItemId);
      if (params.mimeType) queryParams.append('mimeType', params.mimeType);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get<{ success: boolean; data: FilesListResponse }>(`/files?${queryParams}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to search files:', error);
      throw handleApiError(error, 'Failed to search files');
    }
  },

  /**
   * Get files by type (e.g., 'video', 'image', 'document')
   */
  async getFilesByType(type: string, params: FileSearchParams = {}): Promise<FilesListResponse> {
    try {
      const mimeTypeMap: Record<string, string[]> = {
        video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'],
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
      };

      const mimeTypes = mimeTypeMap[type] || [];
      
      // For now, return mock data since the backend might not be fully implemented
      if (type === 'video') {
        return {
          files: [], // Mock video files would go here
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0
          }
        };
      }

      return this.searchFiles({
        ...params,
        category: type
      });
    } catch (error) {
      console.error('Failed to get files by type:', error);
      throw handleApiError(error, `Failed to load ${type} files`);
    }
  },

  /**
   * Get files attached to a knowledge item
   */
  async getKnowledgeAttachments(knowledgeItemId: string): Promise<FileAttachment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: FileAttachment[] }>(`/files/knowledge/${knowledgeItemId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get knowledge attachments:', error);
      throw handleApiError(error, 'Failed to load attachments');
    }
  },

  /**
   * Download file
   */
  async downloadFile(id: string): Promise<void> {
    try {
      const response = await apiClient.get(`/files/${id}/download`, {
        responseType: 'blob',
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw handleApiError(error, 'Failed to download file');
    }
  },

  /**
   * Get file preview URL
   */
  getPreviewUrl(id: string): string {
    return `/api/files/${id}/preview`;
  },

  /**
   * Get file download URL
   */
  getDownloadUrl(id: string): string {
    return `/api/files/${id}/download`;
  },

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
  } = {}): Promise<{ files: any[] }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.uploadedBy) queryParams.append('uploadedBy', filters.uploadedBy);
      if (filters.projectId) queryParams.append('projectId', filters.projectId);
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.offset) queryParams.append('offset', filters.offset.toString());

      const response = await apiClient.get<{ success: boolean; data: { files: any[] } }>(`/files?${queryParams}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get files:', error);
      throw handleApiError(error, 'Failed to get files');
    }
  },

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
      const response = await apiClient.put<{ success: boolean; data: any }>(`/files/${fileId}/metadata`, metadata);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update file metadata:', error);
      throw handleApiError(error, 'Failed to update file metadata');
    }
  },

  /**
   * Delete file
   */
  async deleteFile(id: string): Promise<void> {
    try {
      await apiClient.delete(`/files/${id}`);
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw handleApiError(error, 'Failed to delete file');
    }
  },

  /**
   * Increment download count
   */
  async incrementDownloadCount(id: string): Promise<void> {
    try {
      await apiClient.post(`/files/${id}/download-count`);
    } catch (error) {
      console.error('Failed to increment download count:', error);
      // Don't throw error as this is non-critical
    }
  },

  /**
   * Attach file to knowledge item
   */
  async attachToKnowledge(fileId: string, knowledgeItemId: string): Promise<void> {
    try {
      await apiClient.post(`/files/${fileId}/attach`, { knowledgeItemId });
    } catch (error) {
      console.error('Failed to attach file to knowledge item:', error);
      throw handleApiError(error, 'Failed to attach file');
    }
  },

  /**
   * Update file metadata
   */
  async updateFile(id: string, updates: Partial<FileAttachment>): Promise<FileAttachment> {
    try {
      const response = await apiClient.put<{ success: boolean; data: FileAttachment }>(`/files/${id}`, updates);
      return response.data.data;
    } catch (error) {
      console.error('Failed to update file:', error);
      throw handleApiError(error, 'Failed to update file');
    }
  }
};

// Utility functions for file operations
export const fileUtils = {
  /**
   * Format file size in human readable format
   */
  formatFileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Get file category from MIME type
   */
  getCategoryFromMimeType: (mimeType: string): 'image' | 'video' | 'document' | 'archive' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'other';
    if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
    return 'other';
  },

  /**
   * Get file icon based on MIME type
   */
  getFileIcon: (mimeType: string): string => {
    const category = fileUtils.getCategoryFromMimeType(mimeType);
    switch (category) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'document': return '📄';
      case 'archive': return '📦';
      default: return '📁';
    }
  },

  /**
   * Check if file type is supported for preview
   */
  isPreviewSupported: (mimeType: string): boolean => {
    const supportedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'application/pdf',
      'text/plain', 'text/html', 'text/css', 'application/json'
    ];
    return supportedTypes.includes(mimeType);
  },

  /**
   * Validate file before upload
   */
  validateFile: (file: File, maxSize: number = 100 * 1024 * 1024): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${fileUtils.formatFileSize(maxSize)}`
      };
    }

    // Add more validation rules as needed
    return { isValid: true };
  }
}; 