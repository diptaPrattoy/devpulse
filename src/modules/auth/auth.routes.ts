import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { login, signup } from './auth.controller.js';

const router = Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

export default router;
