export interface TeamMember {
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface TeamActivity {
  _id: string;
  teamId: string;
  userId: string;
  userName: string;
  action: string;
  resourceType: 'task' | 'note' | 'folder' | 'member';
  resourceId?: string;
  resourceName?: string;
  timestamp: string;
}

export interface Team {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamPayload {
  name: string;
  description?: string;
  members?: string[];
}

export interface AddMemberPayload {
  teamId: string;
  userId: string;
}

