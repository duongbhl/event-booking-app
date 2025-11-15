import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Avatar, Text } from "react-native-paper";

interface NotificationCardProps {
  avatar: string;
  name: string;
  message: string;
  time: string;
  type?: "invite" | "follow" | "comment" | "like";
  onAccept?: () => void;
  onReject?: () => void;
}

export const InvitationCard: React.FC<NotificationCardProps> = ({
  avatar,
  name,
  message,
  time,
  type = "invite",
  onAccept,
  onReject,
}) => {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row">
      {/* Avatar */}
      <Avatar.Image source={{ uri: avatar }} size={48} />

      {/* Content */}
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-[14px]">{name}</Text>
        <Text className="text-gray-600 text-[12px] mt-1" numberOfLines={2}>
          {message}
        </Text>

        {type === "invite" && (
          <View className="flex-row mt-3 space-x-2">
            <TouchableOpacity
              onPress={onReject}
              className="px-4 py-1 rounded-lg border border-gray-300 mr-2"
            >
              <Text className="text-gray-600">Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onAccept}
              className="px-4 py-1 rounded-lg bg-orange-500"
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Time */}
      <Text className="text-gray-400 text-[10px] ml-2">{time}</Text>
    </View>
  );
};

export default InvitationCard;
