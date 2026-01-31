import axios from 'axios';
import type { NotificationList, Notification, UnreadCountResponse, MessageResponse } from '@/types/api';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  skip: number = 0,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<NotificationList> {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: getAuthHeader(),
    params: { skip, limit, unread_only: unreadOnly },
  });
  return response.data;
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await axios.get(`${API_URL}/notifications/unread-count`, {
    headers: getAuthHeader(),
  });
  return response.data;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<Notification> {
  const response = await axios.patch(
    `${API_URL}/notifications/${notificationId}/read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<MessageResponse> {
  const response = await axios.patch(
    `${API_URL}/notifications/mark-all-read`,
    {},
    { headers: getAuthHeader() }
  );
  return response.data;
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<MessageResponse> {
  const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
    headers: getAuthHeader(),
  });
  return response.data;
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<MessageResponse> {
  const response = await axios.delete(`${API_URL}/notifications`, {
    headers: getAuthHeader(),
  });
  return response.data;
}
