import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { getMyEvents } from "../../services/event.service";
import EventCard from "../../components/Cards/EventCard";
import { EventCardProps } from "../../components/Interface/EventCardProps";

export default function UpcomingEvents() {
  const { t } = useLocalization();
  const { token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;

  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(
    async (silent?: boolean) => {
      if (!token) return;

      try {
        if (!silent) {
          setLoading(true);
        }

        const data = await getMyEvents(token);
        setEvents(data || []);
      } catch (error) {
        console.log("Fetch upcoming events error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused, fetchEvents]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return events
      .filter((event) => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);

        return eventDate >= today;
      })
      .sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [events]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(true);
  }, [fetchEvents]);

  const handleDelete = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((event) => event._id !== eventId));
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: EventCardProps }) => (
      <EventCard {...item} onDelete={handleDelete} />
    ),
    [handleDelete]
  );

  const emptyComponent = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center py-20 px-6">
        <Ionicons
          name="calendar-outline"
          size={isSmallDevice ? 52 : 60}
          color="#D1D5DB"
        />

        <Text
          className="text-gray-500 text-center mt-4 font-semibold"
          style={{
            fontSize: isSmallDevice ? 14 : 16,
          }}
        >
          {t("myEventList.noUpcomingEvents") || "No upcoming events"}
        </Text>

        <Text
          className="text-gray-400 text-center mt-2"
          style={{
            fontSize: isSmallDevice ? 12 : 13,
          }}
        >
          {t("myEventList.createEventHint") ||
            "Your upcoming events will appear here."}
        </Text>
      </View>
    );
  }, [loading, isSmallDevice, t]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FF7A00" />
      </View>
    );
  }

  return (
    <FlatList
      data={upcomingEvents}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListEmptyComponent={emptyComponent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={Platform.OS === "android"}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={8}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: Platform.OS === "ios" ? 110 : 90,
      }}
    />
  );
}