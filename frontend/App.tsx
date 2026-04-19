import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import "./global.css";
import RootNavigator from './navigators/RootNavigator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocalizationProvider } from './context/LocalizationContext';
import { setupNotificationListeners, setupNotificationHandler } from './services/notification.service';

function AppContent() {
  const { user, token } = useAuth();

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
        // You can navigate to specific screen based on notification data
        // For example: navigate to Notifications screen
      }
    );

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
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






