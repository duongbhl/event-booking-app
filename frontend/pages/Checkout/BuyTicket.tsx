import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BuyTicket() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  /** Nhận từ EventDetails */
  const { eventId, price } = route.params as {
    eventId: string;
    price: number;
  };

  const [ticketType, setTicketType] =
    useState<"VIP" | "Economy">("Economy");

  const [quantity, setQuantity] = useState(1);

  /** 🔥 TÍNH GIÁ */
  const unitPrice = useMemo(() => {
    return ticketType === "VIP" ? price * 50 : price;
  }, [ticketType, price]);

  const total = unitPrice * quantity;

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
        {["Economy", "VIP"].map((type) => {
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

      {/* Quantity */}
      <Text className="text-lg font-semibold mb-2">Quantity</Text>
      <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-6">
        <TouchableOpacity
          onPress={() => quantity > 1 && setQuantity(quantity - 1)}
        >
          <Ionicons name="remove" size={22} />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">
          {String(quantity).padStart(2, "0")}
        </Text>

        <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
          <Ionicons name="add" size={22} />
        </TouchableOpacity>
      </View>

      {/* Price Summary */}
      <Text className="text-lg font-semibold mb-2">Price Summary</Text>

      <View className="mb-3 flex-row justify-between">
        <Text className="text-gray-700">
          {ticketType} Ticket
        </Text>
        <Text>${unitPrice} USD</Text>
      </View>

      <View className="mb-3 flex-row justify-between">
        <Text className="text-gray-700">
          {quantity} × ${unitPrice}
        </Text>
        <Text>${total} USD</Text>
      </View>

      <View className="mt-5">
        <Text className="text-xl font-bold">
          Total: ${total} USD
        </Text>
      </View>

      {/* Continue */}
      <TouchableOpacity
        className="bg-black py-4 rounded-xl mt-10"
        onPress={() =>
          navigation.navigate("Payment", {
            eventId,
            ticketType,
            quantity,
            total,
          })
        }
      >
        <Text className="text-center text-white font-semibold">
          CONTINUE
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
