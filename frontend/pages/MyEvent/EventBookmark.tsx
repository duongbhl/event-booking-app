import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../context/AuthContext";
import { getMyBookmarks } from "../../services/bookmark.service";
import { formatDateTime } from "../../utils/utils";

export default function EventBookmark() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchBookmarks = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMyBookmarks(token);
      setBookmarks(data);
    } catch (error) {
      console.log("Fetch bookmarks error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarks;

    return bookmarks.filter((b) => {
      const e = b?.event;
      if (!e) return false;
      const title = (e.title || "").toLowerCase();
      const location = (e.location || "").toLowerCase();
      return title.includes(q) || location.includes(q);
    });
  }, [bookmarks, query]);

  const renderItem = ({ item }: { item: any }) => {
    const event = item.event;
    if (!event) return null;

    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 shadow"
        onPress={() =>
          navigation.navigate("EventDetails", {
            event,
            isBookmarked: true,
          })
        }
      >
        <Image
          source={{ uri: event.images }}
          className="w-full h-40 rounded-t-2xl"
        />

        <View className="p-4">
          <Text className="text-lg font-semibold text-gray-900">
            {event.title}
          </Text>

          <Text className="text-gray-500 mt-1">
            {formatDateTime(event.date)}
          </Text>

          <View className="flex-row justify-between items-center mt-3">
            <Text className="text-gray-600">📍 {event.location}</Text>

            <View className="bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-orange-500 font-semibold">
                ${event.price}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header: Go back + Title */}
      <View className="px-4 pt-2 pb-3 flex-row items-center justify-between">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={22} color="#111" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold text-gray-900">
          My Favorite Events
        </Text>

        {/* placeholder để title nằm giữa */}
        <View className="w-10 h-10" />
      </View>

      {/* Search bar */}
      <View className="px-4 pb-3">
        <View className="bg-white rounded-2xl px-3 py-2 flex-row items-center">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-900"
            placeholder="Search by event name or location..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="heart-outline" size={56} color="#ccc" />
          <Text className="text-lg font-semibold mt-4">
            {query.trim() ? "No results found" : "No favorite events yet"}
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {query.trim()
              ? "Try a different keyword."
              : "Tap the heart icon on an event to save it here."}
          </Text>

          {!query.trim() && (
            <TouchableOpacity
              className="mt-5 bg-black px-5 py-3 rounded-2xl"
              onPress={() => navigation.navigate("Home")}
            >
              <Text className="text-white font-semibold">Explore events</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={fetchBookmarks}
        />
      )}
    </SafeAreaView>
  );
}
