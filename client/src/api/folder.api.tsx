import axios from 'axios';
import { Folder, CreateFolderPayload } from '../types/folder.types';
import API_URL from './config';

const FOLDERS_URL = `${API_URL}/folders`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

export const getFolders = async (): Promise<Folder[]> => {
  const response = await axios.get<Folder[]>(FOLDERS_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const createFolder = async (folderData: CreateFolderPayload): Promise<Folder> => {
  const response = await axios.post<Folder>(FOLDERS_URL, folderData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteFolder = async (id: string): Promise<void> => {
  await axios.delete(`${FOLDERS_URL}/${id}`, {
    headers: getAuthHeader()
  });
};

// Sharing endpoints
export const shareFolder = async (folderId: string, teamId: string): Promise<Folder> => {
  const response = await axios.post<Folder>(`${FOLDERS_URL}/${folderId}/share`, { teamId }, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const unshareFolder = async (folderId: string, teamId: string): Promise<Folder> => {
  const response = await axios.delete<Folder>(`${FOLDERS_URL}/${folderId}/share/${teamId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
