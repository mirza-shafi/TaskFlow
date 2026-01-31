import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { DashboardStats, ActivityItem } from '@/types';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/analytics/dashboard');
      return response.data;
    },
  });
};

export const useActivityFeed = (limit = 20) => {
  return useQuery({
    queryKey: ['activity-feed', limit],
    queryFn: async () => {
      const response = await api.get<ActivityItem[]>(`/analytics/activity?limit=${limit}`);
      return response.data;
    },
  });
};

export const useWeeklyProgress = () => {
  return useQuery({
    queryKey: ['weekly-progress'],
    queryFn: async () => {
      const response = await api.get<{ date: string; tasks: number; habits: number }[]>('/analytics/weekly');
      return response.data;
    },
  });
};

export const useHabitHeatmap = (habitId?: string) => {
  return useQuery({
    queryKey: ['habit-heatmap', habitId],
    queryFn: async () => {
      const endpoint = habitId ? `/analytics/heatmap/${habitId}` : '/analytics/heatmap';
      const response = await api.get<{ date: string; count: number }[]>(endpoint);
      return response.data;
    },
  });
};
