import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { getMyBookmarks } from "../../services/bookmark.service";
import { formatDateTime } from "../../utils/utils";

export default function EventBookmark() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;
  const imageHeight = isTablet ? 220 : isSmallDevice ? 140 : 160;

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const fetchBookmarks = useCallback(
    async (silent?: boolean) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const data = await getMyBookmarks(token);
        setBookmarks(data || []);
      } catch (error) {
        console.log("Fetch bookmarks error", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookmarks(true);
  }, [fetchBookmarks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return bookmarks;

    return bookmarks.filter((bookmark) => {
      const event = bookmark?.event;
      if (!event) return false;

      const title = (event.title || "").toLowerCase();
      const location = (event.location || "").toLowerCase();

      return title.includes(q) || location.includes(q);
    });
  }, [bookmarks, query]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const event = item.event;
      if (!event) return null;

      return (
        <TouchableOpacity
          activeOpacity={0.8}
          className="bg-white rounded-2xl mb-4 overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            elevation: 3,
          }}
          onPress={() =>
            navigation.navigate("EventDetails", {
              event,
              isBookmarked: true,
            })
          }
        >
          <Image
            source={{ uri: event.images }}
            className="w-full bg-gray-200"
            style={{
              height: imageHeight,
            }}
            resizeMode="cover"
          />

          <View className="p-4">
            <Text
              numberOfLines={2}
              className="font-semibold text-gray-900"
              style={{
                fontSize: isSmallDevice ? 15 : 17,
              }}
            >
              {event.title}
            </Text>

            <Text
              numberOfLines={1}
              className="text-gray-500 mt-1"
              style={{
                fontSize: isSmallDevice ? 12 : 13,
              }}
            >
              {formatDateTime(event.date)}
            </Text>

            <View className="flex-row justify-between items-center mt-3">
              <Text
                numberOfLines={1}
                className="text-gray-600 flex-1 mr-3"
                style={{
                  fontSize: isSmallDevice ? 12 : 13,
                }}
              >
                📍 {event.location}
              </Text>

              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text
                  className="text-orange-500 font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                  }}
                >
                  ${event.price}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, imageHeight, isSmallDevice]
  );

  const emptyComponent = useCallback(() => {
    if (loading) return null;

    return (
      <View className="flex-1 items-center justify-center px-6 py-24">
        <Ionicons name="heart-outline" size={56} color="#D1D5DB" />

        <Text
          className="font-semibold mt-4 text-center text-gray-900"
          style={{
            fontSize: isSmallDevice ? 16 : 18,
          }}
        >
          {query.trim()
            ? t("eventBookmark.noResultsFound")
            : t("eventBookmark.noFavoriteEvents")}
        </Text>

        <Text
          className="text-gray-500 text-center mt-2"
          style={{
            fontSize: isSmallDevice ? 12 : 13,
          }}
        >
          {query.trim()
            ? t("eventBookmark.tryDifferentKeyword")
            : t("eventBookmark.tapHeartIcon")}
        </Text>

        {!query.trim() && (
          <TouchableOpacity
            className="mt-5 bg-orange-500 px-5 py-3 rounded-2xl"
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Home")}
          >
            <Text className="text-white font-semibold">
              {t("eventBookmark.exploreEvents")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, query, t, navigation, isSmallDevice]);

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          className="flex-1"
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
          }}
        >
          <View className="flex-row items-center justify-between pb-3">
            <TouchableOpacity
              className="rounded-full bg-white items-center justify-center"
              style={{
                width: isSmallDevice ? 38 : 42,
                height: isSmallDevice ? 38 : 42,
              }}
              activeOpacity={0.75}
              hitSlop={10}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color="#111" />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold text-gray-900 flex-1 text-center mx-3"
              style={{
                fontSize: isTablet ? 22 : isSmallDevice ? 17 : 18,
              }}
            >
              {t("eventBookmark.myFavoriteEvents")}
            </Text>

            <View
              style={{
                width: isSmallDevice ? 38 : 42,
                height: isSmallDevice ? 38 : 42,
              }}
            />
          </View>

          <View className="pb-3">
            <View
              className="bg-white rounded-2xl px-3 flex-row items-center"
              style={{
                height: isSmallDevice ? 44 : 48,
              }}
            >
              <Ionicons name="search" size={18} color="#9CA3AF" />

              <TextInput
                className="flex-1 ml-2 text-gray-900"
                placeholder={t("eventBookmark.searchByEventName")}
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                style={{
                  fontSize: isSmallDevice ? 14 : 15,
                  paddingVertical: Platform.OS === "ios" ? 10 : 6,
                }}
              />

              {!!query && (
                <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              ListEmptyComponent={emptyComponent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              removeClippedSubviews={Platform.OS === "android"}
              initialNumToRender={6}
              maxToRenderPerBatch={6}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}