import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused, useNavigation } from "@react-navigation/native";

import EventPriceCard from "../../components/Cards/EventPriceCard";
import EventCategoryBar from "../../components/Bars/EventCategoryBar";
import { CATEGORIES } from "../Home";
import { useAuth } from "../../context/AuthContext";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { getEvents } from "../../services/event.service";
import { useRoute } from "@react-navigation/native";



export default function Search() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [keyword, setKeyword] = useState<string>("");

  const route = useRoute<any>();

  const filters = route.params?.filters;


  const isFocused = useIsFocused();

  /* ---------------- FETCH EVENTS ---------------- */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.log("Fetch events error:", error);
      }
    };

    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused]);

  /* ---------------- TIME FILTER HELPER ---------------- */
  const isWithinTimeRange = (eventDate: Date, time?: string) => {
    const now = new Date();
    const date = new Date(eventDate);

    switch (time) {
      case "Tomorrow": {
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        return (
          date.getDate() === tomorrow.getDate() &&
          date.getMonth() === tomorrow.getMonth()
        );
      }

      case "This week": {
        const endOfWeek = new Date();
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
  };

  /* ---------------- FILTER LOGIC ---------------- */
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // ❌ không lấy event của mình
      if (ev.organizer?._id === user?._id) return false;

      // ✅ category
      if (filters?.category && ev.category !== filters.category) {
        return false;
      }

      // ✅ price
      const price = Number(ev.price || 0);
      if (
        (filters?.minPrice !== undefined && price < filters.minPrice) ||
        (filters?.maxPrice !== undefined && price > filters.maxPrice)
      ) {
        return false;
      }

      // ✅ time / date
      if (filters?.time) {
        if (!isWithinTimeRange(ev.date, filters.time)) {
          return false;
        }
      }

      return true;
    });
  }, [events, user, filters]);



  return (
    <View className="flex-1 bg-white px-4 pt-12">
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1 text-center mr-6">
          Search
        </Text>
      </View>

      {/* ================= SEARCH BAR ================= */}
      <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-2xl mb-6">
        <Ionicons name="search" size={20} color="#999" />

        <TextInput
          placeholder="Find amazing events"
          className="flex-1 ml-2 text-[15px]"
          value={keyword}
          onChangeText={setKeyword}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />

        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword("")}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="ml-2"
          onPress={() => navigation.navigate("Filter" as never)}
        >
          <Ionicons name="options-outline" size={22} color="#FF7A00" />
        </TouchableOpacity>
      </View>


      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="mt-2"
      >
        {filteredEvents.length === 0 ? (
          <View className="items-center mt-24">
            <Ionicons name="search-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 mt-4 text-base">
              No events found
            </Text>
          </View>
        ) : (
          <View className="gap-3 mt-3">
            {filteredEvents.map(item => (
              <EventPriceCard key={item._id} {...item} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
