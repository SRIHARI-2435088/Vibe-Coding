import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, authUtils, UserProfile, UserRole } from '@/services/api/auth';
import { toast } from '@/hooks/useToast';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  canManageProjects: () => boolean;
}

interface RegisterData {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  bio?: string;
  expertiseAreas?: string[];
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null && authUtils.isAuthenticated();

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if we have a token
        if (!authUtils.isAuthenticated()) {
          // No valid token, clear everything and stop loading
          authUtils.clearAuthData();
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Try to get stored user profile first
        const storedProfile = authUtils.getStoredUserProfile();
        
        if (storedProfile) {
          // Set user from stored profile immediately
          setUser(storedProfile);
          
          // Try to validate and refresh profile in background
          try {
            const freshProfile = await authApi.validateAuth();
            setUser(freshProfile);
          } catch (error: any) {
            console.warn('Failed to validate auth, using stored profile:', error);
            
            // Only clear auth if the error indicates invalid authentication
            if (error?.response?.status === 401 || error?.response?.status === 403) {
              console.log('Token is invalid, clearing auth data');
              authUtils.clearAuthData();
              setUser(null);
            }
            // For network errors or other issues, keep the stored profile
          }
        } else {
          // No stored profile, try to validate token
          try {
            const profile = await authApi.validateAuth();
            setUser(profile);
          } catch (error) {
            console.log('Auth validation failed, clearing auth data');
            authUtils.clearAuthData();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // On any unexpected error, check if we have a valid stored profile
        const storedProfile = authUtils.getStoredUserProfile();
        if (storedProfile && authUtils.isAuthenticated()) {
          // Keep user logged in with stored profile
          setUser(storedProfile);
        } else {
          // Clear everything if no valid data
          authUtils.clearAuthData();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      setUser(response.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
      toast.success('Logout Successful', 'You have been logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still show success message as user is being logged out locally
      toast.success('Logout Successful', 'You have been logged out');
    } finally {
      authUtils.clearAuthData();
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<void> => {
    try {
      const updatedProfile = await authApi.updateProfile(data);
      setUser(updatedProfile);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const canManageProjects = (): boolean => {
    return hasRole(UserRole.ADMIN) || hasRole(UserRole.PROJECT_MANAGER);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    hasRole,
    isAdmin,
    canManageProjects,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 