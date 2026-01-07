// CustomUI.tsx
import React, { useEffect, useState } from "react";
import { View, TouchableOpacity, Image, Text } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notification.service";
import { getUnreadMessageCount } from "../../services/chat.service";
import { useIsFocused } from "@react-navigation/native";

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
  const { user, logout, token } = useAuth();
  const isFocused = useIsFocused();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Fetch unread counts when drawer is focused
  useEffect(() => {
    if (!isFocused || !token) return;

    const fetchCounts = async () => {
      const notificationCount = await getUnreadNotificationCount(token);
      const messageCount = await getUnreadMessageCount(token);
      setUnreadNotifications(notificationCount);
      setUnreadMessages(messageCount);
    };

    fetchCounts();
  }, [isFocused, token]);

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
          source={{ uri: user?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
          className="w-20 h-20 rounded-full mr-4"
          defaultSource={{ uri: "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
        />
        <View className="flex-1">
          <Text className="text-xl font-semibold text-gray-900">
            {user?.name || "User"}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </View>

      {/* Drawer Items */}
      <DrawerItem
        label="Notifications"
        badge={unreadNotifications}
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
        onPress={() =>navigation.navigate("EventBookmark")}
      />

      <DrawerItem
        label="Messages"
        badge={unreadMessages}
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
  badge?: number;
};

function DrawerItem({ label, icon, onPress, badge }: DrawerItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      className="flex-row items-center py-3 mb-2"
    >
      <View className="w-10 justify-center items-center relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 justify-center items-center">
            <Text className="text-white text-xs font-bold">
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        )}
      </View>
      <Text className="ml-2 text-[20px] text-gray-800 font-medium">{label}</Text>
    </TouchableOpacity>
  );
}
