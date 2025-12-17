import React, { use, useEffect, useMemo, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import EventCard from "../../components/Cards/EventCard";
import { EventCardProps } from "../../components/Interface/EventCardProps";
import { getEvents } from "../../services/event.service";
import { useAuth } from "../../context/AuthContext";


export default function UpcomingEvents() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const isFocused = useIsFocused();
  const { user } = useAuth();

  // Fetch events when the screen is focused
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.log("Fetch events error:", error);
      }
    };

    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused]);


  const upcomingEvents = useMemo(() => {
    if (!user) return [];

    const now = new Date();

    return events.filter(ev =>
      ev.organizer._id === user._id &&
      new Date(ev.date) >= now
    );
  }, [events, user]);



  if (upcomingEvents.length === 0)
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={{ uri: 'booking_event_app\frontend\assets\no-task.png' }} // sửa đường dẫn image
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text className="text-xl font-semibold">No Upcoming Event</Text>
        <Text className="text-gray-500 text-center mt-2">
          You have no upcoming events at the moment.
        </Text>

        <TouchableOpacity className="bg-orange-500 px-8 py-3 rounded-2xl mt-6 mb-[20rem]" onPress={()=>navigation.navigate("CreateEditEvent" as never)}>
          <Text className="text-white font-semibold">ADD EVENTS</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-2">
        {upcomingEvents.map((ev) => (
          <EventCard
            key={ev._id}
            {...ev}
          />
        ))}
      </View>
    </ScrollView>
  );
}
