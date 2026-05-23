import { Router } from 'express';
import { authenticate, authorizeRoles } from '../../middleware/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { create, list, remove, retrieve, update } from './issues.controller.js';

const router = Router();

router.get('/', asyncHandler(list));
router.get('/:id', asyncHandler(retrieve));
router.post('/', authenticate, asyncHandler(create));
router.patch('/:id', authenticate, asyncHandler(update));
router.delete('/:id', authenticate, authorizeRoles('maintainer'), asyncHandler(remove));

export default router;
