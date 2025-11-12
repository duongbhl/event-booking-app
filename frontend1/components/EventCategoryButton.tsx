import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface Props {
  title: string;
  active?: boolean;
  onPress?: () => void;
}

export default function EventCategoryButton({ title, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-4 rounded-full mx-1 w-[100] ${
        active ? "bg-primary" : "bg-gray-100"
      }`}
    >
      <Text className={`${active ? "text-white" : "text-gray-700"} font-medium`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
