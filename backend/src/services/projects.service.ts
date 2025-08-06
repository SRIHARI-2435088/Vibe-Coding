import { 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  Project,
  ProjectMember,
  ProjectStatus
} from '../types/projects.types';
import { simpleDb } from '../config/simple-db';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Projects Service
 * Handles all project-related business logic and database operations
 */
export class ProjectsService {
  /**
   * Create a new project
   */
  async createProject(
    creatorId: string, 
    data: CreateProjectRequest
  ): Promise<any> {
    try {
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Project name is required');
      }

      const projectData = {
        id: generateId(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        status: data.status || 'ACTIVE',
        startDate: data.startDate || new Date().toISOString(),
        endDate: data.endDate || null,
        clientName: data.clientName?.trim() || '',
        technology: JSON.stringify(data.technology || []),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Create the project
      const result = await simpleDb.createProject(projectData);
      
      // Add creator as project lead
      await this.addProjectMember(result.id, creatorId, 'LEAD');

      return result;

    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Get project by ID
   */
  async getProjectById(id: string): Promise<any> {
    try {
      const project = await simpleDb.findProjectById(id);
      if (!project) {
        return null;
      }

      // Get project members
      const members = await this.getProjectMembers(id);

      return {
        ...project,
        technology: project.technology ? JSON.parse(project.technology) : [],
        members
      };
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   */
  async getAllProjects(): Promise<any> {
    try {
      const projects = await simpleDb.getAllProjects();
      
      // Enhanced projects with member count
      const enhancedProjects = await Promise.all(
        projects.map(async (project) => {
          const members = await this.getProjectMembers(project.id);
          return {
            ...project,
            technology: project.technology ? JSON.parse(project.technology) : [],
            memberCount: members.length
          };
        })
      );

      return enhancedProjects;
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Update project
   */
  async updateProject(
    id: string,
    userId: string,
    data: UpdateProjectRequest
  ): Promise<any> {
    try {
      // Check if project exists
      const existingProject = await simpleDb.findProjectById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Check if user has permission (is project lead or admin)
      const userMembership = await this.getUserProjectMembership(id, userId);
      if (!userMembership || userMembership.role !== 'LEAD') {
        throw new Error('Permission denied: Only project leads can update projects');
      }

      const updateData = {
        ...data,
        technology: data.technology ? JSON.stringify(data.technology) : undefined,
        updatedAt: new Date().toISOString()
      };

      const result = await simpleDb.updateProject(id, updateData);
      return this.getProjectById(id); // Return full project with relations
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete project
   */
  async deleteProject(id: string, userId: string): Promise<boolean> {
    try {
      // Check if project exists
      const existingProject = await simpleDb.findProjectById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Check if user has permission (is project lead or admin)
      const userMembership = await this.getUserProjectMembership(id, userId);
      if (!userMembership || userMembership.role !== 'LEAD') {
        throw new Error('Permission denied: Only project leads can delete projects');
      }

      const result = await simpleDb.deleteProject(id);
      return result;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Add member to project
   */
  async addProjectMember(
    projectId: string,
    userId: string,
    role: 'LEAD' | 'MEMBER' | 'OBSERVER' = 'MEMBER'
  ): Promise<any> {
    try {
      // Check if project exists
      const project = await simpleDb.findProjectById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Check if user exists
      const user = await simpleDb.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if membership already exists
      const existingMembership = await this.getUserProjectMembership(projectId, userId);
      if (existingMembership) {
        throw new Error('User is already a member of this project');
      }

      const membershipData = {
        id: generateId(),
        userId,
        projectId,
        role,
        joinedAt: new Date().toISOString(),
        leftAt: null
      };

      const result = await simpleDb.createProjectMember(membershipData);
      return result;
    } catch (error) {
      console.error('Error adding project member:', error);
      throw error;
    }
  }

  /**
   * Remove member from project
   */
  async removeProjectMember(
    projectId: string,
    userId: string,
    removedBy: string
  ): Promise<boolean> {
    try {
      // Check if user has permission to remove members
      const removerMembership = await this.getUserProjectMembership(projectId, removedBy);
      if (!removerMembership || removerMembership.role !== 'LEAD') {
        throw new Error('Permission denied: Only project leads can remove members');
      }

      const result = await simpleDb.removeProjectMember(projectId, userId);
      return result;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId: string): Promise<any[]> {
    try {
      const members = await simpleDb.getProjectMembers(projectId);
      
      // Enhanced members with user info
      const enhancedMembers = await Promise.all(
        members.map(async (member) => {
          const user = await simpleDb.findUserById(member.userId);
          return {
            ...member,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role
            } : null
          };
        })
      );

      return enhancedMembers;
    } catch (error) {
      console.error('Error getting project members:', error);
      throw error;
    }
  }

  /**
   * Get user's project membership
   */
  async getUserProjectMembership(projectId: string, userId: string): Promise<any> {
    try {
      const membership = await simpleDb.getUserProjectMembership(projectId, userId);
      return membership;
    } catch (error) {
      console.error('Error getting user project membership:', error);
      throw error;
    }
  }

  /**
   * Get projects for user
   */
  async getUserProjects(userId: string): Promise<any[]> {
    try {
      // Use Prisma to get user's project memberships with project details
      const userProjects = await prisma.projectMember.findMany({
        where: {
          userId: userId,
          leftAt: null
        },
        include: {
          project: {
            include: {
              members: true // To get member count
            }
          }
        },
        orderBy: {
          joinedAt: 'desc'
        }
      });
      
      // Transform to match expected format
      const enhancedProjects = userProjects.map((membership) => {
        const project = membership.project;
        return {
          id: membership.id,
          userId: membership.userId,
          projectId: membership.projectId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          leftAt: membership.leftAt,
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            startDate: project.startDate,
            endDate: project.endDate,
            clientName: project.clientName,
            technology: project.technology ? JSON.parse(project.technology) : [],
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            memberCount: project.members.filter(m => m.leftAt === null).length
          }
        };
      });

      return enhancedProjects;
    } catch (error) {
      console.error('Error getting user projects:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    projectId: string,
    userId: string,
    newRole: 'LEAD' | 'MEMBER' | 'OBSERVER',
    updatedBy: string
  ): Promise<any> {
    try {
      // Check if user has permission to update roles
      const updaterMembership = await this.getUserProjectMembership(projectId, updatedBy);
      if (!updaterMembership || updaterMembership.role !== 'LEAD') {
        throw new Error('Permission denied: Only project leads can update member roles');
      }

      const result = await simpleDb.updateProjectMemberRole(projectId, userId, newRole);
      return result;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const projectsService = new ProjectsService(); 