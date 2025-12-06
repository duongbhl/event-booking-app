import { View, Text, Image, TouchableOpacity } from "react-native";
import { Avatar } from "react-native-paper";
import { ConcertCardProps } from "../Interface/ConcertCardProps";


export default function ConcertCard({
  title,
  location,
  date,
  members,
  booked = false,
}: ConcertCardProps) {
  return (
    <View className="bg-white rounded-2xl shadow-md p-4 w-[340px]">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-base font-bold">{title}</Text>
        {booked && (
          <View className="bg-orange-100 px-3 py-1 rounded-xl">
            <Text className="text-orange-500 text-xs font-semibold">BOOKED</Text>
          </View>
        )}
      </View>
      <Text className="text-gray-500 text-xs mb-1">
        📍 {location}   📅 {date}
      </Text>
      <View className="flex-row items-center mt-2">
        {members.slice(0, 3).map((m, i) => (
          <Avatar.Image
            key={i}
            size={24}
            source={{ uri: m }}
            style={{ marginRight: -8, borderWidth: 2, borderColor: "white" }}
          />
        ))}
        <Text className="text-gray-500 ml-4 text-[10px] font-medium">
          15.7k+ Members are joined
        </Text>
        <TouchableOpacity className="ml-5">
          <Text className="text-orange-500 text-xs font-bold ml-auto items-end">
          VIEW ALL / INVITE
        </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
