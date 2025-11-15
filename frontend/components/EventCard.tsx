import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  members: number;
  image: string;
  onPress?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  title,
  date,
  location,
  members,
  image,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 w-72"
      style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
    >
      <Image source={{ uri: image }} className="w-full h-44" />
      <View className="p-4">
        <Text className="text-base font-semibold text-primary" numberOfLines={1}>
          {title}
        </Text>
        <View className="flex-row items-center mt-2">
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1">{date}</Text>
        </View>
        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1">{location}</Text>
        </View>

        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-gray-400 p-1">{members}+ Members joined</Text>
          <TouchableOpacity className="bg-primary rounded-full px-3 py-2">
            <Text className="text-white font-semibold text-sm">EDIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
