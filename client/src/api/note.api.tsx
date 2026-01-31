import axios from 'axios';
import { Note, CreateNotePayload, UpdateNotePayload, NoteInvite, NoteCollaborator } from '../types/note.types';
import API_URL from './config';

const NOTES_URL = `${API_URL}/notes`;

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('userToken');
  return { Authorization: `Bearer ${token}` };
};

// Get all notes with optional filters
export const getNotes = async (filters?: {
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
}): Promise<Note[]> => {
  const params = new URLSearchParams();
  if (filters?.folderId) params.append('folder_id', filters.folderId);
  if (filters?.tags) filters.tags.forEach(tag => params.append('tags', tag));
  if (filters?.isPinned !== undefined) params.append('is_pinned', String(filters.isPinned));
  if (filters?.isFavorite !== undefined) params.append('is_favorite', String(filters.isFavorite));

  const response = await axios.get<Note[]>(`${NOTES_URL}?${params.toString()}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get favorite/starred notes
export const getFavoriteNotes = async (): Promise<Note[]> => {
  const response = await axios.get<Note[]>(`${NOTES_URL}/favorites`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Create a new note
export const createNote = async (noteData: CreateNotePayload): Promise<Note> => {
  const response = await axios.post<Note>(NOTES_URL, noteData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get a single note by ID
export const getNote = async (noteId: string): Promise<Note> => {
  const response = await axios.get<Note>(`${NOTES_URL}/${noteId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Update a note
export const updateNote = async (noteId: string, noteData: UpdateNotePayload): Promise<Note> => {
  const response = await axios.put<Note>(`${NOTES_URL}/${noteId}`, noteData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Pin or unpin a note
export const pinNote = async (noteId: string, isPinned: boolean): Promise<Note> => {
  const response = await axios.put<Note>(`${NOTES_URL}/${noteId}/pin`, { isPinned }, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Soft delete a note (move to trash)
export const deleteNote = async (noteId: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${NOTES_URL}/${noteId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get trashed notes
export const getTrashedNotes = async (): Promise<Note[]> => {
  const response = await axios.get<Note[]>(`${NOTES_URL}/trash/all`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Restore a note from trash
export const restoreNote = async (noteId: string): Promise<Note> => {
  const response = await axios.post<Note>(`${NOTES_URL}/${noteId}/restore`, {}, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Permanently delete a note
export const permanentlyDeleteNote = async (noteId: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`${NOTES_URL}/${noteId}/permanent`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Invite a collaborator to a note
export const inviteNoteCollaborator = async (noteId: string, inviteData: NoteInvite): Promise<Note> => {
  const response = await axios.post<Note>(`${NOTES_URL}/${noteId}/collaborators/invite`, inviteData, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Get note collaborators
export const getNoteCollaborators = async (noteId: string): Promise<NoteCollaborator[]> => {
  const response = await axios.get<NoteCollaborator[]>(`${NOTES_URL}/${noteId}/collaborators`, {
    headers: getAuthHeader()
  });
  return response.data;
};

// Remove a collaborator from a note
export const removeNoteCollaborator = async (noteId: string, collaboratorId: string): Promise<Note> => {
  const response = await axios.delete<Note>(`${NOTES_URL}/${noteId}/collaborators/${collaboratorId}`, {
    headers: getAuthHeader()
  });
  return response.data;
};
