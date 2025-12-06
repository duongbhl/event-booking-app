import React from "react";


import { createStackNavigator } from "@react-navigation/stack";
import CreateEditEvent from "../pages/MyEvent/AddEvent";
import EditProfile from "../pages/Profile/EditProfile";
import Notification from "../pages/Notification_Review/Notification";
import Search from "../pages/Search_Filter/Search";
import Filter from "../pages/Search_Filter/Filter";
import Events from "../pages/MyEvent/Events";
import EventDetails from "../pages/MyEvent/EventDetails";
import OrganizerProfile from "../pages/Profile/OrganizerProfile";
import InviteFriend from "../pages/Communication/InviteFriend";
import DrawerNavigation from "../components/Navigators_UI/Navigators";
import Home from "../pages/Home";

const Stack = createStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      
      {/* Drawer + Tabs */}
      <Stack.Screen name="Drawer" component={DrawerNavigation} />

      {/* GLOBAL SCREENS */}
      <Stack.Screen name="Notifications" component={Notification} />
      <Stack.Screen name="CreateEditEvent" component={CreateEditEvent} />
      <Stack.Screen name="BookMark" component={Home} />
      <Stack.Screen name="Message" component={Home} />
      <Stack.Screen name="Setting" component={Home} />
      <Stack.Screen name="SignOut" component={Home} />

      
      
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
