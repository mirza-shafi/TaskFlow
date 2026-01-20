import axios from 'axios';
import { Team, CreateTeamPayload } from '../types/team.types';

const API_URL = '/api/teams';

export const getTeams = async (): Promise<Team[]> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.get<Team[]>(API_URL, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const createTeam = async (teamData: CreateTeamPayload): Promise<Team> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post<Team>(API_URL, teamData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addMember = async (teamId: string, userId: string): Promise<Team> => {
  const token = localStorage.getItem('userToken');
  const response = await axios.post<Team>(`${API_URL}/add-member`, { teamId, userId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
