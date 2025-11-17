import React from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import EventCardPrice from "../../components/EventCardPrice";

const PAST_EVENTS = [
  {
    id: 10,
    title: "Designers Meetup 2022",
    date: "03 October, 22",
    location: "Gulshan, Dhaka",
    price: "$10 USD",
    image:
      "https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=2070",
  },
  {
    id: 11,
    title: "Food Competition Event",
    date: "10 October, 22",
    location: "Uttara, Dhaka",
    price: "$5 USD",
    image:
      "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=2070",
  },
  {
    id: 12,
    title: "Basketball Final Match",
    date: "10 October, 22",
    location: "Uttara, Dhaka",
    price: "$8 USD",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070",
  },
];

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
              <EventCardPrice
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
