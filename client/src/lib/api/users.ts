import apiClient from './config';
import { User, AppearanceSettings, NotificationPreferences, MessageResponse } from '@/types/api';

// ============================================
// Users API
// ============================================

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  name?: string;
  bio?: string;
  avatarUrl?: string;
  appearance?: AppearanceSettings;
  notificationPreferences?: NotificationPreferences;
}): Promise<User> => {
  const response = await apiClient.put<User>('/users/profile', data);
  
  // Update user in localStorage
  localStorage.setItem('user', JSON.stringify(response.data));
  
  return response.data;
};

/**
 * Upload user avatar
 */
export const uploadAvatar = async (file: File): Promise<{
  message: string;
  avatarUrl: string;
  user: User;
}> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post<{
    message: string;
    avatarUrl: string;
    user: User;
  }>('/users/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Update user in localStorage
  localStorage.setItem('user', JSON.stringify(response.data.user));

  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<MessageResponse> => {
  const response = await apiClient.put<MessageResponse>('/users/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Delete user account
 */
export const deleteAccount = async (): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>('/users/profile');
  
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  return response.data;
};
