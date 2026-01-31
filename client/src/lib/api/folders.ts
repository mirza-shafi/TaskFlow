import apiClient from './config';
import { Folder, FolderCreate, FolderUpdate, MessageResponse } from '@/types/api';

// ============================================
// Folders API
// ============================================

/**
 * Get all folders
 */
export const getFolders = async (): Promise<Folder[]> => {
  const response = await apiClient.get<Folder[]>('/folders');
  return response.data;
};

/**
 * Create a new folder
 */
export const createFolder = async (data: FolderCreate): Promise<Folder> => {
  const response = await apiClient.post<Folder>('/folders', data);
  return response.data;
};

/**
 * Update a folder
 */
export const updateFolder = async (folderId: string, data: FolderUpdate): Promise<Folder> => {
  const response = await apiClient.put<Folder>(`/folders/${folderId}`, data);
  return response.data;
};

/**
 * Delete a folder
 */
export const deleteFolder = async (folderId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/folders/${folderId}`);
  return response.data;
};

/**
 * Share a folder with a team
 */
export const shareFolder = async (folderId: string, teamId: string): Promise<Folder> => {
  const response = await apiClient.post<Folder>(`/folders/${folderId}/share`, { teamId });
  return response.data;
};

/**
 * Unshare a folder from a team
 */
export const unshareFolder = async (folderId: string, teamId: string): Promise<Folder> => {
  const response = await apiClient.delete<Folder>(`/folders/${folderId}/share/${teamId}`);
  return response.data;
};
