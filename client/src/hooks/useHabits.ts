import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Habit, HabitLog, HabitStreak, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

const HABITS_KEY = ['habits'];
const HABIT_LOGS_KEY = ['habit-logs'];

export const useHabits = () => {
  return useQuery({
    queryKey: HABITS_KEY,
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Habit>>('/habits');
      return response.data;
    },
  });
};

export const useHabit = (id: string) => {
  return useQuery({
    queryKey: [...HABITS_KEY, id],
    queryFn: async () => {
      const response = await api.get<Habit>(`/habits/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useHabitLogs = (habitId: string, startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: [...HABIT_LOGS_KEY, habitId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      
      const response = await api.get<HabitLog[]>(`/habits/${habitId}/logs?${params}`);
      return response.data;
    },
    enabled: !!habitId,
  });
};

export const useHabitStreak = (habitId: string) => {
  return useQuery({
    queryKey: [...HABITS_KEY, habitId, 'streak'],
    queryFn: async () => {
      const response = await api.get<HabitStreak>(`/habits/${habitId}/streak`);
      return response.data;
    },
    enabled: !!habitId,
  });
};

export const useCreateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Habit>) => {
      const response = await api.post<Habit>('/habits', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit created');
    },
    onError: () => {
      toast.error('Failed to create habit');
    },
  });
};

export const useUpdateHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Habit> }) => {
      const response = await api.patch<Habit>(`/habits/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit updated');
    },
    onError: () => {
      toast.error('Failed to update habit');
    },
  });
};

export const useLogHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date, completed = true, notes }: { habitId: string; date: string; completed?: boolean; notes?: string }) => {
       // Match backend expectation: date, completed, notes
      const response = await api.post<HabitLog>(`/habits/${habitId}/logs`, { date, completed, notes });
      return response.data;
    },
    onMutate: async ({ habitId }) => {
      await queryClient.cancelQueries({ queryKey: [...HABIT_LOGS_KEY, habitId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABIT_LOGS_KEY });
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit logged!');
    },
    onError: (error) => {
        console.error("Log habit error:", error);
      toast.error('Failed to log habit');
    },
  });
};

export const useDeleteHabit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/habits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HABITS_KEY });
      toast.success('Habit deleted');
    },
    onError: () => {
      toast.error('Failed to delete habit');
    },
  });
};
