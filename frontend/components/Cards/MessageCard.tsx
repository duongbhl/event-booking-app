import React from "react";
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { MessagePreviewProps } from "../Interface/MessagePreviewProps";
import { useNavigation } from "@react-navigation/native";

export default function MessageCard({ ...item }: MessagePreviewProps) {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <TouchableOpacity
      className="flex-row items-center justify-between border-b border-gray-100"
      style={{ paddingVertical: isSmall ? 12 : 16 }}
      onPress={() => navigation.navigate('Chat' as never)}
      activeOpacity={0.85}
    >
      <View className="flex-row items-center flex-1 min-w-0 pr-3">
        <Image source={{ uri: item.avatar }} className="rounded-full" style={{ width: isSmall ? 42 : 48, height: isSmall ? 42 : 48 }} />
        <View className="ml-3 flex-1 min-w-0">
          <Text className="font-semibold text-gray-800" numberOfLines={1} style={{ fontSize: isSmall ? 13 : 14 }}>{item.name}</Text>
          <Text className="text-gray-500 mt-0.5" numberOfLines={1} style={{ fontSize: isSmall ? 12 : 14 }}>{item.lastMessage}</Text>
        </View>
      </View>

      <View className="items-end shrink-0">
        <Text className="text-gray-400" style={{ fontSize: isSmall ? 10 : 12 }}>{item.time}</Text>
        {item.unread > 0 && (
          <View className="mt-2 bg-green-500 rounded-full items-center justify-center" style={{ width: isSmall ? 22 : 24, height: isSmall ? 22 : 24 }}>
            <Text className="text-white font-semibold" style={{ fontSize: isSmall ? 10 : 12 }}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
