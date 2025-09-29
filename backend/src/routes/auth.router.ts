import { asyncHandler } from '@/middlewares/asyncHandler';
import { Router } from 'express';
const router = Router();

router.post(
  '/signin',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Sign-in successful',
      timestamp: new Date().toISOString(),
    });
  })
);

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    res.status(201).json({
      success: true,
      message: 'Sign-up successful',
      timestamp: new Date().toISOString(),
    });
  })
);

// logout route
router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
