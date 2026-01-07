import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { searchUsers } from "../../services/chat.service";
import { sendInvitation } from "../../services/invite.service";

interface UserWithStatus {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  invited?: boolean;
}

export default function InviteFriend() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, token } = useAuth();

  const event = route.params?.event;
  const eventId = event?._id || route.params?.eventId;

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Search users
  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const delayTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchUsers(search, token!);
        setUsers(results);
      } catch (error) {
        console.log("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [search, token]);

  // Toggle user selection
  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Send invitations
  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select at least one user to invite");
      return;
    }

    if (!eventId) {
      Alert.alert("Error", "Event not found");
      return;
    }

    try {
      setIsSending(true);
      await sendInvitation(
        { userIds: selectedUsers, eventId },
        token!
      );
      Alert.alert("Success", "Invitations sent successfully!");
      setSelectedUsers([]);
      setSearch("");
      navigation.goBack();
    } catch (error) {
      console.log("Send invitation error:", error);
      Alert.alert("Error", "Failed to send invitations");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View className="flex-1 bg-white pt-14 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity className="p-1" onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111827" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold text-gray-900">
          Invite Friend
        </Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Event info */}
      {event && (
        <View className="bg-orange-50 rounded-lg p-3 mb-4">
          <Text className="text-sm font-semibold text-gray-900">
            {event.title}
          </Text>
          <Text className="text-xs text-gray-600 mt-1">
            {event.location}
          </Text>
        </View>
      )}

      {/* Search bar */}
      <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 h-12 mb-6">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-gray-900"
          editable={!isSending}
        />
        {search && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Users list */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isSearching ? (
          <View className="py-10 justify-center items-center">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : users.length > 0 ? (
          users.map((u) => (
            <TouchableOpacity
              key={u._id}
              onPress={() => toggleUser(u._id)}
              className="flex-row items-center justify-between bg-gray-50 rounded-lg p-4 mb-3"
              disabled={isSending}
            >
              <View className="flex-row items-center flex-1">
                <Image
                  source={{
                    uri: u.avatar || "https://via.placeholder.com/48",
                  }}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">
                    {u.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {u.email}
                  </Text>
                </View>
              </View>

              {selectedUsers.includes(u._id) ? (
                <Ionicons name="checkmark-circle" size={24} color="#FF7A00" />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color="#CCC"
                />
              )}
            </TouchableOpacity>
          ))
        ) : search ? (
          <View className="py-10 justify-center items-center">
            <Text className="text-gray-500">No users found</Text>
          </View>
        ) : (
          <View className="py-10 justify-center items-center">
            <Text className="text-gray-500">
              Search for users to invite
            </Text>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Invite button */}
      {selectedUsers.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <TouchableOpacity
            onPress={handleInvite}
            disabled={isSending}
            className={`rounded-lg py-4 ${
              isSending ? "bg-gray-400" : "bg-orange-500"
            }`}
          >
            {isSending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-center">
                Invite {selectedUsers.length} User
                {selectedUsers.length !== 1 ? "s" : ""}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
