// ============================================
// User & Auth Types
// ============================================

export interface NotificationPreferences {
  emailNotifications: boolean;
  taskAssigned: boolean;
  taskShared: boolean;
  noteShared: boolean;
  teamInvite: boolean;
  teamMemberAdded: boolean;
  habitMilestone: boolean;
  habitShared: boolean;
  folderShared: boolean;
  commentAdded: boolean;
  mention: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  appearance?: AppearanceSettings;
  notificationPreferences?: NotificationPreferences;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppearanceSettings {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: 'small' | 'medium' | 'large';
  language?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface Session {
  _id: string;
  userId: string;
  deviceInfo: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ipAddress?: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
}

// ============================================
// Task Types
// ============================================

export interface Label {
  name: string;
  color: string;
}

export interface Subtask {
  title: string;
  completed: boolean;
}

export interface Attachment {
  filename: string;
  url: string;
  fileType: string;
  size?: number;
  uploadedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  folderId?: string;
  teamId?: string;
  userId: string;
  assignedTo?: string[];
  sharedWith?: TaskCollaborator[];
  color?: string;
  labels?: Label[];
  position?: number;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCollaborator {
  userId: string;
  email: string;
  role: 'viewer' | 'editor' | 'assignee';
  addedAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  folderId?: string;
  teamId?: string;
  color?: string;
  labels?: Label[];
  position?: number;
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'todo' | 'doing' | 'done';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  tags?: string[];
  folderId?: string;
  color?: string;
  labels?: Label[];
  position?: number;
  subtasks?: Subtask[];
  attachments?: Attachment[];
}

// ============================================
// Note Types
// ============================================

export interface Note {
  _id: string;
  title: string;
  content: string;
  folderId?: string;
  tags?: string[];
  color?: string;  // Hex color code for note background
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  userId: string;
  sharedWith?: NoteCollaborator[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NoteCollaborator {
  userId: string;
  email: string;
  role: 'viewer' | 'editor';
  addedAt: string;
}

export interface NoteCreate {
  title: string;
  content?: string;
  folderId?: string;
  tags?: string[];
  color?: string;  // Hex color code
  isPinned?: boolean;
  isFavorite?: boolean;
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
  color?: string;  // Hex color code
  isPinned?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
}

// ============================================
// Habit Types
// ============================================

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  category: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  goal?: number;
  reminderTime?: string;
  color?: string;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
  completedToday?: boolean;
}

export interface HabitCollaborator {
  userId: string;
  email: string;
  accessType: 'viewer' | 'collaborator';
  addedAt: string;
}

export interface HabitLog {
  date: string;
  completed: boolean;
  notes?: string;
}

export interface HabitCreate {
  name: string;
  description?: string;
  category?: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'other';
  frequency?: 'daily' | 'weekly' | 'custom';
  goal?: number;
  reminderTime?: string;
  color?: string;
  isActive?: boolean;
}

export interface HabitUpdate {
  name?: string;
  description?: string;
  category?: 'health' | 'fitness' | 'productivity' | 'mindfulness' | 'learning' | 'social' | 'other';
  frequency?: 'daily' | 'weekly' | 'custom';
  goal?: number;
  reminderTime?: string;
  color?: string;
  isActive?: boolean;
}

export interface HabitWithStreak extends Habit {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

// ============================================
// Analytics Types
// ============================================

export interface StreakInfo {
  habitId: string;
  habitName: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface AnalyticsSummary {
  totalHabits: number;
  activeHabits: number;
  completionRate: number;
  currentMonthCompletions: number;
  totalCompletions: number;
  averageStreak: number;
  topStreaks: StreakInfo[];
}

export interface HeatmapData {
  date: string;
  completions: number;
  habits: string[];
}

export interface SocialFeedItem {
  userId: string;
  habitId: string;
  habitName: string;
  userName: string;
  completedAt: string;
  streak: number;
  notes?: string;
}

// ============================================
// Folder Types
// ============================================

export interface Folder {
  _id: string;
  name: string;
  color?: string;
  userId: string;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderCreate {
  name: string;
  color?: string;
}

export interface FolderUpdate {
  name?: string;
  color?: string;
}

// ============================================
// Team Types
// ============================================

export interface Team {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface TeamCreate {
  name: string;
  description?: string;
}

export interface TeamUpdate {
  name?: string;
  description?: string;
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

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'task_assigned'
  | 'task_shared'
  | 'note_shared'
  | 'team_invite'
  | 'team_member_added'
  | 'habit_milestone'
  | 'habit_shared'
  | 'folder_shared'
  | 'comment_added'
  | 'mention'
  | 'system';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  metadata: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationList {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  count: number;
}

// ============================================
// Common Response Types
// ============================================

export interface MessageResponse {
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
