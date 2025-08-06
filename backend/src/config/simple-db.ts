import sqlite3 from 'sqlite3';
import path from 'path';
import { logger } from '../utils/logger.utils';

const DATABASE_PATH = path.join(__dirname, '../../dev.db');

/**
 * Simple Database Adapter
 * Direct SQLite interface until Prisma issues are resolved
 */
export class SimpleDatabase {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        logger.error('Error connecting to SQLite database:', err);
      } else {
        logger.info('Connected to SQLite database successfully');
      }
    });
  }

  // User operations
  async findUserByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async findUserById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async createUser(userData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, email, username, firstName, lastName, password, role, bio, expertiseAreas } = userData;
      
      const sql = `
        INSERT INTO users (id, email, username, firstName, lastName, password, role, bio, expertiseAreas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, email, username, firstName, lastName, password, role, bio, JSON.stringify(expertiseAreas)], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: userData.id });
        }
      });
    });
  }

  async updateUserLastLogin(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET lastLoginAt = ?, updatedAt = ? WHERE id = ?';
      const now = new Date().toISOString();
      
      this.db.run(sql, [now, now, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Knowledge operations
  async findKnowledgeItems(options: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT k.*, u.firstName, u.lastName, u.email as authorEmail, p.name as projectName
        FROM knowledge_items k
        LEFT JOIN users u ON k.authorId = u.id
        LEFT JOIN projects p ON k.projectId = p.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (options.projectId) {
        sql += ' AND k.projectId = ?';
        params.push(options.projectId);
      }

      if (options.search) {
        sql += ' AND (k.title LIKE ? OR k.content LIKE ?)';
        params.push(`%${options.search}%`, `%${options.search}%`);
      }

      sql += ' ORDER BY k.createdAt DESC';

      if (options.limit) {
        sql += ' LIMIT ?';
        params.push(options.limit);
      }

      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const items = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(items);
        }
      });
    });
  }

  async createKnowledgeItem(knowledgeData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { 
        id, title, description, content, type, category, tags, 
        difficulty, status, isPublic, viewCount, authorId, projectId,
        createdAt, updatedAt, publishedAt
      } = knowledgeData;
      
      const sql = `
        INSERT INTO knowledge_items (
          id, title, description, content, type, category, tags, 
          difficulty, status, isPublic, viewCount, authorId, projectId,
          createdAt, updatedAt, publishedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        id, title, description, content, type, category, tags,
        difficulty, status, isPublic, viewCount, authorId, projectId,
        createdAt, updatedAt, publishedAt
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: knowledgeData.id });
        }
      });
    });
  }

  async findKnowledgeById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT k.*, u.firstName, u.lastName, u.email as authorEmail, p.name as projectName
        FROM knowledge_items k
        LEFT JOIN users u ON k.authorId = u.id
        LEFT JOIN projects p ON k.projectId = p.id
        WHERE k.id = ?
      `;
      
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            const item = {
              ...row,
              tags: row.tags ? JSON.parse(row.tags) : []
            };
            resolve(item);
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async getAllKnowledgeItems(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT k.*, u.firstName, u.lastName, u.email as authorEmail, p.name as projectName
        FROM knowledge_items k
        LEFT JOIN users u ON k.authorId = u.id
        LEFT JOIN projects p ON k.projectId = p.id
        ORDER BY k.createdAt DESC
      `;
      
      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const items = rows.map((row: any) => ({
            ...row,
            tags: row.tags ? JSON.parse(row.tags) : []
          }));
          resolve(items);
        }
      });
    });
  }

  async updateKnowledgeItem(id: string, updateData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];
      
      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        resolve({ id });
        return;
      }
      
      values.push(id); // Add id for WHERE clause
      
      const sql = `UPDATE knowledge_items SET ${fields.join(', ')} WHERE id = ?`;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  async deleteKnowledgeItem(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM knowledge_items WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Project operations
  async findProjects(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM projects ORDER BY createdAt DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const projects = rows.map((row: any) => ({
            ...row,
            technology: row.technology ? JSON.parse(row.technology) : []
          }));
          resolve(projects);
        }
      });
    });
  }

  async findProjectById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM projects WHERE id = ?';
      
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            const project = {
              ...row,
              technology: row.technology ? JSON.parse(row.technology) : []
            };
            resolve(project);
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async getAllProjects(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM projects ORDER BY createdAt DESC';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const projects = rows.map((row: any) => ({
            ...row,
            technology: row.technology ? JSON.parse(row.technology) : []
          }));
          resolve(projects);
        }
      });
    });
  }

  async createProject(projectData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, name, description, status, startDate, endDate, clientName, technology, createdAt, updatedAt } = projectData;
      
      const sql = `
        INSERT INTO projects (id, name, description, status, startDate, endDate, clientName, technology, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, name, description, status, startDate, endDate, clientName, technology, createdAt, updatedAt], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: projectData.id });
        }
      });
    });
  }

  async updateProject(id: string, updateData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fields: string[] = [];
      const values: any[] = [];
      
      // Build dynamic update query
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });
      
      if (fields.length === 0) {
        resolve({ id });
        return;
      }
      
      values.push(id); // Add id for WHERE clause
      
      const sql = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, changes: this.changes });
        }
      });
    });
  }

  async deleteProject(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM projects WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Project Member operations
  async createProjectMember(memberData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, userId, projectId, role, joinedAt, leftAt } = memberData;
      
      const sql = `
        INSERT INTO project_members (id, userId, projectId, role, joinedAt, leftAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, userId, projectId, role, joinedAt, leftAt], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: memberData.id });
        }
      });
    });
  }

  async getProjectMembers(projectId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT pm.*, u.firstName, u.lastName, u.email, u.role as userRole
        FROM project_members pm
        LEFT JOIN users u ON pm.userId = u.id
        WHERE pm.projectId = ? AND pm.leftAt IS NULL
        ORDER BY pm.joinedAt ASC
      `;
      
      this.db.all(sql, [projectId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async getUserProjectMembership(projectId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM project_members
        WHERE projectId = ? AND userId = ? AND leftAt IS NULL
      `;
      
      this.db.get(sql, [projectId, userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async getUserProjects(userId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT pm.*, p.name as projectName, p.description as projectDescription, p.status as projectStatus
        FROM project_members pm
        LEFT JOIN projects p ON pm.projectId = p.id
        WHERE pm.userId = ? AND pm.leftAt IS NULL
        ORDER BY pm.joinedAt DESC
      `;
      
      this.db.all(sql, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  async removeProjectMember(projectId: string, userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE project_members 
        SET leftAt = ? 
        WHERE projectId = ? AND userId = ? AND leftAt IS NULL
      `;
      const now = new Date().toISOString();
      
      this.db.run(sql, [now, projectId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async updateProjectMemberRole(projectId: string, userId: string, newRole: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE project_members 
        SET role = ? 
        WHERE projectId = ? AND userId = ? AND leftAt IS NULL
      `;
      
      this.db.run(sql, [newRole, projectId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ projectId, userId, role: newRole, changes: this.changes });
        }
      });
    });
  }

  async getProjectMemberCount(projectId: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT COUNT(*) as count
        FROM project_members
        WHERE projectId = ? AND leftAt IS NULL
      `;
      
      this.db.get(sql, [projectId], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row?.count || 0);
        }
      });
    });
  }

  async incrementKnowledgeViewCount(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE knowledge_items SET viewCount = viewCount + 1 WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // File Attachment operations
  async createAttachment(attachmentData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, filename, originalName, fileType, fileSize, filePath, mimeType, isVideo, videoDuration, thumbnailPath, knowledgeItemId, uploadedAt } = attachmentData;
      
      const sql = `
        INSERT INTO attachments (id, filename, originalName, fileType, fileSize, filePath, mimeType, isVideo, videoDuration, thumbnailPath, knowledgeItemId, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, filename, originalName, fileType, fileSize, filePath, mimeType, isVideo ? 1 : 0, videoDuration, thumbnailPath, knowledgeItemId, uploadedAt], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: attachmentData.id });
        }
      });
    });
  }

  async findAttachmentById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM attachments WHERE id = ?';
      
      this.db.get(sql, [id], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            const attachment = {
              ...row,
              isVideo: Boolean(row.isVideo)
            };
            resolve(attachment);
          } else {
            resolve(null);
          }
        }
      });
    });
  }

  async getKnowledgeAttachments(knowledgeItemId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM attachments
        WHERE knowledgeItemId = ?
        ORDER BY uploadedAt ASC
      `;
      
      this.db.all(sql, [knowledgeItemId], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const attachments = rows.map((row: any) => ({
            ...row,
            isVideo: Boolean(row.isVideo)
          }));
          resolve(attachments);
        }
      });
    });
  }

  async deleteAttachment(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM attachments WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async updateAttachmentKnowledgeItem(fileId: string, knowledgeItemId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE attachments SET knowledgeItemId = ? WHERE id = ?';
      
      this.db.run(sql, [knowledgeItemId, fileId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ fileId, knowledgeItemId, changes: this.changes });
        }
      });
    });
  }

  async getOrphanedAttachments(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM attachments
        WHERE knowledgeItemId IS NULL
        OR knowledgeItemId NOT IN (SELECT id FROM knowledge_items)
        ORDER BY uploadedAt ASC
      `;
      
      this.db.all(sql, [], (err, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const attachments = rows.map((row: any) => ({
            ...row,
            isVideo: Boolean(row.isVideo)
          }));
          resolve(attachments);
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          logger.error('Error closing database:', err);
        } else {
          logger.info('Database connection closed');
        }
        resolve();
      });
    });
  }
}

// Export singleton instance
export const simpleDb = new SimpleDatabase(); 