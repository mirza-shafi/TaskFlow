import { Task, CreateTaskPayload, UpdateTaskPayload } from '../types/task.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const TASK_BASE = `${API_URL}/api/tasks`;

export async function getTasks(): Promise<Task[]> {
  const token = localStorage.getItem('userToken');
  const res = await fetch(TASK_BASE, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks. Are you logged in?');
  return res.json();
}

export async function createTask(taskData: CreateTaskPayload): Promise<Task> {
  const token = localStorage.getItem('userToken');
  const res = await fetch(TASK_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
  const token = localStorage.getItem('userToken');
  const res = await fetch(`${TASK_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  const token = localStorage.getItem('userToken');
  const res = await fetch(`${TASK_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete task');
}
