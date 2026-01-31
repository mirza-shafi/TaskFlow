import apiClient from './config';
import { Task, TaskCreate, TaskUpdate, TaskCollaborator, MessageResponse } from '@/types/api';

// ============================================
// Tasks API
// ============================================

/**
 * Get all tasks with optional filters
 */
export const getTasks = async (params?: {
  folderId?: string;
  status?: 'todo' | 'doing' | 'done';
}): Promise<Task[]> => {
  const response = await apiClient.get<{ tasks: Task[]; total: number }>('/tasks', { params });
  return response.data.tasks;
};

/**
 * Create a new task
 */
export const createTask = async (data: TaskCreate): Promise<Task> => {
  const response = await apiClient.post<Task>('/tasks', data);
  return response.data;
};

/**
 * Get a single task by ID
 */
export const getTask = async (taskId: string): Promise<Task> => {
  const response = await apiClient.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Update a task
 */
export const updateTask = async (taskId: string, data: TaskUpdate): Promise<Task> => {
  const response = await apiClient.put<Task>(`/tasks/${taskId}`, data);
  return response.data;
};

/**
 * Soft delete a task (move to trash)
 */
export const deleteTask = async (taskId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/tasks/${taskId}`);
  return response.data;
};

/**
 * Get all trashed tasks
 */
export const getTrashedTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<{ tasks: Task[]; total: number }>('/tasks/trash/all');
  return response.data.tasks;
};

/**
 * Restore a task from trash
 */
export const restoreTask = async (taskId: string): Promise<Task> => {
  const response = await apiClient.post<Task>(`/tasks/${taskId}/restore`);
  return response.data;
};

/**
 * Permanently delete a task
 */
export const permanentlyDeleteTask = async (taskId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/tasks/${taskId}/permanent`);
  return response.data;
};

/**
 * Assign a user to a task
 */
export const assignTask = async (
  taskId: string,
  data: { userId: string; role?: 'viewer' | 'editor' | 'assignee' }
): Promise<Task> => {
  const response = await apiClient.post<Task>(`/tasks/${taskId}/assign`, data);
  return response.data;
};

/**
 * Invite a collaborator by email
 */
export const inviteTaskCollaborator = async (
  taskId: string,
  data: { email: string; role?: 'viewer' | 'editor' }
): Promise<Task> => {
  const response = await apiClient.post<Task>(`/tasks/${taskId}/invite`, data);
  return response.data;
};

/**
 * Get task collaborators
 */
export const getTaskCollaborators = async (taskId: string): Promise<TaskCollaborator[]> => {
  const response = await apiClient.get<TaskCollaborator[]>(`/tasks/${taskId}/collaborators`);
  return response.data;
};

/**
 * Remove a collaborator from a task
 */
export const removeTaskCollaborator = async (
  taskId: string,
  collaboratorId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `/tasks/${taskId}/collaborators/${collaboratorId}`
  );
  return response.data;
};

/**
 * Duplicate a task
 */
export const duplicateTask = async (taskId: string): Promise<Task> => {
  const response = await apiClient.post<Task>(`/tasks/${taskId}/duplicate`);
  return response.data;
};

/**
 * Bulk reorder tasks (for drag-and-drop)
 */
export interface TaskPositionUpdate {
  taskId: string;
  position: number;
  status?: 'todo' | 'doing' | 'done';
}

export const reorderTasks = async (updates: TaskPositionUpdate[]): Promise<MessageResponse> => {
  const response = await apiClient.patch<MessageResponse>('/tasks/reorder', { updates });
  return response.data;
};
