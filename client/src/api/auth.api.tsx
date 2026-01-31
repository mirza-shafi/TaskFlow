import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import { Session } from '../types/session.types';
import API_URL from './config';

const AUTH_URL = `${API_URL}/auth`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

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

export async function resendVerification(email: string): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/resend-verification`, { email });
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

export async function refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
  const response = await axios.post<{ accessToken: string }>(`${AUTH_URL}/refresh`, { refreshToken });
  return response.data;
}

export async function logout(): Promise<{ message: string }> {
  const response = await axios.post<{ message: string }>(`${AUTH_URL}/logout`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
}

export async function logoutAllDevices(): Promise<{ message: string; sessionsRevoked: number }> {
  const response = await axios.post<{ message: string; sessionsRevoked: number }>(`${AUTH_URL}/logout-all`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
}

export async function getSessions(): Promise<Session[]> {
  const response = await axios.get<Session[]>(`${AUTH_URL}/sessions`, {
    headers: getAuthHeader()
  });
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<{ message: string }> {
  const response = await axios.delete<{ message: string }>(`${AUTH_URL}/sessions/${sessionId}`, {
    headers: getAuthHeader()
  });
  return response.data;
}

