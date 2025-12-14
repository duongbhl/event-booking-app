import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

import { CATEGORIES } from "../Home";
import EventCategoryBar from "../../components/Bars/EventCategoryBar";

/* ================= TYPES ================= */
type TimeOption = "Tomorrow" | "This week" | "This month";

type SearchFilter = {
  category?: string;
  time?: TimeOption;
  date?: Date;
  minPrice?: number;
  maxPrice?: number;
};

const timeOptions: TimeOption[] = ["Tomorrow", "This week", "This month"];

export default function Filter() {
  const navigation = useNavigation<any>();

  /* ================= STATE ================= */
  const [selectedCategory, setSelectedCategory] = useState<string>("music");
  const [selectedTime, setSelectedTime] = useState<TimeOption>("Tomorrow");

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(120);

  /* ================= HANDLERS ================= */
  const handleApply = () => {
    const filters: SearchFilter = {
      category: selectedCategory,
      time: selectedTime,
      date:date,
      minPrice, 
      maxPrice,
    };

    navigation.navigate("Search", { filters });
  };

  const handleReset = () => {
    setSelectedCategory("music");
    setSelectedTime("Tomorrow");
    setMinPrice(0);
    setMaxPrice(120);
    setDate(new Date());
  };

  return (
    <View className="flex-1 bg-white px-5 pt-12">
      {/* ================= HEADER ================= */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1 text-center mr-6">
          Filter
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= CATEGORY ================= */}
        <Text className="text-base font-semibold mb-2">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(cat => (
            <EventCategoryBar
              key={cat.key}
              title={cat.label}
              iconKey={cat.key}
              active={selectedCategory === cat.key}
              onPress={() => setSelectedCategory(cat.key)}
            />
          ))}
        </ScrollView>

        {/* ================= TIME ================= */}
        <Text className="text-base font-semibold mb-2 mt-4">
          Time and Date
        </Text>

        <View className="flex-row mb-3">
          {timeOptions.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedTime(t)}
              className={`px-4 py-2 mr-3 rounded-full border ${
                selectedTime === t
                  ? "bg-orange-500 border-orange-500"
                  : "border-gray-300"
              }`}
            >
              <Text
                className={`${
                  selectedTime === t ? "text-white" : "text-gray-700"
                }`}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= DATE PICKER ================= */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center mb-4"
        >
          <Text className="text-gray-700">
            {date.toLocaleDateString("en-GB")}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="gray" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* ================= PRICE RANGE ================= */}
        <Text className="text-base font-semibold mb-2">
          Select price range
        </Text>

        <View className="flex-row justify-between mb-6">
          {/* MIN */}
          <View className="w-[48%]">
            <Text className="text-gray-500 mb-1">Min Price</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3">
              <TextInput
                keyboardType="numeric"
                value={String(minPrice)}
                onChangeText={v => setMinPrice(Number(v) || 0)}
                placeholder="0"
              />
            </View>
          </View>

          {/* MAX */}
          <View className="w-[48%]">
            <Text className="text-gray-500 mb-1">Max Price</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3">
              <TextInput
                keyboardType="numeric"
                value={String(maxPrice)}
                onChangeText={v => setMaxPrice(Number(v) || 0)}
                placeholder="0"
              />
            </View>
          </View>
        </View>

        {/* ================= ACTION BUTTONS ================= */}
        <View className="flex-row justify-between mb-10">
          <TouchableOpacity
            className="border border-gray-400 rounded-xl px-6 py-3"
            onPress={handleReset}
          >
            <Text className="text-gray-700 font-medium">RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-black rounded-xl px-10 py-3"
            onPress={handleApply}
          >
            <Text className="text-white font-semibold">APPLY</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
