import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "../../constants/colors";

const actions = [
  { icon: "call", label: "Call" },
  { icon: "directions", label: "Directions" },
  { icon: "confirmation-number", label: "My Ticket" },
];

export default function ActionBar() {
  return (
    <View className="bg-white w-[85%] mx-auto rounded-3xl shadow-lg py-4 flex-row justify-around -mt-12 z-50">
      {actions.map((item) => (
        <TouchableOpacity key={item.label} className="items-center">
          <View className="bg-orange-100 p-4 rounded-full">
            <MaterialIcons
              name={item.icon as any}
              size={26}
              color={Colors.primary}
            />
          </View>
          <Text className="text-xs mt-2 text-gray-700">{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
