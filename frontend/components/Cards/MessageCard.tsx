import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MessagePreviewProps } from "../Interface/MessagePreviewProps";
import { useNavigation } from "@react-navigation/native";



export default function MessageCard({...item}: MessagePreviewProps) { 
  const navigation = useNavigation()
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
      onPress={()=>navigation.navigate('Chat' as never) }
    >
      {/* LEFT: Avatar + content */}
      <View className="flex-row items-center">
        <Image
          source={{ uri: item.avatar }}
          className="w-12 h-12 rounded-full"
        />

        <View className="ml-3">
          <Text className="font-semibold text-gray-800">{item.name}</Text>
          <Text className="text-gray-500 mt-0.5">{item.lastMessage}</Text>
        </View>
      </View>

      {/* RIGHT: Time + unread badge */}
      <View className="items-end">
        <Text className="text-gray-400 text-xs">{item.time}</Text>

        {item.unread > 0 && (
          <View className="mt-2 w-6 h-6 bg-green-500 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-semibold">{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
