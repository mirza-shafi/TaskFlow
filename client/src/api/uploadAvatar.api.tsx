import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const USER_API = `${API_URL}/api/user`;

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const token = localStorage.getItem('userToken');
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axios.post<{ avatarUrl: string; message: string }>(
    `${USER_API}/upload-avatar`, 
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
