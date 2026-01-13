import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminEventCard from "../../components/Cards/AdminEventCard";
import { getAllEventsForAdmin, autoRejectExpiredEvents } from "../../services/event.service";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";

type FilterType = "all" | "accepted" | "rejected" | "pending";

export default function AdminHomeScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { logout } = useAuth();
  const [filter, setFilter] = useState<FilterType>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filterTabs = [
    { key: "pending", label: "Chờ duyệt" },
    { key: "accepted", label: "Chấp nhận" },
    { key: "rejected", label: "Từ chối" },
    { key: "all", label: "Tất cả" },
  ] as const;

  const fetchAllEvents = async (query?: string) => {
    try {
      setLoading(true);
      const data = await getAllEventsForAdmin(query);
      setEvents(data);
      
      // Auto reject expired pending events
      try {
        const result = await autoRejectExpiredEvents();
        if (result.modifiedCount > 0) {
          // Refresh the list after auto-rejection
          const updatedData = await getAllEventsForAdmin(query);
          setEvents(updatedData);
        }
      } catch (error) {
        console.log("Auto reject error:", error);
      }
    } catch (error) {
      console.log("Fetch all events error:", error);
      Alert.alert("Error", "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchAllEvents();
    }
  }, [isFocused]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllEvents(searchQuery);
    setRefreshing(false);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim()) {
      fetchAllEvents(text);
    } else {
      fetchAllEvents();
    }
  };

  const handleEventApproved = (approvedEvent: EventCardProps) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev._id === approvedEvent._id ? approvedEvent : ev
      )
    );
  };

  const handleEventRejected = (rejectedEvent: EventCardProps) => {
    setEvents((prevEvents) =>
      prevEvents.map((ev) =>
        ev._id === rejectedEvent._id ? rejectedEvent : ev
      )
    );
  };

  const handleViewDetails = (event: EventCardProps) => {
    navigation.navigate("EventDetails", { event });
  };

  // Filter events based on approval status
  const filteredEvents = events.filter((ev) => {
    if (filter === "all") return true;
    if (filter === "pending") return ev.approvalStatus === "PENDING";
    if (filter === "accepted") return ev.approvalStatus === "ACCEPTED";
    if (filter === "rejected") return ev.approvalStatus === "REJECTED";
    return true;
  });

  const getStatistics = () => {
    const pending = events.filter((e) => e.approvalStatus === "PENDING").length;
    const accepted = events.filter((e) => e.approvalStatus === "ACCEPTED").length;
    const rejected = events.filter((e) => e.approvalStatus === "REJECTED").length;
    return { pending, accepted, rejected, total: events.length };
  };

  const stats = getStatistics();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", onPress: () => setShowMenu(false) },
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
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Ionicons name="menu" size={28} color="#111827" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">
            Admin Dashboard
          </Text>
          <TouchableOpacity onPress={handleRefresh}>
            <Ionicons name="refresh" size={24} color="#FF7A00" />
          </TouchableOpacity>
        </View>

        {/* Admin Menu */}
        {showMenu && (
          <View className="mb-3 bg-gray-50 rounded-lg border border-gray-200">
            <TouchableOpacity
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("AdminMessages");
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Ionicons name="chatbubbles" size={20} color="#FF7A00" />
              <Text className="ml-3 text-orange-600 font-semibold">Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center px-4 py-3 border-t border-gray-200"
            >
              <Ionicons name="log-out" size={20} color="#DC2626" />
              <Text className="ml-3 text-red-600 font-semibold">Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-10 mb-3">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm kiếm sự kiện..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-gray-900 text-sm"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Statistics */}
        <View className="flex-row gap-2 mb-2">
          <View className="flex-1 bg-yellow-50 rounded-lg p-2">
            <Text className="text-xs text-yellow-700">Chờ duyệt</Text>
            <Text className="text-lg font-bold text-yellow-600">
              {stats.pending}
            </Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-2">
            <Text className="text-xs text-green-700">Chấp nhận</Text>
            <Text className="text-lg font-bold text-green-600">
              {stats.accepted}
            </Text>
          </View>
          <View className="flex-1 bg-red-50 rounded-lg p-2">
            <Text className="text-xs text-red-700">Từ chối</Text>
            <Text className="text-lg font-bold text-red-600">
              {stats.rejected}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 pt-3 pb-2 flex-row gap-2" style={{ gap: 8 }}>
        {filterTabs.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full ${
              filter === item.key ? "bg-orange-500" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === item.key ? "text-white" : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        className="flex-1 px-4 pt-4"
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#FF7A00" />
            <Text className="mt-2 text-gray-600">Đang tải sự kiện...</Text>
          </View>
        ) : filteredEvents.length > 0 ? (
          <>
            {filteredEvents.map((ev) => (
              <AdminEventCard
                key={ev._id}
                {...ev}
                onApproved={handleEventApproved}
                onRejected={handleEventRejected}
                onViewDetails={() => handleViewDetails(ev)}
              />
            ))}
            <View className="h-4" />
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="folder-open" size={48} color="#D1D5DB" />
            <Text className="mt-3 text-gray-500 font-semibold">
              Không có sự kiện
            </Text>
            <Text className="text-gray-400 text-xs mt-1">
              {searchQuery
                ? "Không tìm thấy sự kiện phù hợp"
                : "Chưa có sự kiện chờ duyệt"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
