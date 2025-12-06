import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { MessagePreviewProps } from "../../components/Interface/MessagePreviewProps";
import MessageCard from "../../components/Cards/MessageCard";

const MOCK_MESSAGES: MessagePreviewProps[] = [
  {
    id: "1",
    name: "Cristofer",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    lastMessage: "Hi :)",
    time: "Just now",
    unread: 2,
  },
  {
    id: "2",
    name: "David Silbia",
    avatar: "https://randomuser.me/api/portraits/men/20.jpg",
    lastMessage: "This is very good",
    time: "3 min ago",
    unread: 4,
  },
  {
    id: "3",
    name: "Micheal Ullasi",
    avatar: "https://randomuser.me/api/portraits/men/17.jpg",
    lastMessage: "Hey, How are you?",
    time: "10 min ago",
    unread: 7,
  },
  {
    id: "4",
    name: "Ashfak Sayem",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    lastMessage: "Looking forward to it!",
    time: "27 min ago",
    unread: 0,
  },
  {
    id: "5",
    name: "Roman Kutepov",
    avatar: "https://randomuser.me/api/portraits/men/26.jpg",
    lastMessage: "Nothing man, cheers!",
    time: "40 min ago",
    unread: 0,
  },
  {
    id: "6",
    name: "Jhon Wick",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "You can take this up?",
    time: "1 hour ago",
    unread: 0,
  },
  {
    id: "7",
    name: "Zenifero Bolex",
    avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    lastMessage: "Okay, Bye!",
    time: "1 day ago",
    unread: 0,
  },
];

export default function Message() {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const filtered = MOCK_MESSAGES.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Message</Text>

        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mb-4">
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Find Conversation"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-gray-900"
        />
      </View>

      {/* MESSAGE LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map((item) => (
          <MessageCard
            key={item.id}
            id={item.id}
            name={item.name}
            avatar={item.avatar}
            lastMessage={item.lastMessage}
            time={item.time}
            unread={item.unread}
          />
        ))}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
