import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EventCard from "../components/Cards/EventCard";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import EventCategoryBar from "../components/Bars/EventCategoryBar";
import { useAuth } from "../context/AuthContext";
import { useLocalization } from "../context/LocalizationContext";
import { getEvents } from "../services/event.service";
import { EventCardProps } from "../components/Interface/EventCardProps";
import EventPriceCard from "../components/Cards/EventPriceCard";

export const CATEGORIES = [
  { key: "music", label: "Music" },
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

export default function Home() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;
  const avatarSize = isSmallDevice ? 36 : 40;
  const menuSize = isSmallDevice ? 38 : 42;
  const myEventCardWidth = isTablet
    ? Math.min(width * 0.48, 420)
    : Math.min(width - horizontalPadding * 2 - 24, 330);

  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("music");

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

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents(true);
  }, [fetchEvents]);

  const todayStart = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  const myEvents = useMemo(() => {
    if (!user?._id) return [];

    return events.filter((ev) => {
      const isOwnEvent = ev.organizer?._id === user._id;

      const eventDate = new Date(ev.date);
      eventDate.setHours(0, 0, 0, 0);

      return isOwnEvent && eventDate >= todayStart;
    });
  }, [events, user?._id, todayStart]);

  const filteredEvents = useMemo(() => {
    if (!user?._id) return [];

    return events.filter((ev) => {
      const isOtherEvent = ev.organizer && ev.organizer._id !== user._id;
      const isSameCategory = ev.category === selectedCategory;
      const isAccepted = ev.approvalStatus === "ACCEPTED";

      const eventDate = new Date(ev.date);
      eventDate.setHours(0, 0, 0, 0);

      return (
        isOtherEvent &&
        isSameCategory &&
        isAccepted &&
        eventDate >= todayStart
      );
    });
  }, [events, selectedCategory, user?._id, todayStart]);

  const userCountry =
    user?.country && user.country.length > 0
      ? user.country
      : t("profile.addCountry");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
        }}
      >
        {/* HEADER */}
        <View
          className="flex-row justify-between items-center"
          style={{
            marginTop: isSmallDevice ? 6 : 10,
            marginBottom: isSmallDevice ? 12 : 16,
          }}
        >
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.openDrawer?.()}
              className="rounded-full items-center justify-center"
              style={{
                width: menuSize,
                height: menuSize,
                marginRight: isSmallDevice ? 6 : 8,
              }}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <Ionicons
                name="menu"
                size={isSmallDevice ? 25 : 28}
                color="#111827"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Profile" as never)}
              activeOpacity={0.75}
              hitSlop={8}
            >
              <Image
                source={{ uri: user?.avatar || DEFAULT_AVATAR }}
                className="rounded-full bg-gray-200"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                }}
              />
            </TouchableOpacity>

            <View className="ml-2 flex-1">
              <Text
                numberOfLines={1}
                className="text-gray-600"
                style={{
                  fontSize: isSmallDevice ? 11 : 12,
                }}
              >
                {t("common.hello")},
              </Text>

              <Text
                numberOfLines={1}
                className="font-semibold text-gray-900"
                style={{
                  fontSize: isSmallDevice ? 13 : 15,
                }}
              >
                {user?.name || "User"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.navigate("Profile" as never)}
            className="flex-row items-center justify-end"
            style={{
              maxWidth: isSmallDevice ? 110 : 150,
            }}
          >
            <Ionicons name="location" size={14} color="#FF7A00" />

            <Text
              numberOfLines={1}
              className="text-gray-900 ml-1"
              style={{
                fontSize: isSmallDevice ? 12 : 14,
              }}
            >
              {userCountry}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH BAR */}
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-2xl px-4"
          style={{
            height: isSmallDevice ? 44 : 48,
            marginBottom: isSmallDevice ? 16 : 20,
          }}
          activeOpacity={0.75}
          onPress={() => navigation.navigate("Search" as never)}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />

          <Text
            numberOfLines={1}
            className="ml-2 text-gray-500 flex-1"
            style={{
              fontSize: isSmallDevice ? 13 : 15,
            }}
          >
            {t("home.findAmazingEvents")}
          </Text>
        </TouchableOpacity>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 110 : 90,
            }}
          >
            {/* MY EVENTS */}
            <View className="flex-row justify-between items-center mb-3">
              <Text
                numberOfLines={1}
                className="font-semibold text-gray-900 flex-1"
                style={{
                  fontSize: isSmallDevice ? 18 : 20,
                }}
              >
                {t("home.myEvents")}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("MyEvent" as never)}
                activeOpacity={0.7}
                hitSlop={10}
              >
                <Text
                  className="text-orange-500 font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  {t("home.viewAll")}
                </Text>
              </TouchableOpacity>
            </View>

            {myEvents.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={myEventCardWidth + 14}
                contentContainerStyle={{
                  paddingRight: horizontalPadding,
                }}
              >
                {myEvents.map((ev) => (
                  <View
                    key={ev._id}
                    style={{
                      width: myEventCardWidth,
                      marginRight: 14,
                    }}
                  >
                    <EventCard {...ev} />
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="bg-gray-50 rounded-2xl px-4 py-6 items-center">
                <Ionicons name="calendar-outline" size={32} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2 text-center">
                  {t("home.noEvents") || "No events yet"}
                </Text>
              </View>
            )}

            {/* CATEGORY FILTER */}
            <Text
              className="font-semibold text-gray-900"
              style={{
                fontSize: isSmallDevice ? 17 : 18,
                marginTop: isSmallDevice ? 22 : 26,
                marginBottom: 12,
              }}
            >
              {t("home.chooseByCategory")}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: horizontalPadding,
              }}
            >
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.key;

                return (
                  <EventCategoryBar
                    key={cat.key}
                    title={cat.label}
                    iconKey={cat.key}
                    active={isActive}
                    onPress={() => setSelectedCategory(cat.key)}
                  />
                );
              })}
            </ScrollView>

            {/* FILTERED EVENTS */}
            <View style={{ marginTop: 20 }}>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => (
                  <View key={ev._id} style={{ marginBottom: 14 }}>
                    <EventPriceCard {...ev} />
                  </View>
                ))
              ) : (
                <View className="bg-gray-50 rounded-2xl px-4 py-8 items-center">
                  <Ionicons name="search-outline" size={34} color="#D1D5DB" />

                  <Text className="text-gray-500 mt-2 text-center">
                    {t("home.noEventsInCategory") ||
                      "No events in this category"}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}