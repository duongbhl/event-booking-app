import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EventCard from "../components/Cards/EventCard";
import { useNavigation } from "@react-navigation/native";
import EventCategoryBar from "../components/Bars/EventCategoryBar";
import { useAuth } from "../context/AuthContext";
import { getEvents } from "../services/event.service";
import { EventCardProps } from "../components/Interface/EventCardProps";
import { useIsFocused } from "@react-navigation/native";
import EventPriceCard from "../components/Cards/EventPriceCard";

export const CATEGORIES = [
  { key: "music", label: "Music" },
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];




export default function Home() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("music");

  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.log("Fetch events error:", error);
      } finally {
        setLoading(false);
      }
    };

    if(isFocused){
      fetchEvents();
    }
  }, [isFocused]);

  

  /**
   * My Events – do chính user tạo
   */
  const myEvents = useMemo(() => {
    if (!user || !user._id) return [];
    // Compare dates at the beginning of the day (ignore time)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    return events.filter(
      (ev) => {
        // Check if event belongs to current user
        const isOwnEvent = (ev.organizer && ev.organizer._id === user?._id) || 
                          ev.organizer?._id === user?._id;
        
        // Only show events from today onwards (ignore time part)
        const eventDate = new Date(ev.date);
        eventDate.setHours(0, 0, 0, 0);
        const isFutureEvent = eventDate >= todayStart;
        
        return isOwnEvent && isFutureEvent;
      }
    );
  }, [events, user]);

  /**
   * Other Events – không phải của mình + filter category
   */
  const filteredEvents = useMemo(() => {
    if (!user || !user._id) return [];
    // Compare dates at the beginning of the day (ignore time)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    return events.filter(
      (ev) => {
        // Check if event belongs to another user
        const isOtherEvent = ev.organizer && ev.organizer._id !== user._id;
        
        // Check category match
        const isSameCategory = ev.category === selectedCategory;
        
        // Only show events from today onwards (ignore time part)
        const eventDate = new Date(ev.date);
        eventDate.setHours(0, 0, 0, 0);
        const isFutureEvent = eventDate >= todayStart;
        
        return isOtherEvent && isSameCategory && isFutureEvent;
      }
    );
  }, [events, selectedCategory, user]);

  return (
    <SafeAreaView className="flex-1 bg-white px-4">

      {/* HEADER */}
      <View className="flex-row justify-between items-center mt-2 mb-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.openDrawer?.()}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
          >
            <Ionicons name="menu" size={28} color="#111827" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("Profile" as never)}>
            <Image
              source={{ uri: user?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
              className="w-10 h-10 rounded-full"
              defaultSource={{ uri: "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
            />
          </TouchableOpacity>
          
          <View className="ml-2">
            <Text className="text-xs text-gray-600">Hello,</Text>
            <Text className="font-semibold text-gray-900">
              {user?.name || "User"}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-xs text-gray-500">Current location</Text>
          <View className="flex-row items-center">
            <Ionicons name="location" size={14} color="#FF7A00" />
            <Text className="text-gray-900 ml-1 text-sm">
              {user?.location && user.location.length > 0 ? user.location : "Add location"}
            </Text>
          </View>
        </View>


      </View>

      {/* SEARCH BAR (Facebook style) */}
      <TouchableOpacity
        className="flex-row items-center bg-gray-100 rounded-2xl h-12 px-4 mb-5"
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Search" as never)}
      >
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <Text className="ml-2 text-gray-500">Search for events...</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MY EVENTS */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-xl font-semibold">My Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyEvent' as never)}>
            <Text className="text-orange-500 font-semibold">VIEW ALL</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {myEvents.map((ev) => (
            <View key={ev._id} className="mr-10 w-80">
              <EventCard {...ev} />
            </View>
          ))}
        </ScrollView>

        {/* CATEGORY FILTER */}
        <Text className="font-semibold text-lg mt-6 mb-3">
          Choose By Category
        </Text>

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


        {/* FILTERED EVENTS */}
        <View className="mb-10 mt-5">
          {filteredEvents.map((ev) => (
            <View key={ev._id} className="mb-4">
              <EventPriceCard {...ev} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
