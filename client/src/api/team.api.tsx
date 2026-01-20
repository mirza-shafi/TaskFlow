import axios from 'axios';

const API_URL = '/api/teams';

export const getTeams = async () => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createTeam = async (teamData: { name: string; members?: string[] }) => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post(API_URL, teamData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addMember = async (teamId: string, userId: string) => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post(`${API_URL}/add-member`, { teamId, userId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
