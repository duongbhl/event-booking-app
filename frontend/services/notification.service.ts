import api from "./api";
import { authHeader } from "./auHeader";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

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

// ============ PUSH NOTIFICATIONS ============

/**
 * Setup notification handler
 */
export const setupNotificationHandler = () => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
    if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push notification permission');
            return null;
        }

        // Get Expo push token
        const token = await Notifications.getExpoPushTokenAsync();
        return token.data;
    } catch (error) {
        console.error('Failed to get push token:', error);
        return null;
    }
};

/**
 * Register push token with backend
 */
export const registerPushToken = async (token: string, authToken: string) => {
    try {
        if (!token || !authToken) return false;
        
        const response = await api.post(
            '/users/push-token',
            { token },
            authHeader(authToken)
        );
        console.log('Push token registered successfully');
        return true;
    } catch (error) {
        console.error('Failed to register push token:', error);
        return false;
    }
};

/**
 * Initialize push notifications on app startup
 */
export const initializePushNotifications = async (authToken: string) => {
    try {
        setupNotificationHandler();
        const token = await requestNotificationPermission();
        
        if (token && authToken) {
            const registered = await registerPushToken(token, authToken);
            return registered;
        }
        
        return false;
    } catch (error) {
        console.error('Failed to initialize push notifications:', error);
        return false;
    }
};

/**
 * Setup notification listeners for foreground and background handling
 */
export const setupNotificationListeners = (
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationSelected?: (notification: Notifications.Notification) => void
) => {
    // Listen for notifications when app is in foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener((notification: any) => {
        console.log('Notification received:', notification);
        if (onNotificationReceived) {
            onNotificationReceived(notification);
        }
    });

    // Listen for notification taps
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
        console.log('Notification tapped:', response);
        if (onNotificationSelected) {
            onNotificationSelected(response.notification);
        }
    });

    // Return cleanup function
    return () => {
        foregroundSubscription.remove();
        backgroundSubscription.remove();
    };
};
