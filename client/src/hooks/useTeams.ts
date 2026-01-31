import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Team, TeamMember, TeamInvitation, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

const TEAMS_KEY = ['teams'];

export const useTeams = () => {
  return useQuery({
    queryKey: TEAMS_KEY,
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Team>>('/teams');
      return response.data;
    },
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [...TEAMS_KEY, id],
    queryFn: async () => {
      const response = await api.get<Team>(`/teams/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: [...TEAMS_KEY, teamId, 'members'],
    queryFn: async () => {
      const response = await api.get<TeamMember[]>(`/teams/${teamId}/members`);
      return response.data;
    },
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Team>) => {
      const response = await api.post<Team>('/teams', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY });
      toast.success('Team created');
    },
    onError: () => {
      toast.error('Failed to create team');
    },
  });
};

export const useInviteToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, email, role }: { teamId: string; email: string; role: string }) => {
      const response = await api.post<TeamInvitation>(`/teams/${teamId}/invitations`, { email, role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY });
      toast.success('Invitation sent');
    },
    onError: () => {
      toast.error('Failed to send invitation');
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      await api.delete(`/teams/${teamId}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY });
      toast.success('Member removed');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });
};

export const useLeaveTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      await api.post(`/teams/${teamId}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_KEY });
      toast.success('Left team');
    },
    onError: () => {
      toast.error('Failed to leave team');
    },
  });
};
