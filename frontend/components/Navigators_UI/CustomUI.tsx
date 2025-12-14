// CustomUI.tsx
import React from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../context/AuthContext";

// =======================================================
// CUSTOM TAB BAR
// =======================================================
export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View className="flex-row bg-white h-[70px] items-end justify-around shadow-md">
      {state.routes.map((route, index) => {
        const focused = state.index === index;

        const icon =
          descriptors[route.key].options.tabBarIcon?.({
            focused,
            color: focused ? "#FF7A00" : "#B7B7B7",
            size: 26,
          });

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            className="flex-col items-center justify-center pb-3 relative w-[80px] mb-5"
          >
            {/* Highlight */}
            <View
              className={`absolute top-1 w-[3px] h-[22px] rounded-full ${focused ? "bg-orange-500" : "opacity-0"
                }`}
            />

            {/* Icon */}
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// =======================================================
// CUSTOM DRAWER
// =======================================================
export function CustomDrawer(props: DrawerContentComponentProps) {
  const navigation = props.navigation;


  const { logout } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 22,
      }}
    >
      {/* USER INFO */}
      <View className="flex-row items-center mb-10">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
          className="w-20 h-20 rounded-full mr-4"
        />
        <View>
          <Text className="text-xl font-semibold text-gray-900">
            MD Rafi Islam
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            rafiislama...@gmail.com
          </Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerItem
        label="Notifications"
        icon={
          <Ionicons name="notifications-outline" size={30} color="#FF7A00" />
        }
        onPress={() => navigation.navigate("Notifications")}
      />

      <DrawerItem
        label="Add Event"
        icon={<Ionicons name="add-circle-outline" size={30} color="#FF7A00" />}
        onPress={() => navigation.navigate("CreateEditEvent")}
      />

      <DrawerItem
        label="Bookmark"
        icon={<Ionicons name="bookmark-outline" size={30} color="#FF7A00" />}
        onPress={() => { }}
      />

      <DrawerItem
        label="Messages"
        icon={
          <MaterialCommunityIcons
            name="message-outline"
            size={30}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("Message")}
      />

      <DrawerItem
        label="Settings"
        icon={<Ionicons name="settings-outline" size={30} color="#FF7A00" />}
        onPress={() => { }}
      />

      <DrawerItem
        label="Sign Out"
        icon={<Ionicons name="log-out-outline" size={30} color="#FF7A00" />}
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

// =======================================================
// DRAWER ITEM — STRONGLY TYPED
// =======================================================
type DrawerItemProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
};

function DrawerItem({ label, icon, onPress }: DrawerItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="flex-row items-center py-3 mb-2"
    >
      <View className="w-10 justify-center items-center">{icon}</View>
      <Text className="ml-2 text-[20px] text-gray-800 font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
