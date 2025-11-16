import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UserInviteCard from "../components/UserInviteCard";

export default function InviteFriendScreen() {
  const [search, setSearch] = useState("");

  const friends = [
    {
      name: "Alex Lee",
      followers: "2k",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
      status: "sent",
    },
    {
      name: "Micheal Ulasi",
      followers: "56",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      status: "invite",
    },
    {
      name: "Cristofer",
      followers: "300",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "sent",
    },
    {
      name: "David Silva",
      followers: "5k",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      status: "invite",
    },
    {
      name: "Ashfak Sayem",
      followers: "402",
      avatar: "https://randomuser.me/api/portraits/men/44.jpg",
      status: "sent",
    },
    {
      name: "Jhon Wick",
      followers: "2k",
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
      status: "invite",
    },
  ];

  const filteredFriends = friends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white pt-14 px-4">
      {/* Header */}
      <Text className="text-center text-xl font-semibold text-gray-900 mb-6">
        Invite Friend
      </Text>

      {/* Search bar */}
      <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12 mb-6">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-gray-900"
        />
      </View>

      {/* Friends list */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {filteredFriends.map((f, index) => (
          <UserInviteCard
            key={index}
            name={f.name}
            followers={f.followers}
            avatar={f.avatar}
            status={f.status as any}
          />
        ))}
      </ScrollView>
    </View>
  );
}
