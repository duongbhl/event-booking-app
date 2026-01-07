import api from "./api";
import { authHeader } from "./auHeader";

/**
 * Get all notifications for current user
 */
export const getNotifications = async (token: string) => {
  const res = await api.get("/notifications/me", authHeader(token));
  return res.data;
};

/**
 * Mark all notifications as read
 */
export const markNotificationsAsRead = async (token: string) => {
  const res = await api.post("/notifications/read", {}, authHeader(token));
  return res.data;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  notificationId: string,
  token: string
) => {
  const res = await api.delete(`/notifications/${notificationId}`, authHeader(token));
  return res.data;
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (token: string) => {
  try {
    const notifications = await getNotifications(token);
    const unreadCount = notifications.filter((n: any) => !n.isRead).length;
    return unreadCount;
  } catch (error) {
    return 0;
  }
};
