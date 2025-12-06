import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import dayjs from "dayjs";

const FILTER_TYPES = [
  { key: "design", label: "Design" },
  { key: "music", label: "Music" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

// Fake Data
const EVENTS = [
  {
    id: 1,
    date: "2022-10-07",
    title: "Designers Meetup 2022",
    type: "design",
  },
  {
    id: 2,
    date: "2022-10-07",
    title: "Dribbblers Meetup 2022",
    type: "art",
  },
  {
    id: 3,
    date: "2022-10-10",
    title: "Food Competition Event",
    type: "food",
  },
  {
    id: 4,
    date: "2022-10-10",
    title: "Basketball Final Match",
    type: "sports",
  },
];

export default function CalendarScreen() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [filterModal, setFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // Lọc sự kiện theo ngày và filter
  const filteredEvents = EVENTS.filter((ev) => {
    const matchDate = ev.date === selectedDate;
    const matchFilter =
      selectedFilters.length === 0 || selectedFilters.includes(ev.type);
    return matchDate && matchFilter;
  });

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
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: "#FF7A00",
              },
            }}
            theme={{
              selectedDayBackgroundColor: "#FF7A00",
              todayTextColor: "#FF7A00",
            }}
          />
        </View>
      )}

      {/* SELECTED DATE TITLE */}
      <Text className="text-gray-900 font-semibold text-lg mb-2 mt-4">
        {dayjs(selectedDate).format("ddd, DD MMMM, YYYY").toUpperCase()}
      </Text>

      {/* EVENT LIST */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((ev) => (
            <View
              key={ev.id}
              className="bg-white rounded-xl p-4 shadow mb-3 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-lg font-semibold">{ev.title}</Text>
                <Text className="text-gray-500">{ev.type.toUpperCase()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#777" />
            </View>
          ))
        ) : (
          <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
            <Image
              source={{uri:"frontend\assets\no-task.png"}} // sửa đường dẫn image
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
