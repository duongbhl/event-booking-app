import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import EventPriceCard from "../../components/Cards/EventPriceCard";
import { CATEGORIES } from "../Home";
import EventCategoryBar from "../../components/Bars/EventCategoryBar";
import { ALL_EVENTS } from "../../data/event";


export default function Search() {
  const navigation = useNavigation();
  const [selectedCategory, setSelectedCategory] = useState("music");

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
        <TouchableOpacity
          onPress={() => navigation.navigate("Filter" as never)}
        >
          <Ionicons name="options-outline" size={22} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View className="mt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;

            return (
              <EventCategoryBar
                key={cat.key}
                title={cat.label}
                iconKey={cat.key}   // truyền iconKey để lấy đúng ảnh
                active={isActive}
                onPress={() => setSelectedCategory(cat.key)}
              />
            );
          })}
        </ScrollView>
      </View>


      {/* Event List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="mt-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="gap-3">
          {ALL_EVENTS.map((item) => (
            <EventPriceCard
              key={item.id}
              title={item.title}
              date={item.date}
              location={item.location}
              price={item.price}
              image={item.image}
            />
          ))}
        </View>
      </ScrollView>

    </View>
  );
}
