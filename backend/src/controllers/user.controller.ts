import { Request, Response } from 'express';
import * as userService from '@/services/user.service';

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await userService.getUserById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(user);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, bio, avatarUrl } = req.body;
    const updatedUser = await userService.updateProfile(userId, { name, bio, avatarUrl });
    
    return res.json(updatedUser);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
