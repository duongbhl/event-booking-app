import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ITicketTier {
  name: string;
  price: number;
  quota: number;
  sold: number;
}

export default function BuyTicket() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  /** Receive from EventDetails */
  const { eventId, ticketTiers = [] } = route.params as {
    eventId: string;
    ticketTiers?: ITicketTier[];
  };

  const [selectedTier, setSelectedTier] = useState<string>(
    ticketTiers[0]?.name || ""
  );
  const [quantity, setQuantity] = useState(1);

  /** Find the selected tier */
  const currentTier = useMemo(() => {
    return ticketTiers.find((t) => t.name === selectedTier);
  }, [selectedTier, ticketTiers]);

  const unitPrice = currentTier?.price || 0;
  const availableQuota = currentTier ? currentTier.quota - currentTier.sold : 0;
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

      {!ticketTiers || ticketTiers.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">No ticket tiers available</Text>
        </View>
      ) : (
        <>
          {/* Ticket Type/Tier */}
          <Text className="text-lg font-semibold mb-2">Ticket Type</Text>
          <View className="flex-row mb-5 flex-wrap">
            {ticketTiers.map((tier) => {
              const active = selectedTier === tier.name;
              const isSoldOut = tier.sold >= tier.quota;
              return (
                <TouchableOpacity
                  key={tier.name}
                  onPress={() => !isSoldOut && setSelectedTier(tier.name)}
                  disabled={isSoldOut}
                  className={`flex-1 py-3 rounded-xl mr-3 mb-2 ${
                    isSoldOut
                      ? "bg-gray-200"
                      : active
                      ? "bg-orange-500"
                      : "bg-orange-100"
                  }`}
                >
                  <Text
                    className={`text-center font-semibold text-sm ${
                      isSoldOut
                        ? "text-gray-500"
                        : active
                        ? "text-white"
                        : "text-orange-500"
                    }`}
                  >
                    {tier.name}
                  </Text>
                  <Text
                    className={`text-center text-xs mt-1 ${
                      isSoldOut
                        ? "text-gray-500"
                        : active
                        ? "text-white"
                        : "text-orange-400"
                    }`}
                  >
                    ${tier.price}
                    {isSoldOut && " - Sold Out"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity */}
          <Text className="text-lg font-semibold mb-2">Quantity</Text>
          <Text className="text-sm text-gray-600 mb-3">
            Available: {availableQuota} tickets
          </Text>
          <View className="flex-row items-center justify-between bg-gray-100 p-4 rounded-xl mb-6">
            <TouchableOpacity
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Ionicons name="remove" size={22} />
            </TouchableOpacity>

            <Text className="text-xl font-semibold">
              {String(quantity).padStart(2, "0")}
            </Text>

            <TouchableOpacity
              onPress={() =>
                quantity < availableQuota && setQuantity(quantity + 1)
              }
            >
              <Ionicons name="add" size={22} />
            </TouchableOpacity>
          </View>

          {/* Price Summary */}
          <Text className="text-lg font-semibold mb-2">Price Summary</Text>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-gray-700">{selectedTier} Ticket</Text>
            <Text>${unitPrice.toFixed(2)} USD</Text>
          </View>

          <View className="mb-3 flex-row justify-between">
            <Text className="text-gray-700">
              {quantity} × ${unitPrice.toFixed(2)}
            </Text>
            <Text>${total.toFixed(2)} USD</Text>
          </View>

          <View className="mt-5">
            <Text className="text-xl font-bold">
              Total: ${total.toFixed(2)} USD
            </Text>
          </View>

          {/* Continue */}
          <TouchableOpacity
            className={`${
              availableQuota === 0 || quantity > availableQuota
                ? "bg-gray-400"
                : "bg-black"
            } py-4 rounded-xl mt-10`}
            onPress={() =>
              navigation.navigate("Payment", {
                eventId,
                tierName: selectedTier,
                quantity,
                total,
              })
            }
            disabled={availableQuota === 0 || quantity > availableQuota}
          >
            <Text className="text-center text-white font-semibold">
              {availableQuota === 0 ? "SOLD OUT" : "CONTINUE"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}
