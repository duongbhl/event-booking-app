import React from "react";
import { View, TouchableOpacity } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Button } from "react-native-paper";

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
          <Button
            key={route.name}
            onPress={onPress}
            className="flex-1 items-center justify-center pb-3"
          >
            {/* Bar highlight ở phía trên */}
            {focused ? (
              <View className="absolute top-0 w-10 h-1 bg-orange-500 rounded-full" />
            ) : (
              <View className="absolute top-0 w-10 h-1 opacity-0" />
            )}

            {icon}
          </Button>
        );
      })}
    </View>
  );
}
