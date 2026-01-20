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

// DELETE /api/tasks/:id - Delete a task (Soft delete)
router.delete('/:id', (req, res, next) => taskController.deleteTask(req, res, next));

// GET /api/tasks/trash/all - Get all trashed tasks
router.get('/trash/all', (req, res, next) => taskController.getTrashedTasks(req, res, next));

// POST /api/tasks/:id/restore - Restore a task
router.post('/:id/restore', (req, res, next) => taskController.restoreTask(req, res, next));

// DELETE /api/tasks/:id/permanent - Permanently delete a task
router.delete('/:id/permanent', (req, res, next) => taskController.permanentlyDeleteTask(req, res, next));

export default router;
