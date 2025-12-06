import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">Profile</Text>

        {/* ⭐ Nút Edit */}
        <TouchableOpacity
          onPress={() => navigation.navigate("EditProfile" as never)}
        >
          <Ionicons name="create-outline" size={24} color="#FF7A00" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            className="w-28 h-28 rounded-full"
          />
          {/* Badge */}
          <View className="absolute bottom-1 right-1 bg-white rounded-full p-1">
            <Ionicons name="shield-checkmark" size={18} color="#FF7A00" />
          </View>
        </View>

        <Text className="text-lg font-semibold mt-3">MD Rafi Islam</Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between px-3 mt-4 mb-6">
        <View className="items-center">
          <Text className="text-lg font-bold">1,089</Text>
          <Text className="text-gray-500 text-xs">Followers</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold">275</Text>
          <Text className="text-gray-500 text-xs">Following</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold">10</Text>
          <Text className="text-gray-500 text-xs">Events</Text>
        </View>
      </View>

      {/* About Me */}
      <View className="mb-6">
        <Text className="text-gray-900 font-semibold text-base mb-2">About Me</Text>

        <Text className="text-gray-600">
          Pellentesque mattis scelerisque aliquam tincidunt lacus.
          Convallis aliquam tortor et tincidunt cras fringilla aliquet amet.
          Mauris tempus ultrices fermentum aliquet...
          <Text className="text-orange-500"> Read More</Text>
        </Text>
      </View>

      {/* Interests */}
      <View>
        <Text className="text-gray-900 font-semibold text-base mb-3">
          Interest
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {["Design", "Food", "Programing", "Music", "Sports", "Art"].map(
            (item, i) => (
              <View
                key={i}
                className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
              >
                <Ionicons name="pricetag-outline" size={14} color="#FF7A00" />
                <Text className="ml-2 text-gray-800">{item}</Text>
              </View>
            )
          )}
        </View>
      </View>

      <View className="h-10" />
    </ScrollView>
  );
}
