// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_verified: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  full_name: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string;
  folder_id?: string;
  user_id: string;
  team_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  is_deleted: boolean;
  tags: string[];
  order: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon?: string;
  user_id: string;
  team_id?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

// Note Types
export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  user_id: string;
  folder_id?: string;
  is_pinned: boolean;
  is_favorite: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  tags: string[];
}

// Habit Types
export interface Habit {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  frequency: HabitFrequency;
  target_count: number;
  user_id: string;
  team_id?: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export type HabitFrequency = 'daily' | 'weekly' | 'monthly';

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  count: number;
  note?: string;
  created_at: string;
}

export interface HabitStreak {
  habit_id: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  last_completed?: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar_url?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  member_count: number;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  user: User;
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: string;
  created_at: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

// Analytics Types
export interface DashboardStats {
  tasks_completed_today: number;
  tasks_completed_week: number;
  active_habits: number;
  current_streak: number;
  notes_count: number;
  teams_count: number;
}

export interface ActivityItem {
  id: string;
  type: 'task_completed' | 'habit_logged' | 'note_created' | 'team_joined';
  description: string;
  user: User;
  created_at: string;
  metadata?: Record<string, any>;
}

// API Response Types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}
