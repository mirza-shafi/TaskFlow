import axios from 'axios';

const API_URL = '/api/folders';

export const getFolders = async () => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createFolder = async (folderData: { name: string; color?: string; isPrivate?: boolean }) => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post(API_URL, folderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteFolder = async (id: string) => {
  const token = localStorage.getItem('userToken');
  await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
