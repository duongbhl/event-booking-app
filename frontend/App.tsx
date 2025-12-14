import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import "./global.css";
import RootNavigator from './navigators/RootNavigator';
import { AuthProvider } from './context/AuthContext';

export default function App() {

  return (
    <>
      <AuthProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </>
  )
}






