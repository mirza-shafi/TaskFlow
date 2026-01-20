import { Router } from 'express';
import * as teamController from '@/controllers/team.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

router.post('/', protect, teamController.createTeam);
router.get('/', protect, teamController.getTeams);
router.post('/add-member', protect, teamController.addMember);

export default router;
