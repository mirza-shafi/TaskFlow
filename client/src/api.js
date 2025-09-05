// This line checks for the deployment URL and falls back to your local server
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const TASK_BASE = `${API_URL}/api/tasks`;
const USER_BASE = `${API_URL}/api/users`;

// ===============================================
//           USER FUNCTIONS
// ===============================================

export async function login(userData) {
  const res = await fetch(`${USER_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to log in');
  }
  return data;
}

export async function register(userData) {
  const res = await fetch(`${USER_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to register');
  }
  return data;
}


// ===============================================
//           TASK FUNCTIONS
// ===============================================

export async function getTasks() {
  const token = localStorage.getItem('userToken');
  const res = await fetch(TASK_BASE, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks. Are you logged in?');
  return res.json();
}

export async function createTask(taskData) {
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

export async function updateTask(id, data) {
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

export async function deleteTask(id) {
  const token = localStorage.getItem('userToken');
  const res = await fetch(`${TASK_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete task');
}