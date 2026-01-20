export interface Team {
  _id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayload {
  name: string;
  members?: string[];
}

export interface AddMemberPayload {
  teamId: string;
  userId: string;
}
