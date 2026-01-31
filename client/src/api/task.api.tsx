import { Task, CreateTaskPayload, UpdateTaskPayload, TaskAssign, TaskInvite, TaskCollaborator } from '../types/task.types';
import API_URL from './config';

const TASK_BASE = `${API_URL}/tasks`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(TASK_BASE, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch tasks. Are you logged in?');
  const data = await res.json();
  
  // Handle both array and object responses
  // Backend might return { tasks: [...] } or just [...]
  if (Array.isArray(data)) {
    return data;
  } else if (data && Array.isArray(data.tasks)) {
    return data.tasks;
  } else {
    console.warn('Unexpected tasks response format:', data);
    return [];
  }
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  const res = await fetch(TASK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) {
     const errorData = await res.json();
     throw new Error(errorData.message || 'Failed to create task');
  }
  return res.json();
}

export async function updateTask(id: string, data: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${TASK_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${TASK_BASE}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

export async function getTrashedTasks(): Promise<Task[]> {
  const res = await fetch(`${TASK_BASE}/trash/all`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch trashed tasks');
  return res.json();
}

export async function restoreTask(id: string): Promise<Task> {
  const res = await fetch(`${TASK_BASE}/${id}/restore`, {
    method: 'POST',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to restore task');
  return res.json();
}

export async function permanentlyDeleteTask(id: string): Promise<void> {
  const res = await fetch(`${TASK_BASE}/${id}/permanent`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to permanently delete task');
}

// Collaboration endpoints
export async function assignTask(taskId: string, assignData: TaskAssign): Promise<Task> {
  const res = await fetch(`${TASK_BASE}/${taskId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(assignData),
  });
  if (!res.ok) throw new Error('Failed to assign task');
  return res.json();
}

export async function inviteTaskCollaborator(taskId: string, inviteData: TaskInvite): Promise<Task> {
  const res = await fetch(`${TASK_BASE}/${taskId}/collaborators/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(inviteData),
  });
  if (!res.ok) throw new Error('Failed to invite collaborator');
  return res.json();
}

export async function getTaskCollaborators(taskId: string): Promise<TaskCollaborator[]> {
  const res = await fetch(`${TASK_BASE}/${taskId}/collaborators`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to fetch collaborators');
  return res.json();
}

export async function removeTaskCollaborator(taskId: string, collaboratorId: string): Promise<Task> {
  const res = await fetch(`${TASK_BASE}/${taskId}/collaborators/${collaboratorId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) throw new Error('Failed to remove collaborator');
  return res.json();
}

