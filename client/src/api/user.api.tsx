import axios from 'axios';

const API_URL = '/api/user/profile';

export const getProfile = async () => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (profileData: { name?: string; bio?: string; avatarUrl?: string }) => {
  const token = localStorage.getItem('userToken');
  const response = await axios.put(API_URL, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
