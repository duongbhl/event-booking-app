import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";

import dayjs from "dayjs";
import { getMyTickets } from "../../services/ticket.service";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/utils";
import EventPriceCard from "../../components/Cards/EventPriceCard";

const FILTER_TYPES = [
  { key: "design", label: "Design" },
  { key: "music", label: "Music" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

export default function CalendarTable() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [filterModal, setFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("music");
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  
  // Fetch purchased tickets when the screen is focused
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        if (!token) return;
        const data = await getMyTickets(token);
        // Only include tickets with paid status
        const paidTickets = data.filter((t: any) => t.paymentStatus === "paid" && t.event);
        setTickets(paidTickets);
      } catch (error) {
        console.log("Fetch tickets error:", error);
      }
    };

    if (isFocused) {
      fetchTickets();
    }
  }, [isFocused, token]);

  // Extract unique events from tickets and filter out user's own events
  const allEvents = useMemo(() => {
    const uniqueEventMap = new Map<string, EventCardProps>();
    tickets.forEach((t: any) => {
      if (t.event && t.event._id && t.event.organizer?._id !== user?._id) {
        uniqueEventMap.set(t.event._id, t.event);
      }
    });
    return Array.from(uniqueEventMap.values());
  }, [tickets, user]);

  // Filter events by selected date and category
  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const eventDate = formatDate(ev.date);
      const matchDate = eventDate === selectedDate;
      const matchFilter =
        selectedFilters.length === 0 || selectedFilters.includes(ev.category);
      return matchDate && matchFilter;
    });
  }, [allEvents, selectedDate, selectedFilters]);

  // Get all tickets for the filtered events (to show ticket counts)
  const filteredTickets = useMemo(() => {
    const filteredEventIds = new Set(filteredEvents.map((e) => e._id));
    return tickets.filter((t: any) => filteredEventIds.has(t.event?._id));
  }, [tickets, filteredEvents]);

  // Build marked dates for calendar with ticket counts
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    // Count tickets per day
    const ticketsByDay: Record<string, number> = {};
    tickets.forEach((t: any) => {
      if (t.event) {
        const d = formatDate(t.event.date);
        ticketsByDay[d] = (ticketsByDay[d] || 0) + 1;
      }
    });

    // Build marks with counts
    Object.entries(ticketsByDay).forEach(([date, count]) => {
      marks[date] = {
        marked: true,
        dotColor: "#FF7A00",
        customStyles: {
          container: {
            backgroundColor: "transparent",
          },
          text: {
            color: "#FF7A00",
            fontWeight: "bold",
            fontSize: 12,
          },
        },
      };
    });

    // Ensure selected day is highlighted
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#FF7A00",
    };
    
    return marks;
  }, [tickets, selectedDate]);


  const toggleFilter = (key: string) => {
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* HEADER */}
      <View className="flex-row justify-between items-center mt-4">


        <TouchableOpacity
          onPress={() => setOpenCalendar(!openCalendar)}
          className="flex-row ml-[12rem]"
        >
          <Text className="text-xl font-semibold">Calendar</Text>
          <Ionicons
            name={openCalendar ? "chevron-up" : "chevron-down"}
            size={22}
            className="items-end justify-end"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setFilterModal(true)}>
          <Ionicons name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* CALENDAR DROPDOWN */}
      {openCalendar && (
        <View className="bg-gray-50 rounded-xl p-3 shadow mb-4 mt-5">
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: "#FF7A00",
              todayTextColor: "#FF7A00",
            }}
          />
        </View>
      )}

      {/* SELECTED DATE TITLE WITH TICKET COUNT */}
      <View className="flex-row justify-between items-center mb-2 mt-4">
        <Text className="text-gray-900 font-semibold text-lg">
          {dayjs(selectedDate).format("ddd, DD MMMM, YYYY").toUpperCase()}
        </Text>
        {filteredEvents.length > 0 && (
          <Text className="text-orange-500 font-semibold text-sm">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {/* EVENT LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const eventTicketCount = filteredTickets.filter(
              (t) => t.event?._id === event._id
            ).length;
            return (
              <View
                key={event._id}
                className="mb-4"
              >
                <View className="flex-row justify-between items-center mb-1 px-5">
                  <Text className="text-xs text-gray-500">
                    {eventTicketCount} ticket{eventTicketCount !== 1 ? "s" : ""}
                  </Text>
                </View>
                <EventPriceCard {...event}/>
              </View>
            );
          })
        ) : (
          <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
            <Image
              source={require("../../assets/no-task.png")}
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />

            <Text className="text-xl font-semibold mt-4">Ups! There is no events available</Text>
          </SafeAreaView>
        )}
      </ScrollView>

      {/* FILTER MODAL */}
      <Modal transparent visible={filterModal} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center">
          <View className="bg-white w-80 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-2">Filter Events</Text>

            {FILTER_TYPES.map((item) => (
              <TouchableOpacity
                key={item.key}
                className="flex-row items-center justify-between py-2"
                onPress={() => toggleFilter(item.key)}
              >
                <Text className="text-base">{item.label}</Text>
                {selectedFilters.includes(item.key) && (
                  <Ionicons name="checkmark-circle" size={22} color="#FF7A00" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setFilterModal(false)}
              className="bg-black rounded-xl mt-4 py-3"
            >
              <Text className="text-white text-center font-semibold">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
