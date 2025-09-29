import { Router } from 'express';
import authRoutes from './auth.router';
import messageRoutes from './message.router';
const router = Router();

// Welcome route
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get('/', (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: 'Chat App API v1.0',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Health check route
// eslint-disable-next-line @typescript-eslint/no-explicit-any
router.get('/health', (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// routes

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);

export default router;
