import { View, Text, Image } from "react-native";
import { Button } from "react-native-paper";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
};

export default function EventCardPrice({
  title,
  date,
  location,
  price,
  image,
}: EventCardProps) {
  return (
    <View className="flex-row items-center bg-white rounded-2xl shadow-md p-3 w-[370px] ml-5">
      <Image
        source={{ uri: image }}
        className="w-16 h-16 rounded-lg mr-3"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="font-bold text-gray-900 text-[13px]">{title}</Text>
        <Text className="text-gray-500 text-[10px] mt-1">
          {date} • {location}
        </Text>
      </View>
      <View className="items-center flex-col space-y-[2]">
        <Text className="text-xs text-orange-500 font-semibold">{price}</Text>
        <Button
          mode="text"
          compact
          labelStyle={{ fontWeight: "700" }}
          onPress={() => {}}
        >
          JOIN NOW
        </Button>
      </View>
    </View>
  );
}
