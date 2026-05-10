import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { getOrganizerFollowers } from "../../services/bookmark.service";
import { getOrganizerEvents } from "../../services/event.service";
import EventPriceCard from "../../components/Cards/EventPriceCard";

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

type TabType = "about" | "events" | "reviews";

const TABS: { key: TabType; label: string }[] = [
  { key: "about", label: "About" },
  { key: "events", label: "Events" },
  { key: "reviews", label: "Reviews" },
];

export default function OrganizerProfile() {
  const [tab, setTab] = useState<TabType>("about");

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const organizer = route.params?.organizer;

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const avatarSize = isTablet ? 120 : isSmallDevice ? 92 : 104;

  const [followers, setFollowers] = useState(0);
  const [following] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!organizer?._id) return;

    try {
      setLoading(true);

      const followersCount = await getOrganizerFollowers(organizer._id);
      const organizerEvents = await getOrganizerEvents(organizer._id);

      setFollowers(followersCount);
      setEvents(organizerEvents);
    } catch (error) {
      console.log("Fetch organizer data error:", error);
    } finally {
      setLoading(false);
    }
  }, [organizer?._id]);

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);

  const header = useMemo(() => {
    return (
      <View>
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
            activeOpacity={0.7}
            className="p-1"
          >
            <Ionicons
              name="chevron-back"
              size={isTablet ? 32 : 26}
              color="#111827"
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="font-semibold flex-1 text-center mx-3"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
            }}
          >
            Organizer
          </Text>

          <View style={{ width: isTablet ? 32 : 26 }} />
        </View>

        <View className="items-center">
          <Image
            source={{
              uri: organizer?.avatar || DEFAULT_AVATAR,
            }}
            className="rounded-full bg-gray-200"
            style={{
              width: avatarSize,
              height: avatarSize,
            }}
          />

          <Text
            numberOfLines={1}
            className="mt-3 font-semibold text-gray-900"
            style={{
              fontSize: isTablet ? 22 : isSmallDevice ? 17 : 18,
            }}
          >
            {organizer?.name || "Unknown Organizer"}
          </Text>
        </View>

        <View
          className="flex-row justify-between bg-gray-50 rounded-2xl px-3 py-4"
          style={{
            marginTop: isSmallDevice ? 20 : 24,
            gap: 8,
          }}
        >
          <StatItem
            value={followers}
            label="Followers"
            isSmallDevice={isSmallDevice}
          />

          <StatItem
            value={following}
            label="Following"
            isSmallDevice={isSmallDevice}
          />

          <StatItem
            value={events.length}
            label="Events"
            isSmallDevice={isSmallDevice}
          />
        </View>

        <View className="flex-row mt-8 border-b border-gray-200">
          {TABS.map((item) => {
            const active = tab === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                className="flex-1 items-center pb-3"
                onPress={() => setTab(item.key)}
                activeOpacity={0.75}
              >
                <Text
                  className={`font-medium ${
                    active ? "text-orange-500" : "text-gray-500"
                  }`}
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  {item.label}
                </Text>

                {active && (
                  <View className="h-1 w-10 bg-orange-500 rounded-full mt-2" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }, [
    navigation,
    isTablet,
    isSmallDevice,
    organizer?.avatar,
    organizer?.name,
    avatarSize,
    followers,
    following,
    events.length,
    tab,
  ]);

  const renderContent = () => {
    if (loading) {
      return (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      );
    }

    if (tab === "about") {
      return (
        <View className="mt-6">
          <Text
            className="font-semibold mb-2 text-gray-900"
            style={{
              fontSize: isSmallDevice ? 16 : 18,
            }}
          >
            About
          </Text>

          <Text
            className="text-gray-600 leading-6"
            style={{
              fontSize: isSmallDevice ? 13 : 14,
            }}
          >
            {organizer?.description || "No description"}
          </Text>
        </View>
      );
    }

    if (tab === "reviews") {
      return (
        <View className="items-center justify-center py-16">
          <Ionicons name="chatbubble-outline" size={44} color="#D1D5DB" />
          <Text className="text-center mt-3 text-gray-400">Reviews…</Text>
        </View>
      );
    }

    return null;
  };

  const renderEvent = useCallback(
    ({ item }: { item: any }) => (
      <View style={{ marginBottom: 14 }}>
        <EventPriceCard {...item} />
      </View>
    ),
    []
  );

  const emptyEvents = useCallback(() => {
    if (loading || tab !== "events") return null;

    return (
      <View className="items-center justify-center py-16">
        <Ionicons name="calendar-outline" size={44} color="#D1D5DB" />
        <Text className="text-center mt-3 text-gray-400">No events yet</Text>
      </View>
    );
  }, [loading, tab]);

  if (tab !== "events") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <FlatList
          data={[{ key: tab }]}
          keyExtractor={(item) => item.key}
          ListHeaderComponent={header}
          renderItem={() => renderContent()}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
            paddingBottom: Platform.OS === "ios" ? 110 : 90,
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        ListHeaderComponent={header}
        ListEmptyComponent={emptyEvents}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={8}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isSmallDevice ? 8 : 12,
          paddingBottom: Platform.OS === "ios" ? 110 : 90,
        }}
      />
    </SafeAreaView>
  );
}

function StatItem({
  value,
  label,
  isSmallDevice,
}: {
  value: number;
  label: string;
  isSmallDevice: boolean;
}) {
  return (
    <View className="items-center flex-1">
      <Text
        className="font-bold text-gray-900"
        style={{
          fontSize: isSmallDevice ? 16 : 18,
        }}
      >
        {value}
      </Text>

      <Text
        numberOfLines={1}
        className="text-gray-500 mt-1"
        style={{
          fontSize: isSmallDevice ? 10 : 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}