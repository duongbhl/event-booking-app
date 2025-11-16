import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EventCard from "../components/EventCard";
import EventCardPrice from "../components/EventCardPrice";

const CATEGORIES = [
  { key: "music", label: "Music" },
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

// Fake Data
const MY_EVENTS = [
  {
    id: 1,
    title: "International Band Music Concert",
    date: "12–15 Oct, 22",
    location: "Dhaka, BD",
    members: 150,
    image:
      "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=2070",
  },
  {
    id: 2,
    title: "Shreve Dance Festival",
    date: "20–22 Oct, 22",
    location: "Banani, Dhaka",
    members: 80,
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=2070",
  },
];

const ALL_EVENTS = [
  {
    id: 1,
    title: "Designers Meetup 2022",
    date: "03 October, 22",
    location: "Gulshan, Dhaka",
    price: "$20",
    category: "design",
    image:
      "https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=2070",
  },
  {
    id: 2,
    title: "Food Competition Event",
    date: "10 October, 22",
    location: "Mirpur, Dhaka",
    price: "$10",
    category: "food",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2050",
  },
  {
    id: 3,
    title: "Basketball Final Match",
    date: "10 October, 22",
    location: "Uttara, Dhaka",
    price: "$15",
    category: "sports",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070",
  },
  {
    id: 4,
    title: "Modern Art Exhibition",
    date: "22 October, 22",
    location: "Banani, Dhaka",
    price: "$25",
    category: "art",
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2070",
  },
];

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>("music");

  const filteredEvents = ALL_EVENTS.filter(
    (ev) => ev.category === selectedCategory
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* HEADER */}
      <View className="flex-row justify-between items-center mt-2 mb-4">
        <View className="flex-row items-center">
          <Image
            source={{
              uri: "https://i.pravatar.cc/150?img=5",
            }}
            className="w-10 h-10 rounded-full"
          />
          <View className="ml-2">
            <Text className="text-xs text-gray-600">Hello,</Text>
            <Text className="font-semibold text-gray-900">MD Rafii Islam</Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-xs text-gray-500">Current location</Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#FF7A00" />
            <Text className="text-gray-900 ml-1 text-sm">Dhaka, 1200</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#444" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-gray-100 px-4 py-3 rounded-2xl mb-5">
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Find amazing events..."
          className="flex-1 ml-2"
          placeholderTextColor="#888"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* My Events */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-semibold">My Events</Text>
          <TouchableOpacity>
            <Text className="text-orange-500 font-semibold">VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        {MY_EVENTS.length === 0 && (
          <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
            <Image
              source={require("../assets/no-task.png")} // sửa đường dẫn image
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />

            <Text className="text-xl font-semibold mt-4">Ups! There is no events available</Text>
          </SafeAreaView>
        )}
        {MY_EVENTS.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {MY_EVENTS.map((ev) => (
              <View key={ev.id} className="mr-10 w-64">
                <EventCard
                  title={ev.title}
                  date={ev.date}
                  location={ev.location}
                  members={ev.members}
                  image={ev.image}
                />
              </View>
            ))}
          </ScrollView>

        )}

        {/* CATEGORY FILTER */}
        <Text className="font-semibold text-lg mb-3">Choose By Category</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

        {filteredEvents.length === 0 && (
          <SafeAreaView className="flex-1 bg-white px-6 justify-center items-center">
            <Image
              source={require("../assets/no-task.png")} // sửa đường dẫn image
              style={{ width: 180, height: 180 }}
              resizeMode="contain"
            />

            <Text className="text-xl font-semibold mt-4">Ups! There is no events available</Text>
          </SafeAreaView>
        )}
        {filteredEvents.length > 0 && (
          <View className="mt-6 mb-10">
            {filteredEvents.map((ev) => (
              <View key={ev.id} className="mb-4">
                <EventCardPrice
                  title={ev.title}
                  date={ev.date}
                  location={ev.location}
                  price={ev.price}
                  image={ev.image}
                />
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView >
  );
}
