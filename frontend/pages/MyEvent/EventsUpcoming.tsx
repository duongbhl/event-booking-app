import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EventCard from "../../components/Cards/EventCard";
import { UPCOMING_EVENTS } from "../../data/event";



export default function UpcomingEvents() {
  const navigation = useNavigation();

  if (UPCOMING_EVENTS.length === 0)
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Image
          source={{uri:'booking_event_app\frontend\assets\no-task.png'}} // sửa đường dẫn image
          style={{ width: 180, height: 180 }}
          resizeMode="contain"
        />
        <Text className="text-xl font-semibold mt-4">No Upcoming Event</Text>
        <Text className="text-gray-500 text-center mt-2">
          You have no upcoming events at the moment.
        </Text>

        <TouchableOpacity className="bg-orange-500 px-8 py-3 rounded-2xl mt-6">
          <Text className="text-white font-semibold">EXPLORE EVENTS</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-2">
        {UPCOMING_EVENTS.map((ev) => (
          <EventCard
            key={ev.id}
            title={ev.title}
            date={ev.date}
            location={ev.location}
            members={ev.members}
            image={ev.image}
            price={ev.price}
            onPress={() =>
              navigation.navigate(
                "CreateEditEvent" as never,
              )
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}
