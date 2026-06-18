import React, { useEffect, useRef } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import "./global.css";
import RootNavigator from './navigators/RootNavigator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { setupNotificationListeners, setupNotificationHandler } from './services/notification.service';

export const navigationRef = createNavigationContainerRef<any>();

const navigateFromNotification = (notification?: Notifications.Notification | null) => {
  const data = notification?.request?.content?.data as Record<string, any> | undefined;
  const roomId = data?.roomId;
  const eventId = data?.eventId;

  if (!navigationRef.isReady()) {
    return;
  }

  if (roomId) {
    navigationRef.navigate("Chat", { roomId });
    return;
  }

  if (eventId) {
    navigationRef.navigate("EventDetails", { eventId });
  }
};

function AppContent() {
  const { user, token } = useAuth();
  const lastNotificationHandledRef = useRef<string | null>(null);
  const pendingNotificationRef = useRef<Notifications.Notification | null>(null);

  const handleNotificationNavigation = (notification?: Notifications.Notification | null) => {
    const data = notification?.request?.content?.data as Record<string, any> | undefined;
    const roomId = data?.roomId;
    const eventId = data?.eventId;

    if (!roomId && !eventId) {
      return;
    }

    if (!navigationRef.isReady()) {
      if (notification) {
        pendingNotificationRef.current = notification;
      }
      return;
    }

    navigateFromNotification(notification);
  };

  useEffect(() => {
    // Setup notification handler and listeners on app start
    setupNotificationHandler();
    
    const unsubscribe = setupNotificationListeners(
      (notification) => {
        // Handle notification received in foreground
        console.log('Notification received in foreground:', notification);
      },
      (notification) => {
        // Handle notification tap
        console.log('Notification tapped:', notification);
        handleNotificationNavigation(notification);
      }
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      const notificationId = response?.notification.request.identifier;

      if (!notificationId || lastNotificationHandledRef.current === notificationId) {
        return;
      }

      lastNotificationHandledRef.current = notificationId;
      handleNotificationNavigation(response.notification);
    });
  }, [token, user]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        if (pendingNotificationRef.current) {
          handleNotificationNavigation(pendingNotificationRef.current);
          pendingNotificationRef.current = null;
        }
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocalizationProvider>
        <AppContent />
      </LocalizationProvider>
    </AuthProvider>
  )
}





