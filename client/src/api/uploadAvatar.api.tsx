import axios from 'axios';

const API_URL = '/api/user';

export const uploadAvatar = async (file: File): Promise<{ avatarUrl: string }> => {
  const token = localStorage.getItem('userToken');
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await axios.post<{ avatarUrl: string; message: string }>(
    `${API_URL}/upload-avatar`, 
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
