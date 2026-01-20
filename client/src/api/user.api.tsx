import axios from 'axios';
import { UserProfile, UpdateProfilePayload } from '../types/user.types';

const API_URL = '/api/user/profile';

export const getProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get<UserProfile>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateProfile = async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.put<UserProfile>(API_URL, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
