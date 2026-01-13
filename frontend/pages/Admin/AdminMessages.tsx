import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { createRoom } from "../../services/chat.service";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export default function AdminMessages() {
  const navigation = useNavigation<any>();
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Filter out current admin user
      const filteredUsers = (data || []).filter(
        (u: User) => u._id !== user?._id
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.log("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (selectedUser: User) => {
    setCreatingChat(true);
    try {
      const room = await createRoom(
        { memberIds: [selectedUser._id], isGroup: false },
        token || ""
      );
      navigation.navigate("Chat", { roomId: room._id, room });
    } catch (error) {
      console.log("Create chat room error:", error);
    } finally {
      setCreatingChat(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      onPress={() => handleStartChat(item)}
      disabled={creatingChat}
      className="flex-row items-center px-4 py-4 border-b border-gray-100"
    >
      <Image
        source={{
          uri: item.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
        }}
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-3">
        <Text className="text-lg font-semibold text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">{item.email}</Text>
      </View>
      {creatingChat ? (
        <ActivityIndicator size="small" color="#FF7A00" />
      ) : (
        <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-xl font-bold text-gray-900 mr-6">
            Messages
          </Text>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-10">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-gray-900 text-sm"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Users List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text className="mt-2 text-gray-600">Loading users...</Text>
        </View>
      ) : filteredUsers.length > 0 ? (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item._id}
          scrollEnabled
        />
      ) : (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="people" size={48} color="#D1D5DB" />
          <Text className="mt-3 text-gray-500 font-semibold">
            No users found
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
