import React from 'react';
import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import "./global.css";
import CalendarScreen from './pages/Calendar';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './pages/Home';
import ProfileScreen from './pages/Profile';
import NotificationScreen from './pages/Notification';
import CreateEventScreen from './pages/CreateEvent';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabs from './components/MainTabs';
import SelectLocationScreen from './pages/SelectLocation';




export default function App() {
  return (
    <>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </>



  )
}






