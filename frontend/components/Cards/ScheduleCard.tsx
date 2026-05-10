import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { ScheduleCardProps } from "../Interface/ScheduleCardProps";
import EventPriceCard from "./EventPriceCard";

export default function ScheduleCard({ day, month, year, event }: ScheduleCardProps) {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <View className="flex-row items-start w-full">
      <View className="items-center" style={{ marginRight: isSmall ? 8 : 12 }}>
        <View className="bg-orange-100 rounded-xl items-center" style={{ paddingHorizontal: isSmall ? 7 : 8, paddingVertical: 5, minWidth: isSmall ? 42 : 48 }}>
          <Text className="text-orange-500 font-bold" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>{month}</Text>
          <Text className="font-bold" style={{ fontSize: isSmall ? 16 : 18 }}>{day}</Text>
        </View>
      </View>

      <View className="flex-1 min-w-0">
        <Text className="text-gray-500 mb-1" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
          WED, {day}TH {month.toUpperCase()}, {year}
        </Text>
        <EventPriceCard {...event} />
      </View>
    </View>
  );
}
