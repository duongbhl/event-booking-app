// Navigators.tsx
import React from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import {
  createDrawerNavigator,
  DrawerNavigationOptions,
} from "@react-navigation/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";

// Screens
import Calendar from "../../pages/Calendar/Calendar";
import SelectLocation from "../../pages/Registration/SelectLocation";
import Profile from "../../pages/Profile/Profile";

// UI

import Home from "../../pages/Home";
import { CustomDrawer, CustomTabBar } from "./CustomUI";
import Location from "../../pages/Location/Location";

export type RootTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Location: undefined;
  Profile: undefined;
};

export type RootDrawerParamList = {
  MainTabs: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

// ----------------------- BOTTOM TABS -----------------------
export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={tabIcon("home", "home-outline")}
      />

      <Tab.Screen
        name="Calendar"
        component={Calendar}
        options={tabIcon("calendar", "calendar-outline")}
      />

      <Tab.Screen
        name="Location"
        component={Location}
        options={tabIcon("location", "location-outline")}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={tabIcon("person", "person-outline")}
      />
    </Tab.Navigator>
  );
}

function tabIcon(
  focusedIcon: keyof typeof Ionicons.glyphMap,
  defaultIcon: keyof typeof Ionicons.glyphMap
): BottomTabNavigationOptions {
  return {
    tabBarIcon: ({ focused }) => (
      <Ionicons
        name={focused ? focusedIcon : defaultIcon}
        size={26}
        color={focused ? "#FF7A00" : "#B7B7B7"}
      />
    ),
  };
}

// ----------------------- DRAWER -----------------------
export default function DrawerNavigation() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        swipeEdgeWidth: 200,
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
}
