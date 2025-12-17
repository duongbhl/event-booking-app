import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticket.service";

export default function ActionBar() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleMyTicketPress = async () => {
    if (!token) {
      Alert.alert("Login required", "Please login to view your tickets");
      return;
    }

    try {
      setLoading(true);

      // 🔥 FETCH MỚI MỖI LẦN NHẤN
      const tickets = await getMyTickets(token);

      if (!tickets || tickets.length === 0) {
        Alert.alert("No tickets", "You have not booked any tickets yet");
        return;
      }

      // 👉 luôn truyền data mới
      navigation.navigate("Ticket", { tickets });
    } catch (err) {
      console.log("Fetch tickets error", err);
      Alert.alert("Error", "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white w-[85%] mx-auto rounded-3xl shadow-lg py-4 flex-row justify-around -mt-12 z-50">
      {/* Call */}
      <TouchableOpacity className="items-center">
        <View className="bg-orange-100 p-4 rounded-full">
          <MaterialIcons name="call" size={26} color={Colors.primary} />
        </View>
        <Text className="text-xs mt-2 text-gray-700">Call</Text>
      </TouchableOpacity>

      {/* Directions */}
      <TouchableOpacity className="items-center">
        <View className="bg-orange-100 p-4 rounded-full">
          <MaterialIcons name="directions" size={26} color={Colors.primary} />
        </View>
        <Text className="text-xs mt-2 text-gray-700">Directions</Text>
      </TouchableOpacity>

      {/* 🎟 MY TICKET */}
      <TouchableOpacity
        className="items-center"
        onPress={handleMyTicketPress}
        disabled={loading}
      >
        <View className="bg-orange-100 p-4 rounded-full">
          <MaterialIcons
            name="confirmation-number"
            size={26}
            color={Colors.primary}
          />
        </View>
        <Text className="text-xs mt-2 text-gray-700">
          {loading ? "Loading..." : "My Ticket"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
