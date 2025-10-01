import { signin, signup, logout, refreshToken, testCookie } from '@/controllers/auth.controller';
import { validateSignin, validateSignup } from '@/validators/auth.validator';
import { Router } from 'express';

const router = Router();

router.post('/signin', validateSignin, signin);

router.post('/signup', validateSignup, signup);

// logout route
router.post('/logout', logout);

// refresh token route
router.post('/refresh', refreshToken);

// ===================================== //
// ========== TEST ROUTES ========== //
// ===================================== //

router.get('/test/cookie', testCookie);

export default router;
