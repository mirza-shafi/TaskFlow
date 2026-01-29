import axios from 'axios';
import API_URL from './config';

const UPLOAD_URL = `${API_URL}/users/upload-avatar`;

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const token = localStorage.getItem('userToken');
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axios.post<{ avatarUrl: string; message: string }>(
    UPLOAD_URL, 
    formData, 
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return { avatarUrl: response.data.avatarUrl };
};
