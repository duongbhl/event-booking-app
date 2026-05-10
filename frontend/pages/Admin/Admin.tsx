import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  FlatList,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminEventCard from "../../components/Cards/AdminEventCard";
import {
  getAllEventsForAdmin,
  autoRejectExpiredEvents,
} from "../../services/event.service";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

type FilterType = "all" | "accepted" | "rejected" | "pending";

const FILTER_TABS = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "accepted", label: "Chấp nhận" },
  { key: "rejected", label: "Từ chối" },
  { key: "all", label: "Tất cả" },
] as const;

export default function AdminHomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { logout } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [filter, setFilter] = useState<FilterType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const fetchAllEvents = useCallback(
    async (query?: string, options?: { silent?: boolean }) => {
      const requestId = ++requestIdRef.current;

      try {
        if (options?.silent) {
          setSearching(true);
        } else {
          setLoading(true);
        }

        const data = await getAllEventsForAdmin(query);

        if (requestId !== requestIdRef.current) return;

        setEvents(data);

        if (!query) {
          try {
            const result = await autoRejectExpiredEvents();

            if (result?.modifiedCount > 0) {
              const updatedData = await getAllEventsForAdmin();
              if (requestId === requestIdRef.current) {
                setEvents(updatedData);
              }
            }
          } catch (error) {
            console.log("Auto reject error:", error);
          }
        }
      } catch (error) {
        console.log("Fetch all events error:", error);
        Alert.alert("Error", "Failed to fetch events");
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setSearching(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (isFocused) {
      fetchAllEvents();
    }

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [isFocused, fetchAllEvents]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllEvents(searchQuery || undefined, { silent: true });
    setRefreshing(false);
  }, [fetchAllEvents, searchQuery]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);

      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      searchTimerRef.current = setTimeout(() => {
        fetchAllEvents(text.trim() || undefined, { silent: true });
      }, 400);
    },
    [fetchAllEvents]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    fetchAllEvents(undefined, { silent: true });
  }, [fetchAllEvents]);

  const handleEventApproved = useCallback((approvedEvent: EventCardProps) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev._id === approvedEvent._id ? approvedEvent : ev
      )
    );
  }, []);

  const handleEventRejected = useCallback((rejectedEvent: EventCardProps) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev._id === rejectedEvent._id ? rejectedEvent : ev
      )
    );
  }, []);

  const handleViewDetails = useCallback(
    (event: EventCardProps) => {
      navigation.navigate("EventDetails", { event });
    },
    [navigation]
  );

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (filter === "all") return true;
      if (filter === "pending") return ev.approvalStatus === "PENDING";
      if (filter === "accepted") return ev.approvalStatus === "ACCEPTED";
      if (filter === "rejected") return ev.approvalStatus === "REJECTED";
      return true;
    });
  }, [events, filter]);

  const stats = useMemo(() => {
    const pending = events.filter((e) => e.approvalStatus === "PENDING").length;
    const accepted = events.filter(
      (e) => e.approvalStatus === "ACCEPTED"
    ).length;
    const rejected = events.filter(
      (e) => e.approvalStatus === "REJECTED"
    ).length;

    return {
      pending,
      accepted,
      rejected,
      total: events.length,
    };
  }, [events]);

  const handleSignOut = useCallback(() => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        onPress: () => setShowMenu(false),
      },
      {
        text: "Sign Out",
        onPress: async () => {
          setShowMenu(false);

          try {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: "SignIn" }],
            });
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
            console.error(error);
          }
        },
        style: "destructive",
      },
    ]);
  }, [logout, navigation]);

  const renderEvent = useCallback(
    ({ item }: { item: EventCardProps }) => (
      <AdminEventCard
        {...item}
        onApproved={handleEventApproved}
        onRejected={handleEventRejected}
        onViewDetails={() => handleViewDetails(item)}
      />
    ),
    [handleEventApproved, handleEventRejected, handleViewDetails]
  );

  const renderEmpty = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center py-20 px-6">
        <Ionicons name="folder-open" size={isSmallDevice ? 42 : 48} color="#D1D5DB" />
        <Text className="mt-3 text-gray-500 font-semibold">
          Không có sự kiện
        </Text>
        <Text className="text-gray-400 text-xs mt-1 text-center">
          {searchQuery
            ? "Không tìm thấy sự kiện phù hợp"
            : "Chưa có sự kiện chờ duyệt"}
        </Text>
      </View>
    );
  }, [loading, searchQuery, isSmallDevice]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View
        className="bg-white border-b border-gray-200"
        style={{
          paddingHorizontal: isTablet ? 28 : isSmallDevice ? 12 : 16,
          paddingTop: isTablet ? 18 : 14,
          paddingBottom: isTablet ? 16 : 12,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => setShowMenu((prev) => !prev)}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons
              name="menu"
              size={isTablet ? 32 : isSmallDevice ? 24 : 28}
              color="#111827"
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="font-bold text-gray-900 flex-1 text-center mx-3"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 17 : 20,
            }}
          >
            Admin Dashboard
          </Text>

          <TouchableOpacity
            onPress={handleRefresh}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons
              name="refresh"
              size={isTablet ? 28 : isSmallDevice ? 22 : 24}
              color="#FF7A00"
            />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View className="mb-3 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("AdminMessages");
              }}
              className="flex-row items-center px-4 py-3"
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubbles" size={20} color="#FF7A00" />
              <Text className="ml-3 text-orange-600 font-semibold">
                Messages
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center px-4 py-3 border-t border-gray-200"
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={20} color="#DC2626" />
              <Text className="ml-3 text-red-600 font-semibold">
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View
          className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-3"
          style={{
            height: isSmallDevice ? 40 : 44,
          }}
        >
          <Ionicons name="search" size={18} color="#9CA3AF" />

          <TextInput
            placeholder="Tìm kiếm sự kiện..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-gray-900"
            style={{
              fontSize: isSmallDevice ? 13 : 14,
              paddingVertical: Platform.OS === "ios" ? 10 : 6,
            }}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCorrect={false}
            returnKeyType="search"
          />

          {searching ? (
            <ActivityIndicator size="small" color="#FF7A00" />
          ) : searchQuery ? (
            <TouchableOpacity onPress={handleClearSearch} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row mb-2" style={{ gap: isSmallDevice ? 6 : 8 }}>
          <View className="flex-1 bg-yellow-50 rounded-lg p-2">
            <Text
              numberOfLines={1}
              className="text-yellow-700"
              style={{ fontSize: isSmallDevice ? 10 : 12 }}
            >
              Chờ duyệt
            </Text>
            <Text
              className="font-bold text-yellow-600"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {stats.pending}
            </Text>
          </View>

          <View className="flex-1 bg-green-50 rounded-lg p-2">
            <Text
              numberOfLines={1}
              className="text-green-700"
              style={{ fontSize: isSmallDevice ? 10 : 12 }}
            >
              Chấp nhận
            </Text>
            <Text
              className="font-bold text-green-600"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {stats.accepted}
            </Text>
          </View>

          <View className="flex-1 bg-red-50 rounded-lg p-2">
            <Text
              numberOfLines={1}
              className="text-red-700"
              style={{ fontSize: isSmallDevice ? 10 : 12 }}
            >
              Từ chối
            </Text>
            <Text
              className="font-bold text-red-600"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {stats.rejected}
            </Text>
          </View>
        </View>
      </View>

      <View
        className="bg-white pt-3 pb-2"
        style={{
          paddingHorizontal: isTablet ? 28 : isSmallDevice ? 12 : 16,
        }}
      >
        <FlatList
          horizontal
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item.key)}
              className={`rounded-full ${
                filter === item.key ? "bg-orange-500" : "bg-gray-200"
              }`}
              style={{
                paddingHorizontal: isSmallDevice ? 12 : 16,
                paddingVertical: isSmallDevice ? 7 : 8,
              }}
              activeOpacity={0.75}
            >
              <Text
                className={`font-semibold ${
                  filter === item.key ? "text-white" : "text-gray-700"
                }`}
                style={{
                  fontSize: isSmallDevice ? 11 : 12,
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text className="mt-2 text-gray-600">Đang tải sự kiện...</Text>
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
          initialNumToRender={6}
          maxToRenderPerBatch={6}
          windowSize={8}
          updateCellsBatchingPeriod={50}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={{
            paddingHorizontal: isTablet ? 28 : isSmallDevice ? 12 : 16,
            paddingTop: 16,
            paddingBottom: 24,
          }}
        />
      )}
    </SafeAreaView>
  );
}