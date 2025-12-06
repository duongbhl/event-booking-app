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

const CATEGORIES = [
  { key: "music", label: "Music" },
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];


//du lieu mau
const EVENTS = [
  {
    id: 1,
    title: "Designers Meetup 2022",
    date: "03 October, 22",
    location: "Gulshan, Dhaka",
    price: "$10 USD",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  },
  {
    id: 2,
    title: "Dribbblers Meetup 2022",
    date: "03 October, 22",
    location: "Banani, Dhaka",
    price: "$12 USD",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
  },
  {
    id: 3,
    title: "Food Competition Event",
    date: "10 October, 22",
    location: "Uttara, Dhaka",
    price: "$5 USD",
    image: "https://images.unsplash.com/photo-1498654200943-1088dd4438ae",
  },
];


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
      {/* Categories Chips */}
      <View className="mt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 10 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.key;

            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full mr-3 ${isActive ? "bg-orange-500" : "bg-gray-200"
                  }`}
              >
                <Text
                  className={`text-sm ${isActive ? "text-white" : "text-gray-700"
                    }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
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
          {EVENTS.map((item) => (
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
