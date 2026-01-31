import axios from 'axios';
import { Team, CreateTeamPayload, TeamMember, TeamActivity } from '../types/team.types';
import API_URL from './config';

const TEAMS_URL = `${API_URL}/teams`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await axios.get<Team[]>(TEAMS_URL, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const createTeam = async (teamData: CreateTeamPayload): Promise<Team> => {
  const response = await axios.post<Team>(TEAMS_URL, teamData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Team member management
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const response = await axios.get<TeamMember[]>(`${TEAMS_URL}/${teamId}/members`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const inviteMember = async (teamId: string, email: string, role: 'member' | 'admin' = 'member'): Promise<Team> => {
  const response = await axios.post<Team>(`${TEAMS_URL}/${teamId}/members/invite`, { email, role }, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const updateMemberRole = async (teamId: string, memberId: string, role: 'member' | 'admin'): Promise<Team> => {
  const response = await axios.put<Team>(`${TEAMS_URL}/${teamId}/members/${memberId}/role`, { role }, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const removeMember = async (teamId: string, memberId: string): Promise<Team> => {
  const response = await axios.delete<Team>(`${TEAMS_URL}/${teamId}/members/${memberId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const getTeamActivity = async (teamId: string, limit: number = 50): Promise<TeamActivity[]> => {
  const response = await axios.get<TeamActivity[]>(`${TEAMS_URL}/${teamId}/activity?limit=${limit}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

export const deleteTeam = async (teamId: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${TEAMS_URL}/${teamId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
