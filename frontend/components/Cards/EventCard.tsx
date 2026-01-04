import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { EventCardProps } from "../Interface/EventCardProps";
import { useNavigation } from "@react-navigation/native";
import { formatDateTime } from "../../utils/utils";

interface EventCardProp extends EventCardProps { }

const EventCard: React.FC<EventCardProp> = (event) => {
  const navigation = useNavigation<any>();

  const handleEdit = () => {
    navigation.navigate("CreateEditEvent", {
      isEdit: true,
      event,
    });
  };

  return (
    <TouchableOpacity
      onPress={handleEdit}
      className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 w-full"
      style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
    >
      {/* Image */}
      <Image
        source={{ uri: event.images }}
        className="w-full h-44"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="p-4">
        <Text className="text-base font-semibold text-primary" numberOfLines={1}>
          {event.title}
        </Text>

        <View className="flex-row items-center mt-2">
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1">
            {formatDateTime(event.date)}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1" numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-gray-400">
            {event.attendees || 0} Members joined
          </Text>

          <TouchableOpacity
            onPress={handleEdit}
            className="bg-primary rounded-full px-4 py-2"
          >
            <Text className="text-white font-semibold text-sm">EDIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default EventCard;
