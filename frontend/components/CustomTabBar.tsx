import React from "react";
import { View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { TouchableOpacity } from "react-native";

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View className="flex-row bg-white h-[70px] items-end justify-around shadow-md">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const onPress = () => {
          navigation.navigate(route.name as never);
        };

        const icon =
          options.tabBarIcon &&
          options.tabBarIcon({
            focused,
            color: focused ? "#FF7A00" : "#B7B7B7",
            size: 26,
          });

        return (
          <TouchableOpacity
            key={route.name}
            onPress={onPress}
            activeOpacity={0.7}
            className="flex-col items-center justify-center pb-3 relative w-[80px] mb-5"
          >
            {/* Thanh highlight dọc */}
            {focused ? (
              <View className="absolute top-1 w-[3px] h-[22px] bg-orange-500 rounded-full" />
            ) : (
              <View className="absolute top-1 w-[3px] h-[22px] opacity-0" />
            )}

            {/* Icon */}
            {icon}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
