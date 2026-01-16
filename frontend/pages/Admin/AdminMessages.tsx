import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { searchUsers, getMyRooms, createRoom } from "../../services/chat.service";

export default function AdminMessages() {
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch saved rooms when screen is focused
  useEffect(() => {
    if (!isFocused || !token) return;
    
    const fetchRooms = async () => {
      try {
        setLoading(true);
        const data = await getMyRooms(token);
        setRooms(data);
      } catch (error) {
        console.log("Fetch rooms error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [isFocused, token]);

  // Search users
  useEffect(() => {
    if (!search.trim()) {
      setSearchResults([]);
      return;
    }

    const delayTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchUsers(search, token!);
        setSearchResults(results);
      } catch (error) {
        console.log("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayTimer);
  }, [search, token]);

  // Get other member in 1-on-1 conversation
  const getOtherMember = (room: any) => {
    return room.members.find((m: any) => m._id !== user?._id);
  };

  // Handle user selection from search results
  const handleSelectUser = async (selectedUser: any) => {
    try {
      setLoading(true);
      const room = await createRoom(
        { memberIds: [selectedUser._id], isGroup: false },
        token!
      );
      setSearch("");
      setSearchResults([]);
      
      // Navigate to Chat screen with room
      navigation.navigate("Chat", { roomId: room._id, room });
    } catch (error) {
      console.log("Create room error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle room selection from saved conversations
  const handleSelectRoom = (room: any) => {
    navigation.navigate("Chat", { roomId: room._id, room });
  };

  // Display search results if searching, otherwise display saved rooms
  const displayData = search.trim() ? searchResults : rooms;
  const isShowingSearch = search.trim();

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
          placeholder={isShowingSearch ? "Find User" : "Find Conversation"}
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-gray-900"
        />
        {search && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* CONTENT */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : isShowingSearch ? (
          // Search Results
          <>
            {isSearching ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#FF7A00" />
              </View>
            ) : searchResults.length > 0 ? (
              searchResults.map((user) => (
                <TouchableOpacity
                  key={user._id}
                  onPress={() => handleSelectUser(user)}
                  className="flex-row items-center bg-gray-50 rounded-xl p-4 mb-3"
                >
                  <Image
                    source={{ uri: user.avatar || "https://via.placeholder.com/48" }}
                    className="w-12 h-12 rounded-full mr-3"
                    defaultSource={require("../../assets/no-task.png")}
                  />
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">
                      {user.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {user.email}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#CCC" />
                </TouchableOpacity>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-500">No users found</Text>
              </View>
            )}
          </>
        ) : (
          // Saved Conversations
          <>
            {rooms.length > 0 ? (
              rooms.map((room) => {
                const otherMember = getOtherMember(room);
                if (!otherMember) return null;

                return (
                  <TouchableOpacity
                    key={room._id}
                    onPress={() => handleSelectRoom(room)}
                    className="flex-row items-center justify-between bg-gray-50 rounded-xl p-4 mb-3"
                  >
                    <View className="flex-row items-center flex-1">
                      <Image
                        source={{
                          uri: otherMember.avatar || "https://via.placeholder.com/48",
                        }}
                        className="w-12 h-12 rounded-full mr-3"
                        defaultSource={require("../../assets/no-task.png")}
                      />
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {otherMember.name}
                        </Text>
                        <Text className="text-gray-500 text-xs">
                          {otherMember.email}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#CCC" />
                  </TouchableOpacity>
                );
              })
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Text className="text-gray-500">
                  No conversations yet. Search for users to start chatting!
                </Text>
              </View>
            )}
          </>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}
