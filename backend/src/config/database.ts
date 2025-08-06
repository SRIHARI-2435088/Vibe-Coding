import sqlite3 from 'sqlite3';
import path from 'path';
import { logger } from '../utils/logger.utils';

const DATABASE_PATH = path.join(__dirname, '../../dev.db');

// Initialize SQLite database
export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH, (err) => {
      if (err) {
        logger.error('Error connecting to SQLite database:', err);
      } else {
        logger.info('Connected to SQLite database successfully');
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'CONTRIBUTOR',
        profilePicture TEXT,
        bio TEXT,
        expertiseAreas TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME
      )
    `;

    // Create projects table
    const createProjectsTable = `
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'ACTIVE',
        startDate DATETIME,
        endDate DATETIME,
        clientName TEXT,
        technology TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create knowledge_items table
    const createKnowledgeTable = `
      CREATE TABLE IF NOT EXISTS knowledge_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        difficulty TEXT DEFAULT 'INTERMEDIATE',
        status TEXT DEFAULT 'DRAFT',
        isPublic INTEGER DEFAULT 0,
        viewCount INTEGER DEFAULT 0,
        authorId TEXT NOT NULL,
        projectId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        publishedAt DATETIME,
        FOREIGN KEY (authorId) REFERENCES users(id),
        FOREIGN KEY (projectId) REFERENCES projects(id)
      )
    `;

    // Execute table creation
    this.db.serialize(() => {
      this.db.run(createUsersTable, (err) => {
        if (err) logger.error('Error creating users table:', err);
        else logger.info('Users table ready');
      });

      this.db.run(createProjectsTable, (err) => {
        if (err) logger.error('Error creating projects table:', err);
        else logger.info('Projects table ready');
      });

      this.db.run(createKnowledgeTable, (err) => {
        if (err) logger.error('Error creating knowledge_items table:', err);
        else logger.info('Knowledge items table ready');
      });
    });
  }

  // User operations
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

  async findUserByEmail(email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE email = ?';
      
      this.db.get(sql, [email], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Parse JSON fields
            row.expertiseAreas = row.expertiseAreas ? JSON.parse(row.expertiseAreas) : [];
          }
          resolve(row);
        }
      });
    });
  }

  async updateUserLastLogin(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?';
      
      this.db.run(sql, [userId], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async findUserById(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE id = ?';
      
      this.db.get(sql, [userId], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Parse JSON fields
            row.expertiseAreas = row.expertiseAreas ? JSON.parse(row.expertiseAreas) : [];
          }
          resolve(row);
        }
      });
    });
  }

  // Project operations
  async createProject(projectData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, name, description, status, technology } = projectData;
      
      const sql = `
        INSERT INTO projects (id, name, description, status, technology)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, name, description, status, JSON.stringify(technology)], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: projectData.id });
        }
      });
    });
  }

  async findProjectsByUserId(userId: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // For now, return all projects (would need project_members table for proper filtering)
      const sql = 'SELECT * FROM projects WHERE status = "ACTIVE"';
      
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

  // Knowledge operations
  async createKnowledgeItem(knowledgeData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const { id, title, description, content, type, category, tags, authorId, projectId } = knowledgeData;
      
      const sql = `
        INSERT INTO knowledge_items (id, title, description, content, type, category, tags, authorId, projectId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [id, title, description, content, type, category, JSON.stringify(tags), authorId, projectId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: knowledgeData.id });
        }
      });
    });
  }

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

  // Additional Knowledge operations for the service layer
  async updateKnowledgeItem(id: string, updateData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (updateData.title !== undefined) {
        fields.push('title = ?');
        values.push(updateData.title);
      }
      if (updateData.description !== undefined) {
        fields.push('description = ?');
        values.push(updateData.description);
      }
      if (updateData.content !== undefined) {
        fields.push('content = ?');
        values.push(updateData.content);
      }
      if (updateData.type !== undefined) {
        fields.push('type = ?');
        values.push(updateData.type);
      }
      if (updateData.category !== undefined) {
        fields.push('category = ?');
        values.push(updateData.category);
      }
      if (updateData.tags !== undefined) {
        fields.push('tags = ?');
        values.push(JSON.stringify(updateData.tags));
      }
      if (updateData.difficulty !== undefined) {
        fields.push('difficulty = ?');
        values.push(updateData.difficulty);
      }
      if (updateData.status !== undefined) {
        fields.push('status = ?');
        values.push(updateData.status);
      }
      if (updateData.isPublic !== undefined) {
        fields.push('isPublic = ?');
        values.push(updateData.isPublic ? 1 : 0);
      }
      if (updateData.publishedAt !== undefined) {
        fields.push('publishedAt = ?');
        values.push(updateData.publishedAt);
      }
      
      // Always update the updatedAt timestamp
      fields.push('updatedAt = ?');
      values.push(new Date().toISOString());
      
      values.push(id); // For WHERE clause
      
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

  async deleteKnowledgeItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM knowledge_items WHERE id = ?';
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async countKnowledgeItems(options: any): Promise<number> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT COUNT(*) as count FROM knowledge_items k WHERE 1=1';
      const params: any[] = [];

      if (options.projectId) {
        sql += ' AND k.projectId = ?';
        params.push(options.projectId);
      }

      if (options.search) {
        sql += ' AND (k.title LIKE ? OR k.content LIKE ?)';
        params.push(`%${options.search}%`, `%${options.search}%`);
      }

      if (options.type) {
        sql += ' AND k.type = ?';
        params.push(options.type);
      }

      if (options.authorId) {
        sql += ' AND k.authorId = ?';
        params.push(options.authorId);
      }

      if (options.status) {
        sql += ' AND k.status = ?';
        params.push(options.status);
      }

      if (options.isPublic !== undefined) {
        sql += ' AND k.isPublic = ?';
        params.push(options.isPublic ? 1 : 0);
      }

      this.db.get(sql, params, (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  async incrementViewCount(id: string): Promise<void> {
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

  close() {
    this.db.close((err) => {
      if (err) {
        logger.error('Error closing database:', err);
      } else {
        logger.info('Database connection closed');
      }
    });
  }
}

// Export singleton instance
export const database = new Database(); 