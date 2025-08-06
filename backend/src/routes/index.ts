import { Router } from 'express';
import authRoutes from './auth.routes';
import knowledgeRoutes from './knowledge.routes';
import projectsRoutes from './projects.routes';
import filesRoutes from './files.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Knowledge Transfer Tool API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Version info
router.get('/version', (req, res) => {
  res.json({
    name: 'Knowledge Transfer Tool API',
    version: '1.0.0',
    description: 'API for managing knowledge transfer and documentation',
  });
});

// Authentication routes
router.use('/auth', authRoutes);

router.use('/users', (req, res) => {
  res.json({ message: 'User routes - Coming soon!' });
});

// Projects routes
router.use('/projects', projectsRoutes);

// Knowledge routes
router.use('/knowledge', knowledgeRoutes);

// Files routes
router.use('/files', filesRoutes);

// Admin routes
router.use('/admin', adminRoutes);

router.use('/comments', (req, res) => {
  res.json({ message: 'Comment routes - Coming soon!' });
});

export default router; 