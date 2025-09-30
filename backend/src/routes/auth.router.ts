import { signin, signup, logout } from '@/controllers/auth.controller';
import { validateSignin, validateSignup } from '@/validators/auth.validator';
import { Router } from 'express';

const router = Router();

router.post('/signin', validateSignin, signin);

router.post('/signup', validateSignup, signup);

// logout route
router.post('/logout', logout);

export default router;
