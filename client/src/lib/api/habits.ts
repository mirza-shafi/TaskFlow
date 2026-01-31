import apiClient from './config';
import {
  Habit,
  HabitCreate,
  HabitUpdate,
  HabitLog,
  HabitWithStreak,
  HabitCollaborator,
  MessageResponse,
} from '@/types/api';

// ============================================
// Habits API
// ============================================

/**
 * Get all habits with optional filters
 */
export const getHabits = async (params?: {
  isActive?: boolean;
  category?: string;
  date?: string;
}): Promise<Habit[]> => {
  // Map camelCase to snake_case for backend
  const queryParams: any = {};
  if (params?.isActive !== undefined) queryParams.is_active = params.isActive;
  if (params?.category) queryParams.category = params.category;
  if (params?.date) queryParams.date = params.date;

  const response = await apiClient.get<{ habits: Habit[]; total: number }>('/habits', { params: queryParams });
  return response.data.habits;
};

/**
 * Create a new habit
 */
export const createHabit = async (data: HabitCreate): Promise<Habit> => {
  const response = await apiClient.post<Habit>('/habits', data);
  return response.data;
};

/**
 * Get a single habit by ID with streak info
 */
export const getHabit = async (habitId: string): Promise<HabitWithStreak> => {
  const response = await apiClient.get<HabitWithStreak>(`/habits/${habitId}`);
  return response.data;
};

/**
 * Update a habit
 */
export const updateHabit = async (habitId: string, data: HabitUpdate): Promise<Habit> => {
  // Use PATCH instead of PUT to match backend
  const response = await apiClient.patch<Habit>(`/habits/${habitId}`, data);
  return response.data;
};

/**
 * Archive a habit (soft delete)
 */
export const deleteHabit = async (habitId: string): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/habits/${habitId}`);
  return response.data;
};

/**
 * Log a habit completion
 */
export const logHabitCompletion = async (
  habitId: string,
  data: HabitLog
): Promise<{ message: string; log: HabitLog }> => {
  // Use plural /logs endpoint
  const response = await apiClient.post<{ message: string; log: HabitLog }>(
    `/habits/${habitId}/logs`,
    data
  );
  return response.data;
};

/**
 * Delete a habit log entry
 */
export const deleteHabitLog = async (
  habitId: string,
  logDate: string
): Promise<MessageResponse> => {
  // Use plural /logs endpoint
  const response = await apiClient.delete<MessageResponse>(`/habits/${habitId}/logs/${logDate}`);
  return response.data;
};

/**
 * Get habit logs with optional date range
 */
export const getHabitLogs = async (
  habitId: string,
  params?: { startDate?: string; endDate?: string }
): Promise<HabitLog[]> => {
  const response = await apiClient.get<HabitLog[]>(`/habits/${habitId}/logs`, { params });
  return response.data;
};

/**
 * Get all habit logs for a month
 */
export const getMonthlyLogs = async (
  month: number,
  year: number
): Promise<Record<string, HabitLog[]>> => {
  const response = await apiClient.get<Record<string, HabitLog[]>>('/habits/logs/monthly', {
    params: { month, year },
  });
  return response.data;
};

/**
 * Share a habit with another user
 */
export const shareHabit = async (
  habitId: string,
  data: { userId?: string; email?: string; accessType?: 'viewer' | 'collaborator' }
): Promise<Habit> => {
  const response = await apiClient.post<Habit>(`/habits/${habitId}/share`, data);
  return response.data;
};

/**
 * Unshare a habit
 */
export const unshareHabit = async (
  habitId: string,
  userId: string
): Promise<MessageResponse> => {
  const response = await apiClient.delete<MessageResponse>(`/habits/${habitId}/share/${userId}`);
  return response.data;
};

/**
 * Get habit collaborators
 */
export const getHabitCollaborators = async (habitId: string): Promise<HabitCollaborator[]> => {
  const response = await apiClient.get<HabitCollaborator[]>(`/habits/${habitId}/collaborators`);
  return response.data;
};

/**
 * Get heatmap data
 */
export const getHeatmap = async (): Promise<{ date: string; count: number }[]> => {
  const response = await apiClient.get<{ date: string; count: number }[]>('/habits/heatmap');
  return response.data;
};
