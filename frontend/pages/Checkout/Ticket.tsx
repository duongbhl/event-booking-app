import React from "react";
import { View, Text, Image, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Ticket() {
  const navigation = useNavigation();
  const { total } = useRoute().params as { total: number };

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Tickets
        </Text>
      </View>

      <View className="bg-orange-500 rounded-3xl p-5">
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80",
          }}
          className="w-full h-40 rounded-2xl mb-4"
        />

        <View className="bg-white rounded-2xl p-4">
          <Text className="font-semibold text-lg mb-2">
            International Band Concert 2022
          </Text>

          <Text>Date: October 25, 2022</Text>
          <Text>Time: 10:00 PM</Text>
          <Text>Seat: 05</Text>

          <Image
            source={{ uri: "https://barcodeapi.org/api/128/ABC123" }}
            className="w-full h-20 mt-4"
          />
        </View>
      </View>

      <TouchableOpacity className="bg-black py-4 rounded-xl mt-8">
        <Text className="text-white text-center">DOWNLOAD IMAGE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
