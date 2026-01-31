export interface NoteCollaborator {
  userId: string;
  email: string;
  role: 'viewer' | 'editor';
  addedAt: string;
}

export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string; // Rich text HTML or JSON
  folderId?: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  collaborators: NoteCollaborator[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
}

export interface NotePinUpdate {
  isPinned: boolean;
}

export interface NoteInvite {
  email: string;
  role: 'viewer' | 'editor';
}
