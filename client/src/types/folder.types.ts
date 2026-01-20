export interface Folder {
  _id: string;
  name: string;
  color?: string;
  isPrivate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFolderPayload {
  name: string;
  color?: string;
  isPrivate?: boolean;
}
