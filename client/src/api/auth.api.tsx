import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const USER_BASE = `${API_URL}/api/users`;

export async function login(userData: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${USER_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to log in');
  }
  return data.data;
}

export async function register(userData: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${USER_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to register');
  }
  return data.data;
}
