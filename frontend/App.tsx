import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminHomeScreen from './pages/Admin';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <AdminHomeScreen></AdminHomeScreen>
  );
}
