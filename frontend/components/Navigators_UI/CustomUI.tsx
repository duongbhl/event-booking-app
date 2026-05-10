import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  useWindowDimensions,
  Platform,
} from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { getUnreadNotificationCount } from "../../services/notification.service";
import { getUnreadMessageCount } from "../../services/chat.service";
import { useIsFocused } from "@react-navigation/native";

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

function getDeviceFlags(width: number) {
  return {
    isSmallDevice: width < 375,
    isTablet: width >= 768,
  };
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { width } = useWindowDimensions();

  const { isSmallDevice, isTablet } = useMemo(
    () => getDeviceFlags(width),
    [width]
  );

  const tabBarHeight = isTablet ? 86 : isSmallDevice ? 64 : 72;
  const iconSize = isTablet ? 30 : isSmallDevice ? 22 : 26;
  const itemWidth = width / state.routes.length;
  const indicatorHeight = isTablet ? 28 : 22;

  return (
    <View
      style={{
        height: tabBarHeight,
        paddingBottom: Platform.OS === "ios" ? 12 : 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 6,
      }}
      className="flex-row bg-white items-end justify-around"
    >
      {state.routes.map((route) => {
        const focused = state.index === state.routes.indexOf(route);

        const icon = descriptors[route.key].options.tabBarIcon?.({
          focused,
          color: focused ? "#FF7A00" : "#B7B7B7",
          size: iconSize,
        });

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.7}
            style={{
              width: itemWidth,
              height: tabBarHeight,
              paddingBottom: Platform.OS === "ios" ? 14 : 10,
            }}
            className="items-center justify-end relative"
          >
            <View
              style={{
                height: indicatorHeight,
                top: 6,
                opacity: focused ? 1 : 0,
              }}
              className="absolute w-[3px] rounded-full bg-orange-500"
            />

            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function CustomDrawer(props: DrawerContentComponentProps) {
  const { t } = useLocalization();
  const navigation = props.navigation;
  const { user, logout, token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const { isSmallDevice, isTablet } = useMemo(
    () => getDeviceFlags(width),
    [width]
  );

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const avatarSize = isTablet ? 88 : isSmallDevice ? 62 : 78;
  const drawerIconSize = isTablet ? 34 : isSmallDevice ? 24 : 30;

  useEffect(() => {
    if (!isFocused || !token) return;

    const fetchCounts = async () => {
      try {
        const notificationCount = await getUnreadNotificationCount(token);
        const messageCount = await getUnreadMessageCount(token);

        setUnreadNotifications(notificationCount);
        setUnreadMessages(messageCount);
      } catch (error) {
        console.log("Fetch unread drawer counts error:", error);
      }
    };

    fetchCounts();
  }, [isFocused, token]);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: isTablet ? 70 : 50,
        paddingHorizontal: isTablet ? 28 : isSmallDevice ? 16 : 22,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        className="flex-row items-center"
        style={{
          marginBottom: isTablet ? 48 : 40,
        }}
      >
        <Image
          source={{ uri: user?.avatar || DEFAULT_AVATAR }}
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            marginRight: isSmallDevice ? 12 : 16,
          }}
        />

        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="font-semibold text-gray-900"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
            }}
          >
            {user?.name || "User"}
          </Text>

          <Text
            numberOfLines={1}
            className="text-gray-500 mt-1"
            style={{
              fontSize: isTablet ? 15 : 13,
            }}
          >
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </View>

      <DrawerItem
        label={t("drawer.notifications")}
        badge={unreadNotifications}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <Ionicons
            name="notifications-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("Notifications")}
      />

      <DrawerItem
        label={t("drawer.addEvent")}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <Ionicons
            name="add-circle-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("CreateEditEvent")}
      />

      <DrawerItem
        label={t("drawer.bookmark")}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <Ionicons
            name="bookmark-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("EventBookmark")}
      />

      <DrawerItem
        label={t("drawer.messages")}
        badge={unreadMessages}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <MaterialCommunityIcons
            name="message-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("Message")}
      />

      <DrawerItem
        label={t("drawer.settings")}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <Ionicons
            name="settings-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={() => navigation.navigate("Settings")}
      />

      <DrawerItem
        label={t("drawer.signOut")}
        isSmallDevice={isSmallDevice}
        isTablet={isTablet}
        icon={
          <Ionicons
            name="log-out-outline"
            size={drawerIconSize}
            color="#FF7A00"
          />
        }
        onPress={logout}
      />
    </DrawerContentScrollView>
  );
}

type DrawerItemProps = {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  badge?: number;
  isSmallDevice: boolean;
  isTablet: boolean;
};

function DrawerItem({
  label,
  icon,
  onPress,
  badge,
  isSmallDevice,
  isTablet,
}: DrawerItemProps) {
  const iconContainerWidth = isTablet ? 50 : 40;
  const badgeSize = isTablet ? 28 : 24;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      className="flex-row items-center"
      style={{
        paddingVertical: isTablet ? 16 : 12,
        marginBottom: 8,
      }}
    >
      <View
        className="justify-center items-center relative"
        style={{
          width: iconContainerWidth,
        }}
      >
        {icon}

        {badge !== undefined && badge > 0 && (
          <View
            className="absolute bg-red-500 rounded-full justify-center items-center"
            style={{
              width: badgeSize,
              height: badgeSize,
              top: -8,
              right: -8,
            }}
          >
            <Text
              className="text-white font-bold"
              style={{
                fontSize: isTablet ? 12 : 10,
              }}
            >
              {badge > 9 ? "9+" : badge}
            </Text>
          </View>
        )}
      </View>

      <Text
        numberOfLines={1}
        className="ml-2 flex-1 text-gray-800 font-medium"
        style={{
          fontSize: isTablet ? 22 : isSmallDevice ? 16 : 20,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}