import session from 'express-session';

export const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  name: 'ktat.session',
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours default
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  },
  rolling: true, // Reset the cookie expiration on each request
}; 