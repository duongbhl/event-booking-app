import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../constants/colors";

const actions = [
  { icon: "call", label: "Call" },
  { icon: "directions", label: "Directions" },
  { icon: "confirmation-number", label: "My Ticket" },
];

export default function BottomActionBar() {
  return (
    <View className="flex-row justify-around bg-white py-4 shadow-sm">
      {actions.map((item) => (
        <TouchableOpacity key={item.label} className="items-center">
          <MaterialIcons name={item.icon as any} size={26} color={Colors.primary} />
          <Text className="text-xs mt-1 text-gray-700">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
