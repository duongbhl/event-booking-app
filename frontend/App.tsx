import React, { use } from 'react';
import { createStaticNavigation, NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import "./global.css";
import MainTabs from './components/MainTabs';
import CustomDrawer from './components/CustomDrawer';
import AdminHomeScreen from './pages/Admin';
import SignInScreen from './pages/SignIn';
import SignUpScreen from './pages/SIgnUp';
import VerificationScreen from './pages/Verification';
import SelectInterestScreen from './pages/SelectInterest';
import ResetPasswordScreen from './pages/ResetPassword';
import EditProfileScreen from './pages/EditProfile';
import NotificationScreen from './pages/Notification';
import RootNavigator from './navigates/RootNavigator';



export default function App() {

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  )
}






