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
import { Swipeable } from "react-native-gesture-handler";
import { Checkbox } from "react-native-paper";

import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import {
  getNotifications,
  deleteNotification,
  markNotificationsAsRead,
  markSelectedNotificationsAsRead,
} from "../../services/notification.service";
import { InvitationCard } from "../../components/Cards/InvitationCard";

type NotificationItem = {
  _id: string;
  type?: string;
  isRead?: boolean;
  title?: string;
  message?: string;
  fromUser?: {
    _id?: string;
    name?: string;
    avatar?: string;
  };
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<string[]>([]);

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

  const formatSelectedCount = useCallback(
    (count: number) => t("notification.selectedCount").replace("{count}", String(count)),
    [t]
  );

  const formatDeleteSelectedMessage = useCallback(
    (count: number) =>
      t("notification.deleteSelectedMessage")
        .replace("{count}", String(count))
        .replace("{plural}", count > 1 ? "s" : ""),
    [t]
  );

  const clearSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedNotificationIds([]);
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((current) => {
      const nextMode = !current;
      if (!nextMode) {
        setSelectedNotificationIds([]);
      }
      return nextMode;
    });
  }, []);

  const toggleNotificationSelection = useCallback((notificationId: string) => {
    setSelectedNotificationIds((current) =>
      current.includes(notificationId)
        ? current.filter((id) => id !== notificationId)
        : [...current, notificationId]
    );
  }, []);

  const selectedNotificationSet = useMemo(
    () => new Set(selectedNotificationIds),
    [selectedNotificationIds]
  );

  const selectedCount = selectedNotificationIds.length;

  const removeNotificationsFromState = useCallback((ids: string[]) => {
    const idSet = new Set(ids);

    setNotifications((current) =>
      current.filter((notification) => !idSet.has(notification._id))
    );
    setSelectedNotificationIds((current) =>
      current.filter((id) => !idSet.has(id))
    );
  }, []);

  const deleteNotificationsByIds = useCallback(
    async (ids: string[]) => {
      if (!token || ids.length === 0) return false;

      try {
        await Promise.all(ids.map((id) => deleteNotification(id, token)));
        removeNotificationsFromState(ids);
        return true;
      } catch (error) {
        console.log("Delete notification error:", error);
        Alert.alert(t("common.error"), t("notification.failedDeleteNotification"));
        return false;
      }
    },
    [removeNotificationsFromState, t, token]
  );

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

  const handleDeleteSelected = useCallback(() => {
    if (selectedCount === 0) return;

    Alert.alert(
      t("notification.deleteSelectedTitle"),
      formatDeleteSelectedMessage(selectedCount),
      [
        { text: t("notification.cancel"), style: "cancel" },
        {
          text: t("notification.delete"),
          style: "destructive",
          onPress: async () => {
            const deleted = await deleteNotificationsByIds(selectedNotificationIds);
            if (deleted) {
              clearSelection();
            }
          },
        },
      ]
    );
  }, [clearSelection, deleteNotificationsByIds, formatDeleteSelectedMessage, selectedCount, selectedNotificationIds, t]);

  const handleMarkSelectedAsRead = useCallback(async () => {
    if (!token || selectedCount === 0) return;

    try {
      await markSelectedNotificationsAsRead(token, selectedNotificationIds);

      setNotifications((current) =>
        current.map((notification) =>
          selectedNotificationSet.has(notification._id)
            ? { ...notification, isRead: true }
            : notification
        )
      );

      clearSelection();
    } catch (error) {
      console.log("Mark selected notifications read error:", error);
      Alert.alert(t("common.error"), t("notification.failedMarkSelectedAsRead"));
    }
  }, [clearSelection, selectedCount, selectedNotificationIds, selectedNotificationSet, t, token]);

  const handleDeleteSingle = useCallback(
    async (notificationId: string) => {
      await deleteNotificationsByIds([notificationId]);
    },
    [deleteNotificationsByIds]
  );

  const handleNotificationPress = useCallback(
    (notification: NotificationItem) => {
      if (selectionMode) {
        toggleNotificationSelection(notification._id);
        return;
      }

      if (notification.type === "invitation") {
        handleInvitationClick(notification);
        return;
      }

      handleInvitationClick(notification);
    },
    [handleInvitationClick, selectionMode, toggleNotificationSelection]
  );

  const renderDeleteAction = useCallback(
    (notificationId: string) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleDeleteSingle(notificationId)}
        className="items-center justify-center rounded-2xl mb-3 mr-1 bg-red-500"
        style={{ width: 88 }}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text className="text-white font-semibold mt-1" style={{ fontSize: 12 }}>
          {t("notification.deleteAction")}
        </Text>
      </TouchableOpacity>
    ),
    [handleDeleteSingle, t]
  );

  const handleAcceptInvitation = useCallback(
    async (notification: NotificationItem) => {
      if (!token) return;

      try {
        await deleteNotification(notification._id, token);

        setNotifications((current) =>
          current.filter((item) => item._id !== notification._id)
        );

        if (notification.event) {
          navigation.navigate("EventDetails", {
            event: notification.event,
          });
        }
      } catch (error) {
        Alert.alert(t("common.error"), t("notification.failedAcceptInvitation"));
      }
    },
    [navigation, t, token]
  );

  const handleDeclineInvitation = useCallback(
    async (notificationId: string) => {
      if (!token) return;

      try {
        await deleteNotification(notificationId, token);

        setNotifications((current) =>
          current.filter((item) => item._id !== notificationId)
        );
      } catch (error) {
        console.log("Delete notification error:", error);
        Alert.alert(t("common.error"), t("notification.failedDeclineInvitation"));
      }
    },
    [t, token]
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
        title: t("notification.invitations"),
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
        title: t("notification.unread"),
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
        title: t("notification.read"),
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
  }, [notifications, t]);

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
      const isSelected = selectedNotificationSet.has(notification._id);

      const checkbox = selectionMode ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleNotificationSelection(notification._id)}
          className="mr-2"
        >
          <Checkbox
            status={isSelected ? "checked" : "unchecked"}
            color="#FF7A00"
          />
        </TouchableOpacity>
      ) : null;

      if (notification.type === "invitation") {
        const invitationAvatar =
          notification.fromUser?.avatar || notification.event?.avatar || notification.event?.image || "";
        const invitationName =
          notification.fromUser?.name || notification.title || t("notification.notificationFallbackTitle");
        const invitationTime = notification.createdAt || new Date().toISOString();


        return (
          <Swipeable
            renderRightActions={() => renderDeleteAction(notification._id)}
            overshootRight={false}
          >
            <TouchableOpacity
              activeOpacity={selectionMode ? 0.92 : 0.85}
              onPress={() => handleNotificationPress(notification)}
              className="mb-3"
            >
              <View
                className="flex-row items-center"
                style={{
                  opacity: isSelected ? 0.92 : 1,
                }}
              >
                {checkbox}
                <View className="flex-1">
                  <InvitationCard
                    avatar={invitationAvatar}
                    name={invitationName}
                    time={invitationTime}
                    message={notification.message || ""}
                    type={notification.type as any}
                    onAccept={() => handleAcceptInvitation(notification)}
                    onReject={() => handleDeclineInvitation(notification._id)}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </Swipeable>
        );
      }

      return (
        <Swipeable
          renderRightActions={() => renderDeleteAction(notification._id)}
          overshootRight={false}
        >
          <TouchableOpacity
            activeOpacity={selectionMode ? 0.92 : 0.75}
            onPress={() => handleNotificationPress(notification)}
            className="bg-gray-50 rounded-2xl px-4 py-4 mb-3 flex-row"
            style={{
              borderWidth: isSelected ? 1 : 0,
              borderColor: isSelected ? "#FF7A00" : "transparent",
            }}
          >
            {checkbox}
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
                {notification.title || t("notification.notificationFallbackTitle")}
              </Text>

              <Text
                numberOfLines={2}
                className="text-gray-500 mt-1"
                style={{
                  fontSize: isSmallDevice ? 12 : 13,
                  lineHeight: isSmallDevice ? 17 : 18,
                }}
              >
                {notification.message || t("notification.notificationFallbackMessage")}
              </Text>
            </View>
          </TouchableOpacity>
        </Swipeable>
      );
    },
    [
      clearSelection,
      handleAcceptInvitation,
      handleDeclineInvitation,
      isSmallDevice,
      handleNotificationPress,
      renderDeleteAction,
      selectionMode,
      selectedNotificationSet,
      toggleNotificationSelection,
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
          {t("notification.noNotificationsYet")}
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
            {t("notification.notification")}
          </Text>

          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={toggleSelectionMode}
              hitSlop={10}
              activeOpacity={0.7}
              className="p-1"
            >
              <Ionicons
                name={selectionMode ? "close" : "checkbox-outline"}
                size={isTablet ? 28 : 22}
                color={selectionMode ? "#EF4444" : "#FF7A00"}
              />
            </TouchableOpacity>

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
        </View>

        {selectionMode && (
          <View className="flex-row items-center justify-between rounded-2xl bg-orange-50 px-4 py-3 mb-3">
            <Text className="font-semibold text-gray-800">
              {formatSelectedCount(selectedCount)}
            </Text>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={handleMarkSelectedAsRead}
                activeOpacity={0.85}
                className="rounded-xl border border-orange-300 px-3 py-2"
                disabled={selectedCount === 0}
                style={{ opacity: selectedCount === 0 ? 0.5 : 1 }}
              >
                <Text className="font-semibold text-orange-600">{t("notification.read")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteSelected}
                activeOpacity={0.85}
                className="rounded-xl bg-red-500 px-3 py-2"
                disabled={selectedCount === 0}
                style={{ opacity: selectedCount === 0 ? 0.5 : 1 }}
              >
                <Text className="font-semibold text-white">{t("notification.delete")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

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