import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { CATEGORIES } from "../Home";
import EventCategoryBar from "../../components/Bars/EventCategoryBar";


const timeOptions = ["Today", "Tomorrow", "This week"];

export default function Filter() {
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState("music");
  const [selectedTime, setSelectedTime] = useState("Tomorrow");
  const [location, setLocation] = useState("Mirpur 10, Dhaka, Bangladesh");

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(120);


  return (
    <View className="flex-1 bg-white px-5 pt-12">
      {/* Title */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1 text-center mr-6">
          Filter
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category */}
        <Text className="text-base font-semibold mb-2">Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (

            <EventCategoryBar
              key={cat.key}
              title={cat.label}
              iconKey={cat.key}   // truyền iconKey để lấy đúng ảnh
              active={selectedCategory === cat.key}
              onPress={() => setSelectedCategory(cat.key)}
            />
          ))}
        </ScrollView>

        {/* Time and Date */}
        <Text className="text-base font-semibold mb-2">Time and Date</Text>

        <View className="flex-row mb-3">
          {timeOptions.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setSelectedTime(t)}
              className={`px-4 py-2 mr-3 rounded-full border ${selectedTime === t
                ? "bg-orange-500 border-orange-500"
                : "border-gray-300"
                }`}
            >
              <Text
                className={`${selectedTime === t ? "text-white" : "text-gray-700"
                  }`}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Picker */}
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center mb-4"
        >
          <Text className="text-gray-700">Choose from calendar</Text>
          <Ionicons name="calendar-outline" size={20} color="gray" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(e, d) => {
              setShowPicker(false);
              if (d) setDate(d);
            }}
          />
        )}

        {/* Location */}
        <Text className="text-base font-semibold mb-2">Location</Text>
        <TouchableOpacity className="border border-gray-300 rounded-xl p-3 flex-row justify-between items-center mb-4">
          <Text>{location}</Text>
          <Ionicons name="location-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Price Range (Fake UI) */}
        {/* PRICE RANGE */}
        <Text className="text-base font-semibold mb-2">Select price range</Text>

        <View className="flex-row justify-between mb-6">
          {/* MIN INPUT */}
          <View className="w-[48%]">
            <Text className="text-gray-500 mb-1">Min Price</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3">
              <TextInput
                keyboardType="numeric"
                value={String(minPrice)}
                onChangeText={(v) => setMinPrice(Number(v) || 0)}
                placeholder="0"
                className="text-gray-900"
              />
            </View>
          </View>

          {/* MAX INPUT */}
          <View className="w-[48%]">
            <Text className="text-gray-500 mb-1">Max Price</Text>
            <View className="border border-gray-300 rounded-xl px-4 py-3">
              <TextInput
                keyboardType="numeric"
                value={String(maxPrice)}
                onChangeText={(v) => setMaxPrice(Number(v) || 0)}
                placeholder="0"
                className="text-gray-900"
              />
            </View>
          </View>
        </View>


        {/* Buttons */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity className="border border-gray-400 rounded-xl px-6 py-3">
            <Text className="text-gray-700 font-medium">RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-black rounded-xl px-10 py-3">
            <Text className="text-white font-semibold">APPLY</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
