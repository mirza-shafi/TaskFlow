import axios from 'axios';
import { Folder, CreateFolderPayload } from '../types/folder.types';

const API_URL = '/api/folders';

export const getFolders = async (): Promise<Folder[]> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get<Folder[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createFolder = async (folderData: CreateFolderPayload): Promise<Folder> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post<Folder>(API_URL, folderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteFolder = async (id: string): Promise<void> => {
  const token = localStorage.getItem('userToken');
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
