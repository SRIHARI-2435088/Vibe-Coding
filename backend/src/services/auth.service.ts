import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserProfile, 
  UserRole,
    JWTPayload
} from '../types/auth.types';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password.utils';
import { generateToken, generateRefreshToken } from '../utils/jwt.utils';
import { simpleDb } from '../config/simple-db';

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}



/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */
export class AuthService {

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Validate password strength
      const passwordValidation = validatePasswordStrength(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Check if email already exists
      const existingUser = await simpleDb.findUserByEmail(data.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const userId = generateId();
      await simpleDb.createUser({
        id: userId,
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        role: data.role || 'CONTRIBUTOR',
        bio: data.bio,
        expertiseAreas: data.expertiseAreas || [],
      });

      const user = await simpleDb.findUserById(userId);

      // Generate tokens
      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });
      const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role });

      // Format user profile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        profilePicture: user.profilePicture,
        bio: user.bio,
        expertiseAreas: user.expertiseAreas ? JSON.parse(user.expertiseAreas) : [],
        isActive: user.isActive,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt || user.createdAt),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
      };

      return {
        success: true,
        user: userProfile,
        token,
        refreshToken,
        expiresIn: '7d'
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await simpleDb.findUserByEmail(data.email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await comparePassword(data.password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Update last login timestamp
      await simpleDb.updateUserLastLogin(user.id);

      // Generate tokens
      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        role: user.role 
      });
      const refreshToken = generateRefreshToken({ id: user.id });

      // Format user profile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        profilePicture: user.profilePicture,
        bio: user.bio,
        expertiseAreas: user.expertiseAreas ? JSON.parse(user.expertiseAreas) : [],
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: new Date() // Current login time
      };

      return {
        user: userProfile,
        token,
        refreshToken
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Validate user by ID (for JWT token validation)
   */
  async validateUser(userId: string): Promise<UserProfile | null> {
    try {
      const user = await simpleDb.findUserById(userId);
      
      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        profilePicture: user.profilePicture,
        bio: user.bio,
        expertiseAreas: user.expertiseAreas ? JSON.parse(user.expertiseAreas) : [],
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      };
    } catch (error) {
      console.error('User validation error:', error);
      return null;
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.validateUser(userId);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string, 
    updateData: Partial<{
      firstName: string;
      lastName: string;
      bio: string;
      expertiseAreas: string[];
      profilePicture: string;
    }>
  ): Promise<UserProfile> {
    try {
      const updatedUser = await simpleDb.updateUser(userId, updateData);

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role as UserRole,
        profilePicture: updatedUser.profilePicture,
        bio: updatedUser.bio,
        expertiseAreas: updatedUser.expertiseAreas ? JSON.parse(updatedUser.expertiseAreas) : [],
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        lastLoginAt: updatedUser.lastLoginAt
      };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<void> {
    try {
      // Get user
      const user = await simpleDb.findUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(`New password validation failed: ${passwordValidation.errors.join(', ')}`);
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await simpleDb.updateUserPassword(userId, hashedNewPassword);
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      // This would typically validate the refresh token and generate new tokens
      // For now, we'll implement a basic version
      
      // In a real implementation, you would:
      // 1. Validate the refresh token
      // 2. Extract user ID from the refresh token
      // 3. Verify user still exists and is active
      // 4. Generate new access and refresh tokens
      
      throw new Error('Refresh token functionality not yet implemented');
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin function)
   */
  async getAllUsers(options: {
    search?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    try {
      return await simpleDb.getAllUsers();
    } catch (error) {
      console.error('Get all users error:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<void> {
    try {
      await simpleDb.deleteUser(userId);
    } catch (error) {
      console.error('User deactivation error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = new AuthService(); 