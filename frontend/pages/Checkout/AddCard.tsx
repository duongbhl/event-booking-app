import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddCard() {
  const navigation = useNavigation();
  const [save, setSave] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Add New Card
        </Text>
      </View>

      <Text className="text-gray-500 mb-1">Card Number</Text>
      <TextInput
        placeholder="0000 0000 0000 0000"
        className="border border-gray-300 rounded-xl p-3 mb-4"
        keyboardType="numeric"
      />

      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <Text className="text-gray-500 mb-1">Expires</Text>
          <TextInput placeholder="MM/YY" className="border border-gray-300 rounded-xl p-3" />
        </View>
        <View className="w-[48%]">
          <Text className="text-gray-500 mb-1">CVV</Text>
          <TextInput placeholder="000" className="border border-gray-300 rounded-xl p-3" />
        </View>
      </View>

      {/* Save Switch */}
      <TouchableOpacity
        className="flex-row items-center my-4"
        onPress={() => setSave(!save)}
      >
        <Ionicons
          name={save ? "checkbox" : "square-outline"}
          size={22}
          color="#FF7A00"
        />
        <Text className="ml-2 text-gray-800">Save as primary card</Text>
      </TouchableOpacity>

      <TouchableOpacity className="bg-black py-4 rounded-xl mt-auto">
        <Text className="text-center text-white font-semibold">CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
