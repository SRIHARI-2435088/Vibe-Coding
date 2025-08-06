import { Project, ProjectMember, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  clientName?: string;
  technology?: string[];
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  clientName?: string;
  technology?: string[];
}

export interface FindProjectsOptions {
  search?: string;
  status?: string;
  clientName?: string;
  technology?: string;
  userId?: string; // Filter by user membership
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'startDate';
  sortOrder?: 'asc' | 'desc';
}

export interface AddProjectMemberData {
  userId: string;
  projectId: string;
  role?: string;
}

export interface ProjectWithRelations extends Project {
  members: {
    id: string;
    role: string;
    joinedAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      profilePicture?: string;
    };
  }[];
  _count: {
    members: number;
    knowledgeItems: number;
  };
}

/**
 * Projects Repository
 * Handles all database operations related to projects and project membership
 */
export class ProjectsRepository extends BaseRepository {
  /**
   * Create a new project
   */
  async create(data: CreateProjectData): Promise<ProjectWithRelations> {
    try {
      const project = await this.prisma.project.create({
        data: {
          name: data.name,
          description: data.description,
          status: data.status as any || 'ACTIVE',
          startDate: data.startDate,
          endDate: data.endDate,
          clientName: data.clientName,
          technology: JSON.stringify(data.technology || []),
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              knowledgeItems: true,
            },
          },
        },
      });

      return this.formatProject(project);
    } catch (error) {
      this.handlePrismaError(error, 'create project');
    }
  }

  /**
   * Find project by ID
   */
  async findById(id: string): Promise<ProjectWithRelations | null> {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
            orderBy: { joinedAt: 'asc' },
          },
          _count: {
            select: {
              members: true,
              knowledgeItems: true,
            },
          },
        },
      });

      return project ? this.formatProject(project) : null;
    } catch (error) {
      this.handlePrismaError(error, 'find project by id');
    }
  }

  /**
   * Update project
   */
  async update(id: string, data: UpdateProjectData): Promise<ProjectWithRelations> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: new Date(),
      };

      if (data.technology) {
        updateData.technology = JSON.stringify(data.technology);
      }

      const project = await this.prisma.project.update({
        where: { id },
        data: updateData,
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
          _count: {
            select: {
              members: true,
              knowledgeItems: true,
            },
          },
        },
      });

      return this.formatProject(project);
    } catch (error) {
      this.handlePrismaError(error, 'update project');
    }
  }

  /**
   * Delete project
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.project.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, 'delete project');
    }
  }

  /**
   * Find projects with search and filtering
   */
  async findMany(options: FindProjectsOptions = {}) {
    try {
      const { skip, take, page, limit } = this.buildPagination(options.page, options.limit);

      // Build where conditions
      const where: Prisma.ProjectWhereInput = {};

      if (options.search) {
        const searchConditions = this.buildSearchConditions(
          options.search,
          ['name', 'description', 'clientName']
        );
        if (searchConditions) {
          where.OR = searchConditions;
        }
      }

      if (options.status) {
        where.status = options.status as any;
      }

      if (options.clientName) {
        where.clientName = {
          contains: options.clientName,
          mode: 'insensitive',
        };
      }

      if (options.technology) {
        where.technology = {
          contains: options.technology,
        };
      }

      if (options.userId) {
        where.members = {
          some: {
            userId: options.userId,
          },
        };
      }

      // Build order by
      const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
      const sortBy = options.sortBy || 'createdAt';
      const sortOrder = options.sortOrder || 'desc';
      orderBy[sortBy] = sortOrder;

      // Execute queries in parallel
      const [projects, total] = await Promise.all([
        this.prisma.project.findMany({
          where,
          skip,
          take,
          orderBy,
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
              take: 5, // Limit members for list view
            },
            _count: {
              select: {
                members: true,
                knowledgeItems: true,
              },
            },
          },
        }),
        this.prisma.project.count({ where }),
      ]);

      const pagination = this.calculatePagination(total, page, limit);
      const formattedProjects = projects.map(project => this.formatProject(project));

      return {
        projects: formattedProjects,
        pagination,
      };
    } catch (error) {
      this.handlePrismaError(error, 'find projects');
    }
  }

  /**
   * Add member to project
   */
  async addMember(data: AddProjectMemberData): Promise<ProjectMember> {
    try {
      return await this.prisma.projectMember.create({
        data: {
          userId: data.userId,
          projectId: data.projectId,
          role: data.role as any || 'MEMBER',
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'add project member');
    }
  }

  /**
   * Remove member from project
   */
  async removeMember(userId: string, projectId: string): Promise<void> {
    try {
      await this.prisma.projectMember.delete({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'remove project member');
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(userId: string, projectId: string, role: string): Promise<ProjectMember> {
    try {
      return await this.prisma.projectMember.update({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
        data: {
          role: role as any,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'update member role');
    }
  }

  /**
   * Find projects by user
   */
  async findByUser(userId: string, options: Partial<FindProjectsOptions> = {}) {
    return this.findMany({
      ...options,
      userId,
    });
  }

  /**
   * Check if user is member of project
   */
  async isMember(userId: string, projectId: string): Promise<boolean> {
    try {
      const member = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      return !!member;
    } catch (error) {
      this.handlePrismaError(error, 'check project membership');
    }
  }

  /**
   * Get member role in project
   */
  async getMemberRole(userId: string, projectId: string): Promise<string | null> {
    try {
      const member = await this.prisma.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });
      return member?.role || null;
    } catch (error) {
      this.handlePrismaError(error, 'get member role');
    }
  }

  /**
   * Get project statistics
   */
  async getStatistics() {
    try {
      const [
        total,
        active,
        completed,
        byStatus,
      ] = await Promise.all([
        this.prisma.project.count(),
        this.prisma.project.count({
          where: { status: 'ACTIVE' },
        }),
        this.prisma.project.count({
          where: { status: 'COMPLETED' },
        }),
        this.prisma.project.groupBy({
          by: ['status'],
          _count: { status: true },
        }),
      ]);

      return {
        total,
        active,
        completed,
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      this.handlePrismaError(error, 'get project statistics');
    }
  }

  /**
   * Format project with parsed technology
   */
  private formatProject(project: any): ProjectWithRelations {
    return {
      ...project,
      technology: project.technology ? JSON.parse(project.technology) : [],
    };
  }
} 