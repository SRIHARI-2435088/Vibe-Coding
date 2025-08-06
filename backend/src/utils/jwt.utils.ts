import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth.types';

// Get JWT secret from environment variable
const getJWTSecret = (): string => {
  const secret = process.env['JWT_SECRET'] || 'default-secret-key';
  console.log('JWT_SECRET available:', !!secret);
  console.log('All env vars:', {
    JWT_SECRET: secret ? '[REDACTED]' : 'NOT_SET',
    NODE_ENV: process.env['NODE_ENV'],
    PORT: process.env['PORT']
  });
  
  // Fallback for demo purposes
  if (!secret) {
    console.log('Using fallback JWT secret for demo');
    return 'demo-jwt-secret-for-development-only-2024';
  }
  return secret;
};

// Get JWT expiration time from environment variable
const getJWTExpiresIn = (): string => {
  return process.env['JWT_EXPIRES_IN'] || '7d';
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (payload: JWTPayload): string => {
  try {
    const secret = getJWTSecret();
    const expiresIn = getJWTExpiresIn();

    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
      secret,
      {
        expiresIn,
        issuer: 'ktat-api',
        audience: 'ktat-app',
      }
    );

    return token;
  } catch (error) {
    throw new Error('Failed to generate JWT token');
  }
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = getJWTSecret();
    
    const decoded = jwt.verify(token, secret, {
      issuer: 'ktat-api',
      audience: 'ktat-app',
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode a JWT token without verification (for debugging/logging purposes)
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Check if a token is expired without verifying the signature
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Generate a refresh token (longer expiration)
 */
export const generateRefreshToken = (payload: JWTPayload): string => {
  try {
    const secret = getJWTSecret();

    const token = jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        type: 'refresh',
      },
      secret,
      {
        expiresIn: '30d', // 30 days for refresh token
        issuer: 'ktat-api',
        audience: 'ktat-app',
      }
    );

    return token;
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JWTPayload => {
  try {
    const decoded = verifyToken(token);
    
    // Check if it's actually a refresh token
    if (!(decoded as any).type || (decoded as any).type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}; 