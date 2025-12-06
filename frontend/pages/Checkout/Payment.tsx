import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Payment() {
  const navigation = useNavigation();
  const { total } = useRoute().params as { total: number };

  const [method, setMethod] = useState("apple");
  const methods = [
    { key: "apple", label: "Apple Pay" },
    { key: "paypal", label: "PayPal" },
    { key: "google", label: "Google Pay" },
    { key: "card", label: "Debit / Credit Card" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Payment
        </Text>
      </View>

      <Text className="text-lg font-semibold mb-3">Payment Method</Text>

      {methods.map((m) => (
        <TouchableOpacity
          key={m.key}
          className="flex-row items-center justify-between border border-gray-300 p-4 rounded-xl mb-3"
          onPress={() => setMethod(m.key)}
        >
          <Text className="text-gray-800">{m.label}</Text>
          <Ionicons
            name={method === m.key ? "radio-button-on" : "radio-button-off"}
            size={22}
            color="#FF7A00"
          />
        </TouchableOpacity>
      ))}

      {/* Add new card */}
      {method === "card" && (
        <TouchableOpacity
          className="border border-orange-400 rounded-xl px-4 py-3 mb-5"
          onPress={() => navigation.navigate("AddCard" as never)}
        >
          <Text className="text-orange-500 font-semibold text-center">
            Add New Card
          </Text>
        </TouchableOpacity>
      )}

      {/* Voucher */}
      <Text className="text-lg font-semibold mb-2">Add Voucher</Text>
      <View className="flex-row">
        <TextInput
          placeholder="VOUCHER CODE"
          className="flex-1 border border-gray-300 rounded-xl p-3"
        />
        <TouchableOpacity className="bg-black px-5 rounded-xl justify-center ml-2">
          <Text className="text-white">APPLY</Text>
        </TouchableOpacity>
      </View>

      {/* Checkout */}
      <TouchableOpacity
        className="bg-black py-4 rounded-xl mt-10"
        onPress={() =>
          (navigation as any).navigate("Ticket", {
            total,
            method,
          })
        }
      >
        <Text className="text-center text-white font-semibold">CHECKOUT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
