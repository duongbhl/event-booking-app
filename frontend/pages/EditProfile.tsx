import React from "react";
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function EditProfileScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">Edit Profile</Text>

        <View className="w-6" />
      </View>

      {/* Avatar */}
      <View className="items-center mt-2 mb-6">
        <View className="relative">
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/32.jpg" }}
            className="w-24 h-24 rounded-full"
          />
          <TouchableOpacity className="absolute bottom-1 right-1 bg-white p-1 rounded-full">
            <Ionicons name="camera-outline" size={17} color="#FF7A00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Name */}
      <Text className="font-medium">Full Name</Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 mt-1 mb-4"
        defaultValue="MD Rafi Islam"
      />

      {/* Date of Birth */}
      <Text className="font-medium">Date of Birth</Text>
      <View className="border border-gray-200 rounded-xl p-3 mt-1 mb-4 flex-row justify-between">
        <Text>18 February, 2001</Text>
        <Ionicons name="calendar-outline" size={20} color="gray" />
      </View>

      {/* Location */}
      <Text className="font-medium">Location</Text>
      <View className="border border-gray-200 rounded-xl p-3 mt-1 mb-4 flex-row justify-between">
        <Text>Uttara, Dhaka, Bangladesh</Text>
        <Ionicons name="chevron-down" size={20} color="gray" />
      </View>

      {/* Interest */}
      <Text className="font-medium">Interested Event</Text>
      <View className="border border-gray-200 rounded-xl p-3 mt-1 mb-6 flex-row justify-between">
        <Text>Design; Art; Sports; Food; Music</Text>
        <Ionicons name="chevron-down" size={20} color="gray" />
      </View>

      {/* Save button */}
      <TouchableOpacity className="bg-black rounded-xl py-4 mb-10">
        <Text className="text-center text-white font-semibold">
          SAVE CHANGES
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
