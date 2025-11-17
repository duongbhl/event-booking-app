import React from "react";

import NotificationScreen from "../pages/Notification";
import CreateEventScreen from "../pages/CreateEvent";
import EditProfileScreen from "../pages/EditProfile";
import DrawerNavigation from "../components/DrawerNavigation";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStackNavigator";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Drawer + Tabs */}
      <Stack.Screen name="Drawer" component={DrawerNavigation} />

      {/* GLOBAL SCREENS */}
      <Stack.Screen name="Notifications" component={NotificationScreen} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
      <Stack.Screen name="BookMark" component={HomeStack} />
      <Stack.Screen name="Setting" component={HomeStack} />
      <Stack.Screen name="SignOut" component={HomeStack} />
    </Stack.Navigator>
  );
}
