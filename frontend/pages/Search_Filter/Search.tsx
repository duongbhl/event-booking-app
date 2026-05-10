import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";

import EventPriceCard from "../../components/Cards/EventPriceCard";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { getEvents } from "../../services/event.service";

export default function Search() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();

  const { user } = useAuth();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();

  const filters = route.params?.filters;

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;
  const inputHeight = isSmallDevice ? 44 : 48;

  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async (silent?: boolean) => {
    try {
      if (!silent) {
        setLoading(true);
      }

      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.log("Fetch events error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused, fetchEvents]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(true);
  }, [fetchEvents]);

  const isWithinTimeRange = useCallback((eventDate: string | Date, time?: string) => {
    const now = new Date();
    const date = new Date(eventDate);

    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    switch (time) {
      case "Tomorrow": {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        return date.getTime() === tomorrow.getTime();
      }

      case "This week": {
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

        return date >= now && date <= endOfWeek;
      }

      case "This month": {
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear() &&
          date >= now
        );
      }

      default:
        return true;
    }
  }, []);

  const suggestions = useMemo(() => {
    if (keyword.trim().length < 1) return [];

    const keywordLower = keyword.trim().toLowerCase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uniqueTitles = new Set<string>();

    events.forEach((ev) => {
      const eventDate = new Date(ev.date);
      eventDate.setHours(0, 0, 0, 0);

      if (ev.organizer?._id === user?._id) return;
      if (ev.approvalStatus !== "ACCEPTED") return;
      if (eventDate < today) return;

      if (ev.title?.toLowerCase().includes(keywordLower)) {
        uniqueTitles.add(ev.title);
      }
    });

    return Array.from(uniqueTitles).slice(0, 6);
  }, [events, keyword, user?._id]);

  const filteredEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const keywordLower = debouncedKeyword.toLowerCase();

    return events.filter((ev) => {
      const eventDate = new Date(ev.date);
      eventDate.setHours(0, 0, 0, 0);

      if (ev.organizer?._id === user?._id) return false;
      if (ev.approvalStatus !== "ACCEPTED") return false;
      if (eventDate < today) return false;

      if (filters?.category && ev.category !== filters.category) {
        return false;
      }

      const price = Number(ev.price || 0);

      if (
        filters?.minPrice !== undefined &&
        price < Number(filters.minPrice)
      ) {
        return false;
      }

      if (
        filters?.maxPrice !== undefined &&
        price > Number(filters.maxPrice)
      ) {
        return false;
      }

      if (filters?.time && !isWithinTimeRange(ev.date, filters.time)) {
        return false;
      }

      if (
        keywordLower.length > 0 &&
        !ev.title?.toLowerCase().includes(keywordLower)
      ) {
        return false;
      }

      return true;
    });
  }, [events, user?._id, filters, debouncedKeyword, isWithinTimeRange]);

  const handleSelectSuggestion = useCallback((title: string) => {
    setKeyword(title);
    setDebouncedKeyword(title);
  }, []);

  const handleClearKeyword = useCallback(() => {
    setKeyword("");
    setDebouncedKeyword("");
  }, []);

  const renderEvent = useCallback(
    ({ item }: { item: EventCardProps }) => (
      <View style={{ marginBottom: 14 }}>
        <EventPriceCard {...item} />
      </View>
    ),
    []
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center" style={{ marginTop: 90 }}>
        <Ionicons
          name="search-outline"
          size={isSmallDevice ? 52 : 64}
          color="#D1D5DB"
        />

        <Text
          className="text-gray-500 mt-4"
          style={{ fontSize: isSmallDevice ? 14 : 16 }}
        >
          No events found
        </Text>
      </View>
    );
  }, [loading, isSmallDevice]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View
          className="flex-1"
          style={{
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View
            className="flex-row items-center"
            style={{
              marginTop: isSmallDevice ? 6 : 10,
              marginBottom: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
              className="p-1"
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 32 : 26}
                color="black"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold flex-1 text-center"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
                marginRight: 32,
              }}
            >
              {t("search.search")}
            </Text>
          </View>

          <View
            className="flex-row items-center bg-gray-100 rounded-2xl px-4"
            style={{
              height: inputHeight,
              marginBottom: 10,
            }}
          >
            <Ionicons name="search" size={20} color="#999" />

            <TextInput
              placeholder={t("home.findAmazingEvents")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2 text-gray-900"
              style={{
                fontSize: isSmallDevice ? 14 : 15,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
              }}
              value={keyword}
              onChangeText={setKeyword}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              keyboardType="default"
              clearButtonMode="while-editing"
            />

            {keyword.length > 0 && (
              <TouchableOpacity
                onPress={handleClearKeyword}
                hitSlop={10}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate("Filter" as never)}
              hitSlop={10}
              activeOpacity={0.7}
              style={{ marginLeft: 10 }}
            >
              <Ionicons name="options-outline" size={22} color="#FF7A00" />
            </TouchableOpacity>
          </View>

          {suggestions.length > 0 && keyword.length > 0 && (
            <View className="mb-3 bg-gray-50 rounded-2xl overflow-hidden">
              {suggestions.map((item, index) => (
                <View key={`${item}-${index}`}>
                  <TouchableOpacity
                    onPress={() => handleSelectSuggestion(item)}
                    className="px-4 py-3 flex-row items-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search" size={16} color="#999" />

                    <Text
                      className="ml-3 text-gray-700 flex-1"
                      numberOfLines={1}
                      style={{ fontSize: isSmallDevice ? 13 : 14 }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>

                  {index < suggestions.length - 1 && (
                    <View className="h-px bg-gray-200 mx-4" />
                  )}
                </View>
              ))}
            </View>
          )}

          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : (
            <FlatList
              data={filteredEvents}
              keyExtractor={(item) => item._id}
              renderItem={renderEvent}
              ListEmptyComponent={renderEmpty}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              removeClippedSubviews={Platform.OS === "android"}
              initialNumToRender={8}
              maxToRenderPerBatch={8}
              windowSize={8}
              updateCellsBatchingPeriod={50}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                />
              }
              contentContainerStyle={{
                flexGrow: 1,
                paddingTop: 8,
                paddingBottom: Platform.OS === "ios" ? 110 : 90,
              }}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}