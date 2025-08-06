import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { Request, Response } from 'express';

const router = Router();

/**
 * Public authentication routes (no authentication required)
 */

// POST /api/auth/register - Register a new user
router.post('/register', authController.register.bind(authController));

// POST /api/auth/login - Login user
router.post('/login', authController.login.bind(authController));

/**
 * Protected authentication routes (require authentication)
 */

// GET /api/auth/profile - Get current user profile
router.get('/profile', authMiddleware, authController.getProfile.bind(authController));

// PUT /api/auth/profile - Update current user profile
router.put('/profile', authMiddleware, authController.updateProfile.bind(authController));

// PUT /api/auth/change-password - Change user password
router.put('/change-password', authMiddleware, authController.changePassword.bind(authController));

// POST /api/auth/logout - Logout user
router.post('/logout', authMiddleware, authController.logout.bind(authController));

// POST /api/auth/refresh - Refresh authentication token
router.post('/refresh', authMiddleware, authController.refreshToken.bind(authController));

// GET /api/auth/validate - Validate current authentication status
router.get('/validate', authMiddleware, authController.validateAuth.bind(authController));



// Test JWT configuration endpoint (for debugging)
router.get('/test-jwt', async (req: Request, res: Response) => {
  try {
    const jwtSecret = process.env['JWT_SECRET'];
    const jwtExpiresIn = process.env['JWT_EXPIRES_IN'];
    
    res.json({
      success: true,
      jwtConfigured: !!jwtSecret,
      jwtSecretLength: jwtSecret ? jwtSecret.length : 0,
      jwtExpiresIn: jwtExpiresIn || 'not set',
      allEnvVars: {
        NODE_ENV: process.env['NODE_ENV'],
        PORT: process.env['PORT'],
        JWT_SECRET: jwtSecret ? '[REDACTED]' : 'NOT_SET'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 