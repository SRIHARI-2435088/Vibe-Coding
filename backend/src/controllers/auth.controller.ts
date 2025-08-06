import { Request, Response, NextFunction } from 'express';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserProfile, 
  UserRole,
  PasswordUpdateRequest 
} from '../types/auth.types';
import { authService } from '../services/auth.service';
import { activityService } from '../services/activity.service';
import { generateToken } from '../utils/jwt.utils';
import { prismaClient as prisma } from '../config/prisma';
import { 
  sendSuccessResponse, 
  sendValidationError, 
  sendUnauthorizedError, 
  sendInternalServerError, 
  sendCreatedResponse,
  sendNotFoundError,
  sendBadRequestError,
  sendConflictError 
} from '../utils/response.utils';
import { logger } from '../utils/logger.utils';
import { hashPassword, comparePassword } from '../utils/password.utils';

/**
 * Authentication Controller
 * Handles all authentication-related HTTP requests
 */
export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerData: RegisterRequest = req.body;

      // Basic validation
      if (!registerData.email || !registerData.username || !registerData.firstName || 
          !registerData.lastName || !registerData.password) {
        sendValidationError(res, 'All required fields must be provided');
        return;
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(registerData.email)) {
        sendValidationError(res, 'Invalid email format', 'email');
        return;
      }

      // Username validation
      if (registerData.username.length < 3 || registerData.username.length > 20) {
        sendValidationError(res, 'Username must be between 3 and 20 characters', 'username');
        return;
      }

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: registerData.email },
            { username: registerData.username }
          ]
        }
      });

      if (existingUser) {
        if (existingUser.email === registerData.email) {
          sendConflictError(res, 'Email already registered');
          return;
        } else {
          sendConflictError(res, 'Username already taken');
          return;
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(registerData.password);

      // Create user as inactive (pending approval)
      const newUser = await prisma.user.create({
        data: {
          email: registerData.email,
          username: registerData.username,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          password: hashedPassword,
          role: 'CONTRIBUTOR', // Default role
          bio: registerData.bio || '',
          expertiseAreas: JSON.stringify(registerData.expertiseAreas || []),
          isActive: false // Pending approval
        }
      });

      // Log the registration activity
      await activityService.logUserRegistration(newUser.id, newUser.email);

      logger.info('User registered successfully (pending approval)', {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
      });

      sendCreatedResponse(res, {
        message: 'Registration successful! Your account is pending approval by an administrator.',
        userId: newUser.id,
        requiresApproval: true
      }, 'Registration pending approval');
    } catch (error) {
      logger.error('Registration failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body.email,
        username: req.body.username,
      });

      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          sendConflictError(res, error.message);
        } else if (error.message.includes('Password validation failed')) {
          sendValidationError(res, error.message, 'password');
        } else {
          sendBadRequestError(res, error.message);
        }
      } else {
        sendInternalServerError(res, 'Registration failed');
      }
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginData: LoginRequest = req.body;

      // Basic validation
      if (!loginData.email || !loginData.password) {
        sendValidationError(res, 'Email and password are required');
        return;
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: loginData.email }
      });

      if (!user) {
        sendUnauthorizedError(res, 'Invalid credentials');
        return;
      }

      // Check if user is active (approved)
      if (!user.isActive) {
        sendUnauthorizedError(res, 'Account pending approval. Please wait for administrator approval.');
        return;
      }

      // Verify password
      const isPasswordValid = await comparePassword(loginData.password, user.password);
      
      if (!isPasswordValid) {
        sendUnauthorizedError(res, 'Invalid credentials');
        return;
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      // Log login activity
      await activityService.logLogin(user.id, user.email);

      // Generate token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Parse expertise areas safely
      let expertiseAreasArray = [];
      try {
        if (user.expertiseAreas) {
          expertiseAreasArray = JSON.parse(user.expertiseAreas);
        }
      } catch (parseError) {
        expertiseAreasArray = [];
      }

      const authResponse = {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          bio: user.bio,
          profilePicture: user.profilePicture,
          expertiseAreas: expertiseAreasArray,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt
        },
        token,
        expiresIn: '7d'
      };

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
      });

      sendSuccessResponse(res, authResponse, 'Login successful');

    } catch (error) {
      logger.warn('Login failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        email: req.body?.email || 'unknown',
        ip: req.ip,
      });

      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password') || 
            error.message.includes('deactivated')) {
          sendUnauthorizedError(res, error.message);
        } else {
          sendBadRequestError(res, error.message);
        }
      } else {
        sendInternalServerError(res, 'Login failed');
      }
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendUnauthorizedError(res, 'User not authenticated');
        return;
      }

      const userProfile = await authService.getUserProfile(req.user.id);

      sendSuccessResponse(res, userProfile, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      if (error instanceof Error && error.message.includes('not found')) {
        sendNotFoundError(res, 'User');
      } else {
        sendInternalServerError(res, 'Failed to retrieve profile');
      }
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendUnauthorizedError(res, 'User not authenticated');
        return;
      }

      const updateData = req.body;
      
      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.email;
      delete updateData.username;
      delete updateData.role;
      delete updateData.isActive;

      const updatedProfile = await authService.updateProfile(req.user.id, updateData);

      logger.info('User profile updated', {
        userId: req.user.id,
        updatedFields: Object.keys(updateData),
      });

      sendSuccessResponse(res, updatedProfile, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      if (error instanceof Error && error.message.includes('not found')) {
        sendNotFoundError(res, 'User');
      } else {
        sendInternalServerError(res, 'Failed to update profile');
      }
    }
  }

  /**
   * Change user password
   * PUT /api/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendUnauthorizedError(res, 'User not authenticated');
        return;
      }

      const { currentPassword, newPassword }: PasswordUpdateRequest = req.body;

      if (!currentPassword || !newPassword) {
        sendValidationError(res, 'Current password and new password are required');
        return;
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);

      logger.info('User password changed', {
        userId: req.user.id,
      });

      sendSuccessResponse(res, null, 'Password changed successfully');
    } catch (error) {
      logger.error('Change password failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      if (error instanceof Error) {
        if (error.message.includes('Current password is incorrect')) {
          sendUnauthorizedError(res, error.message);
        } else if (error.message.includes('validation failed')) {
          sendValidationError(res, error.message, 'newPassword');
        } else if (error.message.includes('not found')) {
          sendNotFoundError(res, 'User');
        } else {
          sendBadRequestError(res, error.message);
        }
      } else {
        sendInternalServerError(res, 'Failed to change password');
      }
    }
  }

  /**
   * Logout user (client-side token invalidation)
   * POST /api/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        logger.info('User logged out', {
          userId: req.user.id,
        });
      }

      // In a JWT-based system, logout is typically handled client-side
      // by removing the token. However, we can log the action.
      sendSuccessResponse(res, null, 'Logout successful');
    } catch (error) {
      logger.error('Logout failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      sendInternalServerError(res, 'Logout failed');
    }
  }

  /**
   * Refresh authentication token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendUnauthorizedError(res, 'User not authenticated');
        return;
      }

      const userProfile = await authService.getUserProfile(req.user.id);
      
      if (!userProfile) {
        sendUnauthorizedError(res, 'User not found');
        return;
      }

      // Generate new token
      const token = generateToken({
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role
      });

      const authResponse = {
        user: userProfile,
        token,
        expiresIn: '7d'
      };

      sendSuccessResponse(res, authResponse, 'Token refreshed successfully');
    } catch (error) {
      logger.error('Token refresh failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      sendUnauthorizedError(res, 'Token refresh failed');
    }
  }

  /**
   * Validate authentication status
   * GET /api/auth/validate
   */
  async validateAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendUnauthorizedError(res, 'User not authenticated');
        return;
      }

      const userProfile = await authService.validateUser(req.user.id);
      
      if (!userProfile) {
        sendUnauthorizedError(res, 'Invalid user session');
        return;
      }

      sendSuccessResponse(res, userProfile, 'Authentication valid');
    } catch (error) {
      logger.error('Auth validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
      });

      sendUnauthorizedError(res, 'Authentication validation failed');
    }
  }


}

// Export singleton instance
export const authController = new AuthController(); 