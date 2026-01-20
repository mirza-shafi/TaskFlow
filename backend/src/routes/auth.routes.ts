import { Router } from 'express';
import authController from '@/controllers/auth.controller';

const router = Router();

// POST /api/users/register
router.post('/register', (req, res, next) => authController.register(req, res, next));

// POST /api/users/login
router.post('/login', (req, res, next) => authController.login(req, res, next));

export default router;
