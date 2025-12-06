import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";



interface Props {
  title: string;
  iconKey: string;
  active?: boolean;
  onPress?: () => void;
}

export const CATEGORY_IMAGES: Record<string, any> = {
  music: require("../../assets/interests/music.png"),
  design: require("../../assets/interests/vector.png"),       // icon bút vẽ
  art: require("../../assets/interests/paint-palette.png"),
  sports: require("../../assets/interests/sports.png"),
  food: require("../../assets/interests/salad.png"),
  others: require("../../assets/interests/ellipsis.png"),
};


export default function EventCategoryBar({ title, iconKey, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-5 py-2 rounded-full mr-3 ${active ? "bg-orange-500" : "bg-gray-200"
        }`}
    >
      {/* Icon wrapper */}
      <View
        className={`w-7 h-7 rounded-full items-center justify-center mr-2 ${active ? "bg-white" : "bg-gray-300"
          }`}
      >
        <Image
          source={CATEGORY_IMAGES[iconKey]}
          className="w-4 h-4"
          resizeMode="contain"
        />
      </View>

      {/* Label */}
      <Text
        className={`text-sm font-medium ${active ? "text-white" : "text-gray-700"
          }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}