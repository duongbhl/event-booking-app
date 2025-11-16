import React from "react";
import { View, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";


// Screens
import HomeScreen from "../pages/Home";
import CalendarScreen from "../pages/Calendar";
import SelectLocationScreen from "../pages/SelectLocation";
import ProfileScreen from "../pages/Profile";
import CustomTabBar from "./CustomTabBar";


type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const Tab = createBottomTabNavigator();

//Bottom Tab

export default function MainTabs() {
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
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }: TabIconProps) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={28}
              color={focused ? "#FF7A00" : "#B7B7B7"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }: TabIconProps) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={26}
              color={focused ? "#FF7A00" : "#B7B7B7"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Location"
        component={SelectLocationScreen}
        options={{
          tabBarIcon: ({ focused }: TabIconProps) => (
            <Ionicons
              name={focused ? "location" : "location-outline"}
              size={26}
              color={focused ? "#FF7A00" : "#B7B7B7"}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }: TabIconProps) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={focused ? "#FF7A00" : "#B7B7B7"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
