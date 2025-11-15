import React from "react";
import { View, ScrollView, TouchableOpacity, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { InvitationCard } from "../components/InvitationCard";



const NOTIFICATIONS = {
  unread: [
    {
      id: 1,
      avatar: "https://i.pravatar.cc/150?img=4",
      name: "Micheal Ulasi",
      message: "started to follow you",
      time: "Just now",
      type: "follow",
    },
    {
      id: 2,
      avatar: "https://i.pravatar.cc/150?img=7",
      name: "David Silbia",
      message: "invited you to Dribbble Design Meetup 2022",
      time: "1m ago",
      type: "invite",
    },
  ],
  yesterday: [
    {
      id: 3,
      avatar: "https://i.pravatar.cc/150?img=6",
      name: "Micheal Ulasi",
      message: "commented on your SAAS Mobile App design",
      time: "10 hr ago",
      type: "comment",
    },
    {
      id: 4,
      avatar: "https://i.pravatar.cc/150?img=5",
      name: "Jhon Wick",
      message: "invite you to Basketball Final Match",
      time: "1 m ago",
      type: "invite",
    },
    {
      id: 5,
      avatar: "https://i.pravatar.cc/150?img=8",
      name: "Roman Kutepov",
      message: "liked your SAAS mobile app design",
      time: "1 hr ago",
      type: "like",
    },
  ],
};

export default function NotificationScreen() {
  const hasNotifications =
    NOTIFICATIONS.unread.length > 0 || NOTIFICATIONS.yesterday.length > 0;



  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#444" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">Notification</Text>

        <TouchableOpacity>
          <Ionicons name="search" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {!hasNotifications && (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
          <Image
            source={require("../assets/animal.png")} // sửa đường dẫn image
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />

          <Text className="text-xl font-semibold mt-4">Ups! There is no notification</Text>

          <Text className="text-gray-500 text-center mt-2 w-3/4">
            You’ll be notified about activity on events you're a collaborator on.
          </Text>
        </SafeAreaView>
      )}

      {hasNotifications && (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* UNREAD */}
          <Text className="text-gray-800 font-semibold mb-2">
            Unread ({NOTIFICATIONS.unread.length})
          </Text>

          {NOTIFICATIONS.unread.map((n) => (
            <InvitationCard
              key={n.id}
              avatar={n.avatar}
              name={n.name}
              message={n.message}
              time={n.time}
              type={n.type as any}
              onAccept={() => { }}
              onReject={() => { }}
            />
          ))}

          {/* YESTERDAY */}
          <Text className="text-gray-800 font-semibold mt-4 mb-2">
            Yesterday ({NOTIFICATIONS.yesterday.length})
          </Text>

          {NOTIFICATIONS.yesterday.map((n) => (
            <InvitationCard
              key={n.id}
              avatar={n.avatar}
              name={n.name}
              message={n.message}
              time={n.time}
              type={n.type as any}
            />
          ))}
        </ScrollView>
      )}


    </SafeAreaView>
  );
}
