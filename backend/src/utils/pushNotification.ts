import axios from 'axios';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface PushNotificationPayload {
    to: string; // Expo push token
    title: string;
    body: string;
    data?: Record<string, any>;
}

const isValidExpoPushToken = (token?: string | null) => {
    if (!token) return false;
    return token.startsWith('ExponentPushToken') || token.startsWith('ExpoPushToken');
};

/**
 * Send push notification using Expo Push Notification Service
 */
export const sendPushNotification = async (payload: PushNotificationPayload) => {
    try {
        // Don't send if token is not available
        if (!isValidExpoPushToken(payload.to)) {
            console.log('Invalid push token:', payload.to);
            return false;
        }

        const response = await axios.post(EXPO_PUSH_URL, {
            to: payload.to,
            sound: 'default',
            title: payload.title,
            body: payload.body,
            data: payload.data || {},
            badge: 1,
        });

        console.log('Push notification sent successfully:', response.data);
        return true;
    } catch (error) {
        console.error('Failed to send push notification:', error);
        return false;
    }
};

/**
 * Send push notifications to multiple users
 */
export const sendPushNotifications = async (
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
) => {
    try {
        const validTokens = tokens.filter(isValidExpoPushToken);
        
        if (validTokens.length === 0) {
            console.log('No valid push tokens');
            return;
        }

        // Send in batches (Expo API recommends batching)
        const batchSize = 100;
        for (let i = 0; i < validTokens.length; i += batchSize) {
            const batch = validTokens.slice(i, i + batchSize);
            const messages = batch.map(to => ({
                to,
                sound: 'default',
                title,
                body,
                data: data || {},
                badge: 1,
            }));

            await axios.post(EXPO_PUSH_URL, messages);
        }

        console.log(`Push notifications sent to ${validTokens.length} users`);
    } catch (error) {
        console.error('Failed to send push notifications:', error);
    }
};
