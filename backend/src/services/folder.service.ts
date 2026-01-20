import Folder, { IFolderDocument } from '@/models/Folder.model';

export const createFolder = async (folderData: { name: string; user: string; color?: string; isPrivate?: boolean }): Promise<IFolderDocument> => {
  const folder = new Folder(folderData);
  return folder.save();
};

export const getFoldersByUser = async (userId: string): Promise<IFolderDocument[]> => {
  return Folder.find({ user: userId });
};

export const deleteFolder = async (id: string): Promise<IFolderDocument | null> => {
  return Folder.findByIdAndDelete(id);
};
