import apiClient from './config';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import {
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
  User,
  Session,
  MessageResponse,
} from '@/types/api';

// ============================================
// Authentication API
// ============================================

/**
 * Register a new user
 */
export const register = async (
  credentials: RegisterCredentials
): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/register', credentials);
  return response.data;
};

/**
 * Login with email and password
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  
  // Store tokens in localStorage
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
};

/**
 * Sign in (or register) with Google via Firebase.
 *
 * Opens a Google account-picker popup. On success:
 * 1. Gets a short-lived Firebase ID token.
 * 2. Sends it to POST /auth/google on the TaskFlow backend.
 * 3. Backend verifies it, finds-or-creates the user, returns our own JWTs.
 * 4. Stores tokens identically to a normal login.
 *
 * Errors:
 * - `auth/popup-closed-by-user` — user dismissed the popup (handle silently).
 * - `auth/popup-blocked`        — browser blocked the popup (show a message).
 * - HTTP errors from backend    — invalid token, server error, etc.
 */
export const loginWithGoogle = async (): Promise<AuthResponse> => {
  // Step 1: Open Google account picker
  const result = await signInWithPopup(auth, googleProvider);

  // Step 2: Get Firebase ID token (short-lived, ~1 hour)
  const idToken = await result.user.getIdToken();

  // Step 3: Exchange with our backend for TaskFlow JWTs
  const response = await apiClient.post<AuthResponse>('/auth/google', { idToken });

  // Step 4: Persist tokens (same pattern as regular login)
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken,
  });
  
  // Update access token in localStorage
  if (response.data.accessToken) {
    localStorage.setItem('accessToken', response.data.accessToken);
  }
  
  return response.data;
};

/**
 * Request password reset email
 */
export const forgotPassword = async (email: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/reset-password', {
    token,
    newPassword,
  });
  return response.data;
};

/**
 * Logout from current device
 */
export const logout = async (): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/auth/logout');
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return response.data;
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (): Promise<{
  message: string;
  sessionsRevoked: number;
}> => {
  const response = await apiClient.post<{ message: string; sessionsRevoked: number }>(
    '/auth/logout-all'
  );
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return response.data;
};

/**
 * Get all active sessions
 */
export const getSessions = async (): Promise<Session[]> => {
  const response = await apiClient.get<Session[]>('/auth/sessions');
  return response.data;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/auth/sessions/${sessionId}`);
  return response.data;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('accessToken');
};
