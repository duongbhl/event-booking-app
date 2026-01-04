import { View, Text, Image } from "react-native";
import { Button } from "react-native-paper";
import { EventCardProps } from "../Interface/EventCardProps";
import { useNavigation } from "@react-navigation/native";
import { formatDate, formatDateTime } from "../../utils/utils";
import { useAuth } from "../../context/AuthContext";

export default function EventPriceCard({ ...event }: EventCardProps) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const isOwnEvent = user && event.organizer && event.organizer._id === user._id;

  const goToDetail = () => {
    navigation.navigate("EventDetails", {
      event, // 👈 TRUYỀN NGUYÊN OBJECT
    });
  };

  return (
    <View className="flex-row items-center bg-white rounded-2xl shadow-md p-3 w-[370px] ml-5">
      <Image
        source={{ uri: event.images }}
        className="w-16 h-16 rounded-lg mr-3"
        resizeMode="cover"
      />

      <View className="flex-1">
        <Text className="font-bold text-gray-900 text-[13px]">
          {event.title}
        </Text>

        <Text className="text-gray-500 text-[10px] mt-1">
          {formatDateTime(event.date)} • {event.location} •{" "}
          {formatDate(event.date)}
        </Text>
      </View>

      <View className="items-center">
        <Text className="text-xs text-orange-500 font-semibold">
          {"$" + event.price}
        </Text>

        <Button
          mode="text"
          compact
          labelStyle={{ fontWeight: "700" }}
          onPress={goToDetail}
        >
          {isOwnEvent ? "CHECK" : "JOIN NOW"}
        </Button>
      </View>
    </View>
  );
}
