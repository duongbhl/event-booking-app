import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserInviteCardProps } from "../Interface/UserInviteCardProps";

export default function UserInviteCard({ name, followers, avatar, status }:UserInviteCardProps) {
  return (
    <View className="flex-row items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
      
      {/* Avatar + Info */}
      <View className="flex-row items-center">
        <Image
          source={{ uri: avatar }}
          className="w-12 h-12 rounded-full"
        />

        <View className="ml-3">
          <Text className="font-semibold text-gray-900">{name}</Text>
          <Text className="text-gray-500 text-sm">{followers} followers</Text>
        </View>
      </View>

      {/* Button */}
      {status === "sent" ? (
        <TouchableOpacity className="bg-orange-500 px-5 py-2 rounded-full">
          <Text className="text-white font-medium text-sm">Invite</Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-gray-200 px-5 py-2 rounded-full">
          <Text className="text-gray-600 font-medium text-sm">Sent</Text>
        </View>
      )}
      
    </View>
  );
}
