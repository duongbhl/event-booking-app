import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import EventCardPrice from "../components/EventCardPrice";
import { useNavigation } from "@react-navigation/native";

const categories = ["Design", "Art", "Sports", "Music", "Food", "Others"];

export default function SearchScreen() {
  const [selected, setSelected] = useState("Design");
  const navigation = useNavigation();

  return (
    <View className="flex-1 bg-white px-4 pt-12">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold flex-1 text-center mr-6">
          Search
        </Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-2xl mb-4">
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="Find amazing events"
          className="flex-1 ml-2 text-[15px]"
        />
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="options-outline" size={22} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {/* Categories Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setSelected(c)}
            className={`px-4 py-2 mr-2 rounded-full border ${
              selected === c
                ? "bg-orange-500 border-orange-500"
                : "border-gray-300"
            }`}
          >
            <Text
              className={`${
                selected === c ? "text-white" : "text-gray-700"
              } text-sm`}
            >
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <EventCardPrice
          title="Designers Meetup 2022"
          date="03 October, 22"
          location="Gulshan, Dhaka"
          price="$10 USD"
          image="https://images.unsplash.com/photo-1551836022-d5d88e9218df"
        />

        <EventCardPrice
          title="Dribbblers Meetup 2022"
          date="03 October, 22"
          location="Banani, Dhaka"
          price="$12 USD"
          image="https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
        />

        <EventCardPrice
          title="Food Competition Event"
          date="10 October, 22"
          location="Uttara, Dhaka"
          price="$5 USD"
          image="https://images.unsplash.com/photo-1498654200943-1088dd4438ae"
        />

        <EventCardPrice
          title="Basketball Final Match"
          date="10 October, 22"
          location="Uttara, Dhaka"
          price="$8 USD"
          image="https://images.unsplash.com/photo-1504450758481-7338eba7524a"
        />
      </ScrollView>
    </View>
  );
}
