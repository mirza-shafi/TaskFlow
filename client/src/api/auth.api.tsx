import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import API_URL from './config';

const AUTH_URL = `${API_URL}/auth`;

export async function login(userData: LoginCredentials): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${AUTH_URL}/login`, userData);
  return response.data;
}

export async function register(userData: RegisterCredentials): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/register`, userData);
  return response.data;
}


export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/verify-email`, { token });
  return response.data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/forgot-password`, { email });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/reset-password`, { token, newPassword });
  return response.data;
}
