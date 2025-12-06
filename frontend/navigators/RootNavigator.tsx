import React from "react";

import DrawerNavigation from "../components/DrawerNavigation";
import { createStackNavigator } from "@react-navigation/stack";
import HomeStack from "./HomeStackNavigator";
import CreateEditEvent from "../pages/MyEvent/AddEvent";
import EditProfile from "../pages/Profile/EditProfile";
import Notification from "../pages/Notification_Review/Notification";
import Search from "../pages/Search_Filter/Search";
import Filter from "../pages/Search_Filter/Filter";
import Events from "../pages/MyEvent/Events";
import EventDetails from "../pages/MyEvent/EventDetails";
import OrganizerProfile from "../pages/Profile/OrganizerProfile";
import InviteFriend from "../pages/Communication/InviteFriend";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Drawer + Tabs */}
      <Stack.Screen name="Drawer" component={DrawerNavigation} />

      {/* GLOBAL SCREENS */}
      <Stack.Screen name="Notifications" component={Notification} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEvent} />
      <Stack.Screen name="BookMark" component={HomeStack} />
      <Stack.Screen name="Message" component={HomeStack} />
      <Stack.Screen name="Setting" component={HomeStack} />
      <Stack.Screen name="SignOut" component={HomeStack} />

      
      
      <Stack.Screen name="Search" component={Search} />  
      <Stack.Screen name="Filter" component={Filter} />
      <Stack.Screen name="EventDetails" component={EventDetails}/>
      <Stack.Screen name="InviteFriend" component={InviteFriend}/>
      <Stack.Screen name="MyEvent" component={Events} />
      <Stack.Screen name="EditProfile" component={EditProfile}/>
      <Stack.Screen name="OrganizerProfile" component={OrganizerProfile}/>
    </Stack.Navigator>
  );
}
