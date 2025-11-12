import { View, Text } from "react-native";
import EventCardPrice from "./EventCardPrice";
import Colors from "../constants/colors";

type ScheduleCardProps = {
  day: string;
  month: string;
  year: string;
  event: {
    title: string;
    date: string;
    location: string;
    price: string;
    image: string;
  };
};

export default function ScheduleCard({
  day,
  month,
  year,
  event,
}: ScheduleCardProps) {
  return (
    <View className="flex-row items-start">
      <View className="items-center mr-3">
        <View className="bg-orange-100 px-2 py-1 rounded-xl">
          <Text className="text-xs text-orange-500 font-bold">{month}</Text>
          <Text className="text-lg font-bold">{day}</Text>
        </View>
      </View>

      <View>
        <Text className="text-xs text-gray-500 mb-1">
          WED, {day}TH {month.toUpperCase()}, {year}
        </Text>
        <EventCardPrice {...event} />
      </View>
    </View>
  );
}
