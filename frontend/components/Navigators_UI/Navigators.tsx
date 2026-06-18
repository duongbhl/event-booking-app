import React, { useMemo } from "react";
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useWindowDimensions } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Calendar from "../../pages/Calendar/Calendar";
import Profile from "../../pages/Profile/Profile";
import Home from "../../pages/Home";
import CreateEditEvent from "../../pages/MyEvent/AddEvent";

import { CustomDrawer, CustomTabBar } from "./CustomUI";

export type RootTabParamList = {
  Home: undefined;
  Calendar: undefined;
  AddEvent: undefined;
  Profile: undefined;
};

export type RootDrawerParamList = {
  MainTabs: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

const getIconSize = (width: number) => {
  if (width >= 768) return 30;
  if (width < 375) return 22;
  return 26;
};

export function MainTabs() {
  const { width } = useWindowDimensions();
  const iconSize = useMemo(() => getIconSize(width), [width]);

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
        options={tabIcon("home", "home-outline", iconSize)}
      />

      <Tab.Screen
        name="Calendar"
        component={Calendar}
        options={tabIcon("calendar", "calendar-outline", iconSize)}
      />

      <Tab.Screen
        name="AddEvent"
        component={CreateEditEvent}
        options={tabIcon("add-circle", "add-circle-outline", iconSize)}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={tabIcon("person", "person-outline", iconSize)}
      />
    </Tab.Navigator>
  );
}

function tabIcon(
  focusedIcon: keyof typeof Ionicons.glyphMap,
  defaultIcon: keyof typeof Ionicons.glyphMap,
  size: number
): BottomTabNavigationOptions {
  return {
    tabBarIcon: ({ focused }) => (
      <Ionicons
        name={focused ? focusedIcon : defaultIcon}
        size={size}
        color={focused ? "#FF7A00" : "#B7B7B7"}
      />
    ),
  };
}

export default function DrawerNavigation() {
  const { width } = useWindowDimensions();

  const drawerWidth = useMemo(() => {
    if (width >= 768) return 360;
    return Math.min(width * 0.82, 340);
  }, [width]);

  const swipeEdgeWidth = useMemo(() => {
    if (width >= 768) return 250;
    if (width >= 430) return 220;
    return 180;
  }, [width]);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        swipeEdgeWidth,
        drawerStyle: {
          width: drawerWidth,
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
}
