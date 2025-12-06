import React, { useState } from "react";
import { View, Text, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyTicket() {
  const navigation = useNavigation();
  const [ticketType, setTicketType] = useState<"VIP" | "Economy">("VIP");
  const [quantity, setQuantity] = useState(1);

  const prices = {
    VIP: 50,
    Economy: 20,
  };

  const total = prices[ticketType] * quantity;

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Ticket
        </Text>
      </View>

      {/* Ticket Type */}
      <Text className="text-lg font-semibold mb-2">Ticket Type</Text>
      <View className="flex-row mb-5">
        {["VIP", "Economy"].map((type) => {
          const active = ticketType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setTicketType(type as any)}
              className={`flex-1 py-3 rounded-xl mr-3 ${
                active ? "bg-orange-500" : "bg-orange-100"
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  active ? "text-white" : "text-orange-500"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Seat Count */}
      <Text className="text-lg font-semibold mb-2">Seat</Text>
      <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-6">
        <TouchableOpacity onPress={() => quantity > 1 && setQuantity(quantity - 1)}>
          <Ionicons name="remove" size={22} />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">{String(quantity).padStart(2, "0")}</Text>

        <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
          <Ionicons name="add" size={22} />
        </TouchableOpacity>
      </View>

      {/* Price Summary */}
      <Text className="text-lg font-semibold mb-2">Ticket Price</Text>
      <View className="mb-3">
        <Text className="text-gray-700">{ticketType} Ticket</Text>
        <Text className="absolute right-0">${prices[ticketType]} USD</Text>
      </View>

      <View className="mb-3">
        <Text className="text-gray-700">
          {quantity} x ${prices[ticketType]} USD
        </Text>
        <Text className="absolute right-0">${total} USD</Text>
      </View>

      <View className="mt-5">
        <Text className="text-xl font-bold">Total: ${total} USD</Text>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        className="bg-black py-4 rounded-xl mt-10"
        onPress={() =>
          (navigation as any).navigate("Payment", {
            total,
            ticketType,
            quantity,
          })
        }
      >
        <Text className="text-center text-white font-semibold">CONTINUE</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
