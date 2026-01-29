import axios from 'axios';
import { UserProfile, UpdateProfilePayload } from '../types/user.types';
import API_URL from './config';

const PROFILE_URL = `${API_URL}/users/profile`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

export const getProfile = async (): Promise<UserProfile> => {
  const response = await axios.get<UserProfile>(PROFILE_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateProfile = async (profileData: UpdateProfilePayload): Promise<UserProfile> => {
  const response = await axios.put<UserProfile>(PROFILE_URL, profileData, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  const response = await axios.put(`${API_URL}/users/change-password`, 
    { currentPassword, newPassword },
    { headers: getAuthHeader() }
  );
  return response.data;
};

export const deleteAccount = async (): Promise<any> => {
  const response = await axios.delete(PROFILE_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};
