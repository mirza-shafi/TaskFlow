import apiClient from './config';
import { Note, NoteCreate, NoteUpdate, NoteCollaborator, MessageResponse } from '@/types/api';

// ============================================
// Notes API
// ============================================

/**
 * Get all notes with optional filters
 */
export const getNotes = async (params?: {
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
}): Promise<Note[]> => {
  const response = await apiClient.get<{ notes: Note[]; total: number }>('/notes', { params });
  return response.data.notes;
};

/**
 * Get favorite notes
 */
export const getFavoriteNotes = async (): Promise<Note[]> => {
  const response = await apiClient.get<{ notes: Note[]; total: number }>('/notes/favorites');
  return response.data.notes;
};

/**
 * Create a new note
 */
export const createNote = async (data: NoteCreate): Promise<Note> => {
  const response = await apiClient.post<Note>('/notes', data);
  return response.data;
};

/**
 * Get a single note by ID
 */
export const getNote = async (noteId: string): Promise<Note> => {
  const response = await apiClient.get<Note>(`/notes/${noteId}`);
  return response.data;
};

/**
 * Update a note
 */
export const updateNote = async (noteId: string, data: NoteUpdate): Promise<Note> => {
  const response = await apiClient.put<Note>(`/notes/${noteId}`, data);
  return response.data;
};

/**
 * Pin or unpin a note
 */
export const pinNote = async (noteId: string, isPinned: boolean): Promise<Note> => {
  const response = await apiClient.patch<Note>(`/notes/${noteId}/pin`, { isPinned });
  return response.data;
};

/**
 * Soft delete a note (move to trash)
 */
export const deleteNote = async (noteId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/notes/${noteId}`);
  return response.data;
};

/**
 * Get all trashed notes
 */
export const getTrashedNotes = async (): Promise<Note[]> => {
  const response = await apiClient.get<{ notes: Note[]; total: number }>('/notes/trash/all');
  return response.data.notes;
};

/**
 * Restore a note from trash
 */
export const restoreNote = async (noteId: string): Promise<Note> => {
  const response = await apiClient.post<Note>(`/notes/${noteId}/restore`);
  return response.data;
};

/**
 * Permanently delete a note
 */
export const permanentlyDeleteNote = async (noteId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/notes/${noteId}/permanent`);
  return response.data;
};

/**
 * Invite a collaborator by email
 */
export const inviteNoteCollaborator = async (
  noteId: string,
  data: { email: string; role?: 'viewer' | 'editor' }
): Promise<Note> => {
  const response = await apiClient.post<Note>(`/notes/${noteId}/invite`, data);
  return response.data;
};

/**
 * Get note collaborators
 */
export const getNoteCollaborators = async (noteId: string): Promise<NoteCollaborator[]> => {
  const response = await apiClient.get<NoteCollaborator[]>(`/notes/${noteId}/collaborators`);
  return response.data;
};

/**
 * Remove a collaborator from a note
 */
export const removeNoteCollaborator = async (
  noteId: string,
  collaboratorId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(
    `/notes/${noteId}/collaborators/${collaboratorId}`
  );
  return response.data;
};
