import { Router } from 'express';
import * as userController from '@/controllers/user.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

export default router;
