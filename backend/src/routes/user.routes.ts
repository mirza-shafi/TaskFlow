import { Router } from 'express';
import * as userController from '@/controllers/user.controller';
import { protect } from '@/middleware/auth.middleware';
import { avatarUpload } from '@/config/multer';

const router = Router();

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.post('/upload-avatar', protect, avatarUpload.single('avatar'), userController.uploadAvatar);

export default router;
