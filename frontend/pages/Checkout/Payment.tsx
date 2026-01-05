import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import { bookTicket, confirmPayment, getMyTickets } from "../../services/ticket.service";
import { mapPaymentMethod } from "../../services/paymentMapper";
import { getMyCards } from "../../services/card.service";

export default function Payment() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();

  const { eventId, ticketType, quantity, total } = route.params as {
    eventId: string;
    ticketType: "VIP" | "Economy";
    quantity: number;
    total: number;
  };

  const [method, setMethod] = useState<"wallet" | "paypal" | "card">("wallet");
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

  const methods = [
    { key: "wallet", label: "Wallet" },
    { key: "paypal", label: "PayPal" },
    { key: "card", label: "Credit / Debit Card" },
  ];

  /** 🔥 Load cards khi chọn CARD */
  useEffect(() => {
    if (method !== "card" || !token) return;

    const fetchCards = async () => {
      try {
        setLoadingCards(true);
        const data = await getMyCards(token);
        setCards(data);
      } catch (err) {
        Alert.alert("Failed to load cards");
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [method]);

  const handleCheckout = async () => {
    if (!token) {
      Alert.alert("Login required", "Please login to continue");
      return;
    }

    if (method === "card" && !selectedCard) {
      Alert.alert("Select card", "Please select a card to continue");
      return;
    }

    try {
      setLoading(true);

      /** 1️⃣ Book tickets */
      const mappedMethod = mapPaymentMethod(method);
      console.log("📌 Booking tickets...", { eventId, ticketType, quantity, total, method, mappedMethod });
      
      const bookResponse = await bookTicket(
        {
          eventId,
          ticketType,
          quantity,
          price: total,
          method: mappedMethod,
        },
        token
      );
      
      console.log("✅ Book response:", bookResponse);
      
      if (!bookResponse?.payment?._id) {
        throw new Error("No payment ID received from booking");
      }

      /** 2️⃣ Confirm payment */
      let confirmResponse;
      try {
        confirmResponse = await confirmPayment(
          {
            paymentId: bookResponse.payment._id,
            success: true,
          },
          token
        );
      } catch (confirmError: any) {
        // Handle timeout gracefully - backend may have processed it
        if (confirmError?.code === 'ECONNABORTED' || confirmError?.message?.includes('timeout')) {
          // Wait a moment for backend to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Fetch tickets from /tickets/me endpoint
          const tickets = await getMyTickets(token);
          if (tickets && tickets.length > 0) {
            navigation.replace("Ticket", {
              tickets: tickets,
            });
            return;
          }
        }
        throw confirmError;
      }

      if (!confirmResponse?.tickets || confirmResponse.tickets.length === 0) {
        throw new Error("No tickets received from server after confirmation");
      }

      navigation.replace("Ticket", {
        tickets: confirmResponse.tickets,
      });
    } catch (err: any) {
      console.error("❌ Checkout error:", err);
      const errorMessage = err?.response?.data?.message || err?.message || "Something went wrong";
      Alert.alert(
        "Payment failed",
        errorMessage
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          Payment
        </Text>
      </View>

      {/* Payment Method */}
      <Text className="text-lg font-semibold mb-3">Payment Method</Text>

      {methods.map((m) => (
        <TouchableOpacity
          key={m.key}
          className="flex-row items-center justify-between border border-gray-300 p-4 rounded-xl mb-3"
          onPress={() => setMethod(m.key as any)}
        >
          <Text>{m.label}</Text>
          <Ionicons
            name={
              method === m.key
                ? "radio-button-on"
                : "radio-button-off"
            }
            size={22}
            color="#FF7A00"
          />
        </TouchableOpacity>
      ))}

      {/* 💳 CARD SECTION */}
      {method === "card" && (
        <View className="mt-4">
          <Text className="font-semibold mb-2">Your Cards</Text>

          {loadingCards ? (
            <ActivityIndicator />
          ) : cards.length === 0 ? (
            <Text className="text-gray-500">No cards added</Text>
          ) : (
            cards.map((card) => (
              <TouchableOpacity
                key={card._id}
                className={`border p-4 rounded-xl mb-2 flex-row justify-between ${
                  selectedCard === card._id
                    ? "border-orange-500"
                    : "border-gray-300"
                }`}
                onPress={() => setSelectedCard(card._id)}
              >
                <Text>
                  {card.brand} •••• {card.last4}
                </Text>
                {selectedCard === card._id && (
                  <Ionicons name="checkmark-circle" size={20} color="#FF7A00" />
                )}
              </TouchableOpacity>
            ))
          )}

          {/* ➕ ADD CARD */}
          <TouchableOpacity
            className="border border-orange-400 rounded-xl px-4 py-3 mt-3"
            onPress={() => navigation.navigate("AddCard")}
          >
            <Text className="text-orange-500 font-semibold text-center">
              Add New Card
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Total */}
      <View className="mt-6">
        <Text className="text-xl font-bold">
          Total: ${total} USD
        </Text>
      </View>

      {/* Checkout */}
      <TouchableOpacity
        className={`py-4 rounded-xl mt-10 items-center ${
          loading ? "bg-gray-400" : "bg-black"
        }`}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">
            CHECKOUT
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
