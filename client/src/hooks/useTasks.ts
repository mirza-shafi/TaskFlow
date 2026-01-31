import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task, PaginatedResponse, TaskStatus } from '@/types';
import { toast } from 'sonner';

const TASKS_KEY = ['tasks'];

interface TaskFilters {
  status?: TaskStatus;
  folder_id?: string;
  is_deleted?: boolean;
  search?: string;
}

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: [...TASKS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.folder_id) params.append('folder_id', filters.folder_id);
      if (filters?.is_deleted !== undefined) params.append('is_deleted', String(filters.is_deleted));
      if (filters?.search) params.append('search', filters.search);
      
      const response = await api.get<PaginatedResponse<Task>>(`/tasks?${params}`);
      return response.data;
    },
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: async () => {
      const response = await api.get<Task>(`/tasks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await api.post<Task>('/tasks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Task created');
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const response = await api.patch<Task>(`/tasks/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      const previousTasks = queryClient.getQueryData<PaginatedResponse<Task>>(TASKS_KEY);
      
      if (previousTasks) {
        queryClient.setQueryData<PaginatedResponse<Task>>(TASKS_KEY, {
          ...previousTasks,
          items: previousTasks.items.map((task) =>
            task.id === id ? { ...task, ...data } : task
          ),
        });
      }
      
      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      const previousTasks = queryClient.getQueryData<PaginatedResponse<Task>>(TASKS_KEY);
      
      if (previousTasks) {
        queryClient.setQueryData<PaginatedResponse<Task>>(TASKS_KEY, {
          ...previousTasks,
          items: previousTasks.items.map((task) =>
            task.id === id ? { ...task, is_deleted: true } : task
          ),
        });
      }
      
      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Failed to delete task');
    },
    onSuccess: () => {
      toast.success('Task moved to trash');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
};

export const useRestoreTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patch<Task>(`/tasks/${id}/restore`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      toast.success('Task restored');
    },
    onError: () => {
      toast.error('Failed to restore task');
    },
  });
};

export const useToggleTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const response = await api.patch<Task>(`/tasks/${id}`, { status });
      return response.data;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      
      const previousTasks = queryClient.getQueryData<PaginatedResponse<Task>>(TASKS_KEY);
      
      if (previousTasks) {
        queryClient.setQueryData<PaginatedResponse<Task>>(TASKS_KEY, {
          ...previousTasks,
          items: previousTasks.items.map((task) =>
            task.id === id ? { ...task, status, completed_at: status === 'done' ? new Date().toISOString() : undefined } : task
          ),
        });
      }
      
      return { previousTasks };
    },
    onError: (_, __, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(TASKS_KEY, context.previousTasks);
      }
      toast.error('Failed to update task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
};
