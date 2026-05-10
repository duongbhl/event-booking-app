import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useIsFocused,
} from "@react-navigation/native";

import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  deleteNotification,
  markNotificationsAsRead,
} from "../../services/notification.service";
import { InvitationCard } from "../../components/Cards/InvitationCard";

type NotificationItem = {
  _id: string;
  type?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  event?: any;
  createdAt?: string;
};

type SectionItem =
  | {
      type: "section";
      id: string;
      title: string;
    }
  | {
      type: "notification";
      id: string;
      notification: NotificationItem;
    };

export default function Notification() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(
    async (silent?: boolean) => {
      if (!token) return;

      try {
        if (!silent) {
          setLoading(true);
        }

        const data = await getNotifications(token);
        setNotifications(data || []);

        await markNotificationsAsRead(token);
      } catch (error) {
        console.log("Fetch notifications error:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isFocused && token) {
      fetchNotifications();
    }
  }, [isFocused, token, fetchNotifications]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications(true);
  }, [fetchNotifications]);

  const handleInvitationClick = useCallback(
    (notification: NotificationItem) => {
      if (notification.event) {
        navigation.navigate("EventDetails", {
          event: notification.event,
        });
      }
    },
    [navigation]
  );

  const handleAcceptInvitation = useCallback(
    async (notification: NotificationItem) => {
      if (!token) return;

      try {
        await deleteNotification(notification._id, token);

        setNotifications((prev) =>
          prev.filter((n) => n._id !== notification._id)
        );

        if (notification.event) {
          navigation.navigate("EventDetails", {
            event: notification.event,
          });
        }
      } catch (error) {
        Alert.alert("Error", "Failed to accept invitation");
      }
    },
    [navigation, token]
  );

  const handleDeclineInvitation = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      try {
        await deleteNotification(notificationId, token);

        setNotifications((prev) =>
          prev.filter((n) => n._id !== notificationId)
        );
      } catch (error) {
        console.log("Delete notification error:", error);
        Alert.alert("Error", "Failed to decline invitation");
      }
    },
    [token]
  );

  const sectionData = useMemo<SectionItem[]>(() => {
    const unreadInvitations = notifications.filter(
      (n) => !n.isRead && n.type === "invitation"
    );

    const unreadOthers = notifications.filter(
      (n) => !n.isRead && n.type !== "invitation"
    );

    const readNotifications = notifications.filter((n) => n.isRead);

    const data: SectionItem[] = [];

    if (unreadInvitations.length > 0) {
      data.push({
        type: "section",
        id: "unread-invitations",
        title: "Invitations",
      });

      unreadInvitations.forEach((notification) => {
        data.push({
          type: "notification",
          id: notification._id,
          notification,
        });
      });
    }

    if (unreadOthers.length > 0) {
      data.push({
        type: "section",
        id: "unread-notifications",
        title: "Unread",
      });

      unreadOthers.forEach((notification) => {
        data.push({
          type: "notification",
          id: notification._id,
          notification,
        });
      });
    }

    if (readNotifications.length > 0) {
      data.push({
        type: "section",
        id: "read-notifications",
        title: "Earlier",
      });

      readNotifications.forEach((notification) => {
        data.push({
          type: "notification",
          id: notification._id,
          notification,
        });
      });
    }

    return data;
  }, [notifications]);

  const renderNotification = useCallback(
    ({ item }: { item: SectionItem }) => {
      if (item.type === "section") {
        return (
          <Text
            className="font-semibold text-gray-900"
            style={{
              fontSize: isSmallDevice ? 15 : 16,
              marginTop: 18,
              marginBottom: 10,
            }}
          >
            {item.title}
          </Text>
        );
      }

      const notification = item.notification;

      if (notification.type === "invitation") {
        const invitationAvatar =
          notification.event?.avatar || notification.event?.image || "";
        const invitationName =
          notification.event?.name || notification.title || "Invitation";
        const invitationTime = notification.createdAt || new Date().toISOString();


        return (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleInvitationClick(notification)}
          >
            <InvitationCard
              // {...notification}
              avatar={invitationAvatar}
              name={invitationName}
              time={invitationTime}
              message={notification.message || ""}
              type={notification.type as any}
              onAccept={() => handleAcceptInvitation(notification)}
              onReject={() => handleDeclineInvitation(notification._id)}

            />
          </TouchableOpacity>
        );
      }

      return (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => handleInvitationClick(notification)}
          className="bg-gray-50 rounded-2xl px-4 py-4 mb-3 flex-row"
        >
          <View
            className="rounded-full bg-orange-100 items-center justify-center mr-3"
            style={{
              width: isSmallDevice ? 40 : 44,
              height: isSmallDevice ? 40 : 44,
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={isSmallDevice ? 20 : 22}
              color="#FF7A00"
            />
          </View>

          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-semibold text-gray-900"
              style={{
                fontSize: isSmallDevice ? 14 : 15,
              }}
            >
              {notification.title || "Notification"}
            </Text>

            <Text
              numberOfLines={2}
              className="text-gray-500 mt-1"
              style={{
                fontSize: isSmallDevice ? 12 : 13,
                lineHeight: isSmallDevice ? 17 : 18,
              }}
            >
              {notification.message || "You have a new notification"}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [
      isSmallDevice,
      handleInvitationClick,
      handleAcceptInvitation,
      handleDeclineInvitation,
    ]
  );

  const emptyComponent = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center py-24 px-6">
        <Ionicons
          name="notifications-outline"
          size={isSmallDevice ? 54 : 64}
          color="#D1D5DB"
        />

        <Text
          className="text-gray-500 mt-4 text-center font-medium"
          style={{
            fontSize: isSmallDevice ? 14 : 16,
          }}
        >
          No notifications yet
        </Text>
      </View>
    );
  }, [loading, isSmallDevice]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
        }}
      >
        <View
          className="flex-row items-center justify-between"
          style={{
            marginTop: isSmallDevice ? 6 : 10,
            marginBottom: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
            activeOpacity={0.7}
            className="p-1"
          >
            <Ionicons
              name="arrow-back"
              size={isTablet ? 30 : 24}
              color="#444"
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="font-semibold flex-1 text-center mx-3"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
            }}
          >
            {t("notifications.notifications")}
          </Text>

          <TouchableOpacity
            onPress={handleRefresh}
            hitSlop={10}
            activeOpacity={0.7}
            className="p-1"
          >
            <Ionicons
              name="refresh"
              size={isTablet ? 28 : 22}
              color="#FF7A00"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : (
          <FlatList
            data={sectionData}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            ListEmptyComponent={emptyComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={8}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: Platform.OS === "ios" ? 110 : 90,
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}