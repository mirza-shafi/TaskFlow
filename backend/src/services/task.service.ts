import Task, { ITaskDocument } from '@/models/Task.model';
import { CreateTaskDto, UpdateTaskDto } from '@/dto/task.dto';
import { AppError } from '@/utils/AppError';

export class TaskService {
  // Get all tasks for a user
  async getUserTasks(userId: string): Promise<ITaskDocument[]> {
    const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
    return tasks;
  }

  // Create a new task
  async createTask(userId: string, data: CreateTaskDto): Promise<ITaskDocument> {
    const { title, description, priority, dueDate } = data;

    const taskData = {
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      user: userId
    };

    const task = await Task.create(taskData);
    return task;
  }

  // Update a task
  async updateTask(taskId: string, userId: string, data: UpdateTaskDto): Promise<ITaskDocument> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check ownership
    if (task.user.toString() !== userId) {
      throw new AppError('User not authorized to update this task', 401);
    }

    // Update fields
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.status !== undefined) task.status = data.status;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate || null;

    const updatedTask = await task.save();
    return updatedTask;
  }

  // Delete a task
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Check ownership
    if (task.user.toString() !== userId) {
      throw new AppError('User not authorized to delete this task', 401);
    }

    await task.deleteOne();
  }
}

export default new TaskService();
