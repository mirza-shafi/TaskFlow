import { Router } from 'express';
import * as folderController from '@/controllers/folder.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.post('/', protect, folderController.createFolder);
router.get('/', protect, folderController.getFolders);
router.delete('/:id', protect, folderController.deleteFolder);

export default router;
