import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";
import { useIsFocused } from "@react-navigation/native";

import { getMyTickets } from "../../services/ticket.service";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/utils";
import EventPriceCard from "../../components/Cards/EventPriceCard";
import { useLocalization } from "../../context/LocalizationContext";

const FILTER_TYPES = [
  { key: "design", label: "Design" },
  { key: "music", label: "Music" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

export default function CalendarTable() {
  const { t } = useLocalization();
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;
  const modalWidth = isTablet ? 420 : Math.min(width - 40, 340);

  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [filterModal, setFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(
    async (silent?: boolean) => {
      if (!token) return;

      try {
        if (!silent) {
          setLoading(true);
        }

        const data = await getMyTickets(token);

        const paidTickets = data.filter(
          (item: any) => item.paymentStatus === "paid" && item.event
        );

        setTickets(paidTickets);
      } catch (error) {
        console.log("Fetch tickets error:", error);
        setTickets([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isFocused) {
      fetchTickets();
    }
  }, [isFocused, fetchTickets]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTickets(true);
  }, [fetchTickets]);

  const allEvents = useMemo(() => {
    const uniqueEventMap = new Map<string, EventCardProps>();

    tickets.forEach((ticket: any) => {
      const event = ticket.event;

      if (event && event._id && event.organizer?._id !== user?._id) {
        uniqueEventMap.set(event._id, event);
      }
    });

    return Array.from(uniqueEventMap.values());
  }, [tickets, user?._id]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const eventDate = formatDate(event.date);
      const matchDate = eventDate === selectedDate;

      const matchFilter =
        selectedFilters.length === 0 ||
        selectedFilters.includes(event.category);

      return matchDate && matchFilter;
    });
  }, [allEvents, selectedDate, selectedFilters]);

  const filteredTickets = useMemo(() => {
    const filteredEventIds = new Set(filteredEvents.map((event) => event._id));

    return tickets.filter((ticket: any) =>
      filteredEventIds.has(ticket.event?._id)
    );
  }, [tickets, filteredEvents]);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    const ticketsByDay: Record<string, number> = {};

    tickets.forEach((ticket: any) => {
      if (!ticket.event) return;

      const date = formatDate(ticket.event.date);
      ticketsByDay[date] = (ticketsByDay[date] || 0) + 1;
    });

    Object.entries(ticketsByDay).forEach(([date]) => {
      marks[date] = {
        marked: true,
        dotColor: "#FF7A00",
      };
    });

    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "#FF7A00",
      selectedTextColor: "#FFFFFF",
    };

    return marks;
  }, [tickets, selectedDate]);

  const selectedDateTitle = useMemo(() => {
    return dayjs(selectedDate).format("ddd, DD MMMM, YYYY").toUpperCase();
  }, [selectedDate]);

  const toggleFilter = useCallback((key: string) => {
    setSelectedFilters((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedFilters([]);
  }, []);

  const renderEvent = useCallback(
    ({ item }: { item: EventCardProps }) => {
      const eventTicketCount = filteredTickets.filter(
        (ticket: any) => ticket.event?._id === item._id
      ).length;

      return (
        <View style={{ marginBottom: 14 }}>
          <View className="flex-row justify-between items-center mb-2 px-1">
            <Text
              className="text-gray-500"
              style={{
                fontSize: isSmallDevice ? 11 : 12,
              }}
            >
              {eventTicketCount} ticket{eventTicketCount !== 1 ? "s" : ""}
            </Text>
          </View>

          <EventPriceCard {...item} />
        </View>
      );
    },
    [filteredTickets, isSmallDevice]
  );

  const emptyComponent = useCallback(() => {
    if (loading) return null;

    return (
      <View className="items-center justify-center py-20 px-6">
        <Image
          source={require("../../assets/no-task.png")}
          style={{
            width: isSmallDevice ? 140 : 180,
            height: isSmallDevice ? 140 : 180,
          }}
          resizeMode="contain"
        />

        <Text
          className="font-semibold mt-4 text-center text-gray-900"
          style={{
            fontSize: isSmallDevice ? 17 : 20,
          }}
        >
          {t("calendar.noEventsAvailable")}
        </Text>
      </View>
    );
  }, [loading, isSmallDevice, t]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
        }}
      >
        <View
          className="flex-row items-center justify-between"
          style={{
            marginTop: isSmallDevice ? 6 : 10,
            marginBottom: 14,
          }}
        >
          <View style={{ width: 34 }} />

          <TouchableOpacity
            onPress={() => setOpenCalendar((prev) => !prev)}
            activeOpacity={0.75}
            hitSlop={10}
            className="flex-row items-center justify-center flex-1"
          >
            <Text
              numberOfLines={1}
              className="font-semibold text-gray-900"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              }}
            >
              {t("calendar.title")}
            </Text>

            <Ionicons
              name={openCalendar ? "chevron-up" : "chevron-down"}
              size={isSmallDevice ? 20 : 22}
              color="#111827"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilterModal(true)}
            activeOpacity={0.75}
            hitSlop={10}
            className="items-end"
            style={{ width: 34 }}
          >
            <Ionicons
              name="filter"
              size={isSmallDevice ? 22 : 24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {openCalendar && (
          <View
            className="bg-gray-50 rounded-2xl p-2 shadow mb-4"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Calendar
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
                setOpenCalendar(false);
              }}
              markedDates={markedDates}
              theme={{
                selectedDayBackgroundColor: "#FF7A00",
                todayTextColor: "#FF7A00",
                arrowColor: "#FF7A00",
                textDayFontSize: isSmallDevice ? 13 : 15,
                textMonthFontSize: isSmallDevice ? 15 : 17,
                textDayHeaderFontSize: isSmallDevice ? 12 : 13,
              }}
            />
          </View>
        )}

        <View className="flex-row justify-between items-center mb-3">
          <Text
            numberOfLines={1}
            className="text-gray-900 font-semibold flex-1"
            style={{
              fontSize: isSmallDevice ? 14 : 16,
            }}
          >
            {selectedDateTitle}
          </Text>

          {filteredEvents.length > 0 && (
            <Text
              className="text-orange-500 font-semibold ml-2"
              style={{
                fontSize: isSmallDevice ? 12 : 13,
              }}
            >
              {filteredTickets.length} ticket
              {filteredTickets.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {selectedFilters.length > 0 && (
          <View className="flex-row flex-wrap mb-3" style={{ gap: 8 }}>
            {selectedFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => toggleFilter(filter)}
                className="bg-orange-50 rounded-full px-3 py-1 flex-row items-center"
                activeOpacity={0.75}
              >
                <Text
                  className="text-orange-500 font-semibold"
                  style={{ fontSize: isSmallDevice ? 11 : 12 }}
                >
                  {filter}
                </Text>

                <Ionicons
                  name="close"
                  size={14}
                  color="#FF7A00"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={clearFilters}
              className="bg-gray-100 rounded-full px-3 py-1"
              activeOpacity={0.75}
            >
              <Text
                className="text-gray-500 font-semibold"
                style={{ fontSize: isSmallDevice ? 11 : 12 }}
              >
                {t("calendar.clear")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : (
          <FlatList
            data={filteredEvents}
            keyExtractor={(item) => item._id}
            renderItem={renderEvent}
            ListEmptyComponent={emptyComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={8}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: Platform.OS === "ios" ? 110 : 90,
            }}
          />
        )}
      </View>

      <Modal
        transparent
        visible={filterModal}
        animationType="fade"
        onRequestClose={() => setFilterModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-center items-center px-5">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setFilterModal(false)}
            className="absolute inset-0"
          />

          <View
            className="bg-white rounded-2xl p-4"
            style={{
              width: modalWidth,
            }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text
                className="font-semibold text-gray-900"
                style={{
                  fontSize: isSmallDevice ? 17 : 18,
                }}
              >
                {t("calendar.filterEvents")}
              </Text>

              <TouchableOpacity
                onPress={() => setFilterModal(false)}
                hitSlop={10}
                activeOpacity={0.75}
              >
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {FILTER_TYPES.map((item) => {
              const active = selectedFilters.includes(item.key);

              return (
                <TouchableOpacity
                  key={item.key}
                  className="flex-row items-center justify-between py-3"
                  onPress={() => toggleFilter(item.key)}
                  activeOpacity={0.75}
                >
                  <Text
                    className="text-gray-800"
                    style={{
                      fontSize: isSmallDevice ? 14 : 16,
                    }}
                  >
                    {item.label}
                  </Text>

                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={active ? "#FF7A00" : "#D1D5DB"}
                  />
                </TouchableOpacity>
              );
            })}

            <View className="flex-row mt-4" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={clearFilters}
                className="flex-1 border border-gray-300 rounded-xl items-center justify-center"
                activeOpacity={0.75}
                style={{
                  height: isSmallDevice ? 46 : 50,
                }}
              >
                <Text
                  className="text-gray-700 font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  {t("calendar.clear")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterModal(false)}
                className="flex-1 bg-black rounded-xl items-center justify-center"
                activeOpacity={0.85}
                style={{
                  height: isSmallDevice ? 46 : 50,
                }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  {t("calendar.apply")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}