import { asyncHandler } from '@/middlewares/asyncHandler';
import { Router } from 'express';
const router = Router();

router.post(
  '/send',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Message sent successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
