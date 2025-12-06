import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EventPriceCard from "../../components/Cards/EventPriceCard";
import { PAST_EVENTS } from "../../data/event";




export default function PastEvents() {
  const navigation = useNavigation();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="mt-2">
        {PAST_EVENTS.map((ev) => (
          <TouchableOpacity
            key={ev.id}
            onPress={() =>
              navigation.navigate(
                "CreateEditEvent" as never,
              )
            }
          >
            <View className="mb-4">
              <EventPriceCard
                title={ev.title}
                date={ev.date}
                location={ev.location}
                price={ev.price}
                image={ev.image}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
