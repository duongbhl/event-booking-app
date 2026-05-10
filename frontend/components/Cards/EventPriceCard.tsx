import React from "react";
import { View, Text, Image, useWindowDimensions } from "react-native";
import { Button } from "react-native-paper";
import { useLocalization } from "../../context/LocalizationContext";
import { EventCardProps } from "../Interface/EventCardProps";
import { useNavigation } from "@react-navigation/native";
import { formatDate, formatDateTime } from "../../utils/utils";
import { useAuth } from "../../context/AuthContext";

export default function EventPriceCard({ ...event }: EventCardProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const isOwnEvent = user && event.organizer && event.organizer._id === user._id;

  const goToDetail = () => {
    navigation.navigate("EventDetails", { event });
  };

  return (
    <View
      className="flex-row items-center bg-white rounded-2xl shadow-md w-full"
      style={{ padding: isSmall ? 10 : 12, maxWidth: 430 }}
    >
      <Image
        source={{ uri: event.images }}
        className="rounded-lg bg-gray-200"
        style={{ width: isSmall ? 54 : 64, height: isSmall ? 54 : 64, marginRight: isSmall ? 8 : 12 }}
        resizeMode="cover"
      />

      <View className="flex-1 min-w-0">
        <Text className="font-bold text-gray-900" style={{ fontSize: isSmall ? 12 : 13 }} numberOfLines={1}>
          {event.title}
        </Text>

        <Text className="text-gray-500 mt-1" style={{ fontSize: isSmall ? 9 : 10 }} numberOfLines={2}>
          {formatDateTime(event.date)} • {event.location} • {formatDate(event.date)}
        </Text>
      </View>

      <View className="items-center shrink-0 ml-2" style={{ maxWidth: isSmall ? 82 : 96 }}>
        <Text className="text-orange-500 font-semibold" style={{ fontSize: isSmall ? 11 : 12 }} numberOfLines={1}>
          {"$" + event.price}
        </Text>

        <Button
          mode="text"
          compact
          labelStyle={{ fontWeight: "700", fontSize: isSmall ? 10 : 12 }}
          contentStyle={{ paddingHorizontal: 0 }}
          onPress={goToDetail}
        >
          {isOwnEvent ? t('eventPriceCard.check') : t('eventPriceCard.joinNow')}
        </Button>
      </View>
    </View>
  );
}
