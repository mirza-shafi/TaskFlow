import { Request, Response, NextFunction } from 'express';
import taskService from '@/services/task.service';
import { validateCreateTaskDto } from '@/dto/task.dto';
import { AppError } from '@/utils/AppError';

export class TaskController {
  // Get all tasks for logged-in user
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const tasks = await taskService.getUserTasks(req.user.id);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  // Create a new task
  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      if (!validateCreateTaskDto(req.body)) {
        throw new AppError('Title is required', 400);
      }

      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  // Update a task
  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const updatedTask = await taskService.updateTask(req.params.id, req.user.id, req.body);
      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  }

  // Delete a task
  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      await taskService.deleteTask(req.params.id, req.user.id);
      res.status(200).json({ message: 'Task deleted' });
    } catch (error) {
      next(error);
    }
  }

  // Get trashed tasks
  async getTrashedTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const tasks = await taskService.getTrashedTasks(req.user.id);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  }

  // Restore a task
  async restoreTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const task = await taskService.restoreTask(req.params.id, req.user.id);
      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  }

  // Permanently delete a task
  async permanentlyDeleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      await taskService.permanentlyDeleteTask(req.params.id, req.user.id);
      res.status(200).json({ message: 'Task permanently deleted' });
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
