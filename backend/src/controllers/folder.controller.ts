import { Request, Response } from 'express';
import * as folderService from '@/services/folder.service';

export const createFolder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, color, isPrivate } = req.body;
    const folder = await folderService.createFolder({ name, user: userId, color, isPrivate });
    
    return res.status(201).json(folder);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFolders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const folders = await folderService.getFoldersByUser(userId);
    return res.json(folders);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFolder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await folderService.deleteFolder(id);
    return res.status(204).send();
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
