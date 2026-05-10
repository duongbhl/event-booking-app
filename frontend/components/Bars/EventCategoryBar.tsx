import React from "react";
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";

interface Props {
  title: string;
  iconKey: string;
  active?: boolean;
  onPress?: () => void;
}

export const CATEGORY_IMAGES: Record<string, any> = {
  music: require("../../assets/interests/music.png"),
  design: require("../../assets/interests/vector.png"),
  art: require("../../assets/interests/paint-palette.png"),
  sports: require("../../assets/interests/sports.png"),
  food: require("../../assets/interests/salad.png"),
  others: require("../../assets/interests/ellipsis.png"),
};

export default function EventCategoryBar({ title, iconKey, active, onPress }: Props) {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      className={`flex-row items-center rounded-full mr-2 mb-2 ${active ? "bg-orange-500" : "bg-gray-200"}`}
      style={{
        paddingHorizontal: isSmall ? 12 : 18,
        paddingVertical: isSmall ? 7 : 9,
        maxWidth: width * 0.78,
      }}
    >
      <View
        className={`rounded-full items-center justify-center mr-2 ${active ? "bg-white" : "bg-gray-300"}`}
        style={{ width: isSmall ? 24 : 28, height: isSmall ? 24 : 28 }}
      >
        <Image
          source={CATEGORY_IMAGES[iconKey]}
          style={{ width: isSmall ? 14 : 16, height: isSmall ? 14 : 16 }}
          resizeMode="contain"
        />
      </View>

      <Text
        className={`font-medium ${active ? "text-white" : "text-gray-700"}`}
        style={{ fontSize: isSmall ? 12 : 14 }}
        numberOfLines={1}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
