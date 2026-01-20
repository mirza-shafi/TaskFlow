import { Request, Response } from 'express';
import * as teamService from '@/services/team.service';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, members } = req.body;
    const team = await teamService.createTeam({ name, owner: userId, members });
    
    return res.status(201).json(team);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const teams = await teamService.getTeamsByUser(userId);
    return res.json(teams);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const { teamId, userId } = req.body;
    const team = await teamService.addMember(teamId, userId);
    return res.json(team);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
