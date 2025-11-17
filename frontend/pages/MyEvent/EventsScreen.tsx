import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import UpcomingEvents from "./EventsUpcoming";
import PastEvents from "./EventsPass";

export default function EventsScreen() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center mt-2 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Events
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-center mb-5">
        <TouchableOpacity
          onPress={() => setTab("upcoming")}
          className={`px-6 py-2 rounded-full mr-3 ${
            tab === "upcoming" ? "bg-orange-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              tab === "upcoming" ? "text-white" : "text-gray-700"
            }`}
          >
            UPCOMING
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("past")}
          className={`px-6 py-2 rounded-full ${
            tab === "past" ? "bg-orange-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`font-medium ${
              tab === "past" ? "text-white" : "text-gray-700"
            }`}
          >
            PAST EVENTS
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {tab === "upcoming" ? <UpcomingEvents /> : <PastEvents />}
    </SafeAreaView>
  );
}
