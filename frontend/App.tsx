import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminHomeScreen from './pages/Admin';
import SignInScreen from './pages/SignIn';
import "./global.css";
import SelectInterestScreen from './pages/SelectInterest';
import SelectLocationScreen from './pages/SelectLocation';
import CalendarScreen from './pages/Calendar';


const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <CalendarScreen></CalendarScreen>
  );
}
