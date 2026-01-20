import Team, { ITeamDocument } from '@/models/Team.model';

export const createTeam = async (teamData: { name: string; owner: string; members?: string[] }): Promise<ITeamDocument> => {
  const team = new Team({
    ...teamData,
    members: teamData.members || [teamData.owner]
  });
  return team.save();
};

export const getTeamsByUser = async (userId: string): Promise<ITeamDocument[]> => {
  return Team.find({ members: userId }).populate('owner', 'name email avatarUrl');
};

export const addMember = async (teamId: string, userId: string): Promise<ITeamDocument | null> => {
  return Team.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: userId } },
    { new: true }
  );
};
