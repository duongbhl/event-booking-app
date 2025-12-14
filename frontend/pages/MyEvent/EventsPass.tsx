import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, TouchableOpacity, View, Text, Image } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import EventPriceCard from "../../components/Cards/EventPriceCard";

import { EventCardProps } from "../../components/Interface/EventCardProps";
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../services/event.service";


export default function PastEvents() {
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


  const passEvents = useMemo(() => {
    if (!user) return [];

    const now = new Date();

    return events.filter(ev =>
      ev.organizer._id === user._id &&
      new Date(ev.date) < now
    );
  }, [events, user]);


  if (passEvents.length === 0)
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Image
            source={{ uri: 'booking_event_app\frontend\assets\no-task.png' }} // sửa đường dẫn image
            style={{ width: 180, height: 180 }}
            resizeMode="contain"
          />
          <Text className="text-xl font-semibold">No Pass Event</Text>
          <Text className="text-gray-500 text-center mt-2 mb-[20rem]">
            You have no past events at the moment.
          </Text>
        </View>
      );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-2">
        {passEvents.map((ev) => (
          <TouchableOpacity
            key={ev._id}
            onPress={() =>
              navigation.navigate(
                "CreateEditEvent" as never,
              )
            }
          >
            <View className="mb-4">
              <EventPriceCard
                {...ev}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
