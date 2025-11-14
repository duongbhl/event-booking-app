import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AdminHomeScreen() {
  const [filter, setFilter] = useState("all");

  const events = [
    { id: 1, title: "Sự kiện A", status: "accepted" },
    { id: 2, title: "Sự kiện B", status: "pending" },
    { id: 3, title: "Sự kiện C", status: "rejected" },
    { id: 4, title: "Sự kiện D", status: "accepted" },
  ];

  const filteredEvents =
    filter === "all" ? events : events.filter((e) => e.status === filter);

  const filterTabs = [
    { key: "all", label: "Tất cả" },
    { key: "accepted", label: "Chấp nhận" },
    { key: "rejected", label: "Từ chối" },
    { key: "pending", label: "Chờ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-2 mb-4">
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#111827" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-900">Admin Dashboard</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search bar */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mb-4">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          placeholder="Tìm kiếm sự kiện..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2 text-gray-900"
        />
      </View>

      {/* Filter Tabs */}
      <View className="flex-row mb-4" style={{ gap: 10 }}>
        {filterTabs.map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full ${
              filter === item.key ? "bg-black" : "bg-gray-200"
            }`}
          >
            <Text
              className={`text-sm ${
                filter === item.key ? "text-white" : "text-gray-700"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredEvents.map((ev) => (
          <View
            key={ev.id}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl px-4 py-4 mb-3"
          >
            <View>
              <Text className="text-lg font-semibold text-gray-900">{ev.title}</Text>
              <Text
                className={`mt-1 text-sm ${
                  ev.status === "accepted"
                    ? "text-green-600"
                    : ev.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {ev.status === "accepted"
                  ? "Chấp nhận"
                  : ev.status === "rejected"
                  ? "Từ chối"
                  : "Chờ duyệt"}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={22}
              color="#9CA3AF"
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
