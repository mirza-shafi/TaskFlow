import apiClient from './config';
import {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMember,
  TeamActivity,
  MessageResponse,
} from '@/types/api';

// ============================================
// Teams API
// ============================================

/**
 * Get all teams (where user is owner or member)
 */
export const getTeams = async (): Promise<Team[]> => {
  const response = await apiClient.get<Team[]>('/teams');
  return response.data;
};

/**
 * Create a new team
 */
export const createTeam = async (data: TeamCreate): Promise<Team> => {
  const response = await apiClient.post<Team>('/teams', data);
  return response.data;
};

/**
 * Update a team (owner only)
 */
export const updateTeam = async (teamId: string, data: TeamUpdate): Promise<Team> => {
  const response = await apiClient.put<Team>(`/teams/${teamId}`, data);
  return response.data;
};

/**
 * Delete a team (owner only)
 */
export const deleteTeam = async (teamId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/teams/${teamId}`);
  return response.data;
};

/**
 * Get team members
 */
export const getTeamMembers = async (teamId: string): Promise<TeamMember[]> => {
  const response = await apiClient.get<{ members: TeamMember[]; total: number }>(`/teams/${teamId}/members`);
  return response.data.members;
};

/**
 * Invite a member by email
 */
export const inviteTeamMember = async (
  teamId: string,
  data: { email: string; role?: 'member' | 'admin' }
): Promise<Team> => {
  const response = await apiClient.post<Team>(`/teams/${teamId}/invite`, data);
  return response.data;
};

/**
 * Update member role
 */
export const updateMemberRole = async (
  teamId: string,
  memberId: string,
  role: 'member' | 'admin'
): Promise<Team> => {
  const response = await apiClient.put<Team>(`/teams/${teamId}/members/${memberId}/role`, {
    role,
  });
  return response.data;
};

/**
 * Remove a team member
 */
export const removeTeamMember = async (
  teamId: string,
  memberId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `/teams/${teamId}/members/${memberId}`
  );
  return response.data;
};

/**
 * Get team activity history
 */
export const getTeamActivity = async (
  teamId: string,
  limit: number = 50
): Promise<TeamActivity[]> => {
  const response = await apiClient.get<{ activities: TeamActivity[]; total: number }>(
    `/teams/${teamId}/activity`,
    { params: { limit } }
  );
  return response.data.activities;
};
