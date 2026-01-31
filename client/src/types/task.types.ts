// Task types

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCollaborator {
  userId: string;
  email: string;
  role: 'viewer' | 'editor' | 'assignee';
  addedAt: string;
}

export interface Task {
  _id: string;
  user: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  folderId?: string;
  teamId?: string;
  collaborators?: TaskCollaborator[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  folderId?: string;
  teamId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  folderId?: string;
  teamId?: string;
}

export interface TaskAssign {
  userId: string;
  role?: 'viewer' | 'editor' | 'assignee';
}

export interface TaskInvite {
  email: string;
  role?: 'viewer' | 'editor' | 'assignee';
}
