import { User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreateUserData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
  bio?: string;
  expertiseAreas?: string[];
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  bio?: string;
  expertiseAreas?: string[];
  profilePicture?: string;
  isActive?: boolean;
  lastLoginAt?: Date;
}

export interface FindUsersOptions {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Users Repository
 * Handles all database operations related to users
 */
export class UsersRepository extends BaseRepository {
  /**
   * Create a new user
   */
  async create(data: CreateUserData): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          role: data.role as any || 'CONTRIBUTOR',
          bio: data.bio,
          expertiseAreas: JSON.stringify(data.expertiseAreas || []),
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'create user');
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (user && user.expertiseAreas) {
        // Parse JSON expertiseAreas for consistency
        return {
          ...user,
          expertiseAreas: user.expertiseAreas,
        };
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error, 'find user by id');
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user && user.expertiseAreas) {
        return {
          ...user,
          expertiseAreas: user.expertiseAreas,
        };
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error, 'find user by email');
    }
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username },
      });

      if (user && user.expertiseAreas) {
        return {
          ...user,
          expertiseAreas: user.expertiseAreas,
        };
      }

      return user;
    } catch (error) {
      this.handlePrismaError(error, 'find user by username');
    }
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          expertiseAreas: data.expertiseAreas ? JSON.stringify(data.expertiseAreas) : undefined,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'update user');
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'update last login');
    }
  }

  /**
   * Find users with search and filtering
   */
  async findMany(options: FindUsersOptions = {}) {
    try {
      const { skip, take, page, limit } = this.buildPagination(options.page, options.limit);

      // Build where conditions
      const where: Prisma.UserWhereInput = {};

      if (options.search) {
        const searchConditions = this.buildSearchConditions(
          options.search,
          ['firstName', 'lastName', 'email', 'username', 'bio']
        );
        if (searchConditions) {
          where.OR = searchConditions;
        }
      }

      if (options.role) {
        where.role = options.role as any;
      }

      if (options.isActive !== undefined) {
        where.isActive = options.isActive;
      }

      // Execute queries in parallel
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true,
            profilePicture: true,
            bio: true,
            expertiseAreas: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            // Exclude password from selection
          },
        }),
        this.prisma.user.count({ where }),
      ]);

      const pagination = this.calculatePagination(total, page, limit);

      return {
        users: users.map(user => ({
          ...user,
          expertiseAreas: user.expertiseAreas || '[]',
        })),
        pagination,
      };
    } catch (error) {
      this.handlePrismaError(error, 'find users');
    }
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async softDelete(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'soft delete user');
    }
  }

  /**
   * Hard delete user (use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error, 'hard delete user');
    }
  }

  /**
   * Count users by role
   */
  async countByRole(): Promise<Record<string, number>> {
    try {
      const counts = await this.prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
        where: { isActive: true },
      });

      return counts.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      this.handlePrismaError(error, 'count users by role');
    }
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    try {
      const where: Prisma.UserWhereInput = { email };
      
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const user = await this.prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      this.handlePrismaError(error, 'check email exists');
    }
  }

  /**
   * Check if username exists
   */
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      const where: Prisma.UserWhereInput = { username };
      
      if (excludeId) {
        where.NOT = { id: excludeId };
      }

      const user = await this.prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      this.handlePrismaError(error, 'check username exists');
    }
  }
} 