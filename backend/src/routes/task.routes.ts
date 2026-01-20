import { Router } from 'express';
import taskController from '@/controllers/task.controller';
import { protect } from '@/middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(protect);

// GET /api/tasks - Get all tasks for logged-in user
router.get('/', (req, res, next) => taskController.getTasks(req, res, next));

// POST /api/tasks - Create a new task
router.post('/', (req, res, next) => taskController.createTask(req, res, next));

// PUT /api/tasks/:id - Update a task
router.put('/:id', (req, res, next) => taskController.updateTask(req, res, next));

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next));

export default router;
