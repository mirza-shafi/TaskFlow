import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Note, PaginatedResponse } from '@/types';
import { toast } from 'sonner';

const NOTES_KEY = ['notes'];

interface NoteFilters {
  folder_id?: string;
  is_pinned?: boolean;
  is_favorite?: boolean;
  is_deleted?: boolean;
  search?: string;
}

export const useNotes = (filters?: NoteFilters) => {
  return useQuery({
    queryKey: [...NOTES_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.folder_id) params.append('folder_id', filters.folder_id);
      if (filters?.is_pinned !== undefined) params.append('is_pinned', String(filters.is_pinned));
      if (filters?.is_favorite !== undefined) params.append('is_favorite', String(filters.is_favorite));
      if (filters?.is_deleted !== undefined) params.append('is_deleted', String(filters.is_deleted));
      if (filters?.search) params.append('search', filters.search);
      
      const response = await api.get<PaginatedResponse<Note>>(`/notes?${params}`);
      return response.data;
    },
  });
};

export const useNote = (id: string) => {
  return useQuery({
    queryKey: [...NOTES_KEY, id],
    queryFn: async () => {
      const response = await api.get<Note>(`/notes/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Note>) => {
      const response = await api.post<Note>('/notes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      toast.success('Note created');
    },
    onError: () => {
      toast.error('Failed to create note');
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Note> }) => {
      const response = await api.patch<Note>(`/notes/${id}`, data);
      return response.data;
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_KEY });
      
      const previousNotes = queryClient.getQueryData<PaginatedResponse<Note>>(NOTES_KEY);
      
      if (previousNotes) {
        queryClient.setQueryData<PaginatedResponse<Note>>(NOTES_KEY, {
          ...previousNotes,
          items: previousNotes.items.map((note) =>
            note.id === id ? { ...note, ...data } : note
          ),
        });
      }
      
      return { previousNotes };
    },
    onError: (_, __, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_KEY, context.previousNotes);
      }
      toast.error('Failed to update note');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      toast.success('Note deleted');
    },
    onError: () => {
      toast.error('Failed to delete note');
    },
  });
};

export const useToggleNotePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_pinned }: { id: string; is_pinned: boolean }) => {
      const response = await api.patch<Note>(`/notes/${id}`, { is_pinned });
      return response.data;
    },
    onMutate: async ({ id, is_pinned }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_KEY });
      
      const previousNotes = queryClient.getQueryData<PaginatedResponse<Note>>(NOTES_KEY);
      
      if (previousNotes) {
        queryClient.setQueryData<PaginatedResponse<Note>>(NOTES_KEY, {
          ...previousNotes,
          items: previousNotes.items.map((note) =>
            note.id === id ? { ...note, is_pinned } : note
          ),
        });
      }
      
      return { previousNotes };
    },
    onError: (_, __, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
};

export const useToggleNoteFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_favorite }: { id: string; is_favorite: boolean }) => {
      const response = await api.patch<Note>(`/notes/${id}`, { is_favorite });
      return response.data;
    },
    onMutate: async ({ id, is_favorite }) => {
      await queryClient.cancelQueries({ queryKey: NOTES_KEY });
      
      const previousNotes = queryClient.getQueryData<PaginatedResponse<Note>>(NOTES_KEY);
      
      if (previousNotes) {
        queryClient.setQueryData<PaginatedResponse<Note>>(NOTES_KEY, {
          ...previousNotes,
          items: previousNotes.items.map((note) =>
            note.id === id ? { ...note, is_favorite } : note
          ),
        });
      }
      
      return { previousNotes };
    },
    onError: (_, __, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(NOTES_KEY, context.previousNotes);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
};
