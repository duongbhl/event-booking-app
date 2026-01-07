import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, deleteNotification, markNotificationsAsRead } from "../../services/notification.service";
import { InvitationCard } from "../../components/Cards/InvitationCard";

export default function Notification() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const isFocused = useIsFocused();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!isFocused || !token) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotifications(token);
        setNotifications(data || []);
        
        // Mark all notifications as read
        await markNotificationsAsRead(token);
      } catch (error) {
        console.log("Fetch notifications error:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isFocused, token]);

  // Handle invitation click - navigate to event details
  const handleInvitationClick = (notification: any) => {
    if (notification.event) {
      navigation.navigate("EventDetails", { event: notification.event });
    }
  };

  // Handle accept invitation - navigate to event details
  const handleAcceptInvitation = async (notification: any) => {
    try {
      // Delete the notification
      await deleteNotification(notification._id, token!);
      // Remove from UI
      setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      // Navigate to event details
      if (notification.event) {
        navigation.navigate("EventDetails", { event: notification.event });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to accept invitation");
    }
  };

  // Handle decline invitation - delete notification
  const handleDeclineInvitation = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId, token!);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      Alert.alert("Success", "Invitation declined");
    } catch (error) {
      console.log("Delete notification error:", error);
      Alert.alert("Error", "Failed to decline invitation");
    }
  };

  // Filter unread invitations
  const unreadInvitations = notifications.filter(
    (n) => !n.isRead && n.type === "invitation"
  );

  // Filter other unread notifications
  const unreadOthers = notifications.filter(
    (n) => !n.isRead && n.type !== "invitation"
  );

  // Filter read notifications
  const readNotifications = notifications.filter((n) => n.isRead);

  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#444" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">Notification</Text>

        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      ) : !hasNotifications ? (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
          <Image
            source={require("../../assets/no-task.png")}
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />

          <Text className="text-xl font-semibold mt-4">
            Ups! There is no notification
          </Text>

          <Text className="text-gray-500 text-center mt-2 w-3/4">
            You'll be notified about activity on events you're a collaborator
            on.
          </Text>
        </SafeAreaView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* UNREAD INVITATIONS */}
          {unreadInvitations.length > 0 && (
            <>
              <Text className="text-gray-800 font-semibold mb-3">
                Invitations ({unreadInvitations.length})
              </Text>

              {unreadInvitations.map((n) => (
                <InvitationCard
                  key={n._id}
                  avatar={n.fromUser?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg"}
                  name={n.fromUser?.name || "Unknown User"}
                  message={n.message}
                  time={new Date(n.createdAt).toLocaleDateString()}
                  type="invite"
                  onAccept={() => handleAcceptInvitation(n)}
                  onReject={() => handleDeclineInvitation(n._id)}
                />
              ))}
            </>
          )}

          {/* UNREAD OTHERS */}
          {unreadOthers.length > 0 && (
            <>
              <Text className="text-gray-800 font-semibold mb-3 mt-4">
                Unread ({unreadOthers.length})
              </Text>

              {unreadOthers.map((n) => (
                <View
                  key={n._id}
                  className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4 mb-3"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900 text-sm">
                      {n.title}
                    </Text>
                    <Text className="text-gray-600 text-xs mt-1">
                      {n.message}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="w-3 h-3 rounded-full bg-orange-500 ml-2" />
                </View>
              ))}
            </>
          )}

          {/* READ NOTIFICATIONS */}
          {readNotifications.length > 0 && (
            <>
              <Text className="text-gray-800 font-semibold mb-3 mt-4">
                Earlier ({readNotifications.length})
              </Text>

              {readNotifications.map((n) => (
                <View
                  key={n._id}
                  className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-3 border border-gray-100"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-700 text-sm">
                      {n.title}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      {n.message}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}

          <View className="h-20" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
