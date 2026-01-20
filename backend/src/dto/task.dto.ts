// Data Transfer Objects for Task operations

export enum TaskStatus {
  TODO = 'todo',
  DOING = 'doing',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export interface TaskResponseDto {
  _id: string;
  user: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Runtime validation helpers
export const validateCreateTaskDto = (data: any): data is CreateTaskDto => {
  return (
    typeof data.title === 'string' &&
    data.title.length > 0
  );
};

export const isValidTaskStatus = (status: string): status is TaskStatus => {
  return Object.values(TaskStatus).includes(status as TaskStatus);
};

export const isValidTaskPriority = (priority: string): priority is TaskPriority => {
  return Object.values(TaskPriority).includes(priority as TaskPriority);
};
