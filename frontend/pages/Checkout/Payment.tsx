import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import {
  bookTicket,
  confirmPayment,
  getMyTickets,
} from "../../services/ticket.service";
import { mapPaymentMethod } from "../../services/paymentMapper";
import { getMyCards } from "../../services/card.service";

type PaymentMethod = "wallet" | "paypal" | "card";

export default function Payment() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;

  const { eventId, tierName, quantity, total } = route.params as {
    eventId: string;
    tierName: string;
    quantity: number;
    total: number;
  };

  const [method, setMethod] = useState<PaymentMethod>("wallet");
  const [cards, setCards] = useState<any[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCards, setLoadingCards] = useState(false);

  const methods = useMemo(
    () => [
      { key: "wallet", label: t("paymentCheckout.wallet"), icon: "wallet-outline" },
      { key: "paypal", label: t("paymentCheckout.paypal"), icon: "logo-paypal" },
      {
        key: "card",
        label: t("paymentCheckout.creditDebitCard"),
        icon: "card-outline",
      },
    ],
    [t]
  );

  useEffect(() => {
    if (method !== "card" || !token) return;

    const fetchCards = async () => {
      try {
        setLoadingCards(true);

        const data = await getMyCards(token);
        setCards(data || []);

        if (data?.length > 0 && !selectedCard) {
          setSelectedCard(data[0]._id);
        }
      } catch (err) {
        Alert.alert(t("common.error"), t("paymentCheckout.failedLoadCards"));
      } finally {
        setLoadingCards(false);
      }
    };

    fetchCards();
  }, [method, token, t, selectedCard]);

  const handleCheckout = useCallback(async () => {
    if (!token || loading) {
      if (!token) {
        Alert.alert(
          t("paymentCheckout.loginRequired"),
          t("paymentCheckout.pleaseLoginToContinue")
        );
      }

      return;
    }

    if (method === "card" && !selectedCard) {
      Alert.alert(
        t("paymentCheckout.selectCard"),
        t("paymentCheckout.selectCardToContinue")
      );
      return;
    }

    try {
      setLoading(true);

      const mappedMethod = mapPaymentMethod(method);

      const bookResponse = await bookTicket(
        {
          eventId,
          tierName,
          quantity,
          price: total,
          method: mappedMethod,
        },
        token
      );

      if (!bookResponse?.payment?._id) {
        throw new Error("No payment ID received from booking");
      }

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
        if (
          confirmError?.code === "ECONNABORTED" ||
          confirmError?.message?.includes("timeout")
        ) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const tickets = await getMyTickets(token);

          if (tickets && tickets.length > 0) {
            navigation.replace("Ticket", {
              tickets,
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
      const errorMessage =
        err?.response?.data?.message || err?.message || "Something went wrong";

      Alert.alert(t("payment.paymentFailed"), errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    token,
    loading,
    method,
    selectedCard,
    t,
    eventId,
    tierName,
    quantity,
    total,
    navigation,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isSmallDevice ? 8 : 12,
        }}
      >
        <View className="flex-row items-center mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
            activeOpacity={0.7}
            className="p-1"
          >
            <Ionicons name="chevron-back" size={isTablet ? 32 : 26} />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="flex-1 text-center font-semibold"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              marginRight: 32,
            }}
          >
            {t("payment.payment")}
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: Platform.OS === "ios" ? 120 : 100,
          }}
        >
          <Text
            className="font-semibold mb-3"
            style={{ fontSize: isSmallDevice ? 16 : 18 }}
          >
            {t("payment.paymentMethod")}
          </Text>

          {methods.map((item) => {
            const active = method === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                className={`flex-row items-center justify-between border rounded-xl mb-3 ${
                  active ? "border-orange-500 bg-orange-50" : "border-gray-300"
                }`}
                style={{
                  padding: isSmallDevice ? 14 : 16,
                }}
                onPress={() => setMethod(item.key as PaymentMethod)}
                activeOpacity={0.75}
                disabled={loading}
              >
                <View className="flex-row items-center flex-1">
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={active ? "#FF7A00" : "#6B7280"}
                  />

                  <Text
                    numberOfLines={1}
                    className="ml-3 text-gray-900 flex-1"
                    style={{ fontSize: isSmallDevice ? 14 : 15 }}
                  >
                    {item.label}
                  </Text>
                </View>

                <Ionicons
                  name={active ? "radio-button-on" : "radio-button-off"}
                  size={22}
                  color="#FF7A00"
                />
              </TouchableOpacity>
            );
          })}

          {method === "card" && (
            <View className="mt-4">
              <Text
                className="font-semibold mb-2"
                style={{ fontSize: isSmallDevice ? 15 : 16 }}
              >
                {t("payment.yourCards")}
              </Text>

              {loadingCards ? (
                <View className="py-4 items-center">
                  <ActivityIndicator color="#FF7A00" />
                </View>
              ) : cards.length === 0 ? (
                <Text
                  className="text-gray-500"
                  style={{ fontSize: isSmallDevice ? 13 : 14 }}
                >
                  {t("payment.noCardsAdded")}
                </Text>
              ) : (
                cards.map((card) => (
                  <TouchableOpacity
                    key={card._id}
                    className={`border rounded-xl mb-2 flex-row justify-between items-center ${
                      selectedCard === card._id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300"
                    }`}
                    style={{
                      padding: isSmallDevice ? 14 : 16,
                    }}
                    onPress={() => setSelectedCard(card._id)}
                    activeOpacity={0.75}
                  >
                    <Text
                      className="text-gray-900 flex-1"
                      numberOfLines={1}
                      style={{ fontSize: isSmallDevice ? 13 : 14 }}
                    >
                      {card.brand} •••• {card.last4}
                    </Text>

                    {selectedCard === card._id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FF7A00"
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}

              <TouchableOpacity
                className="border border-orange-400 rounded-xl px-4 mt-3 justify-center"
                onPress={() => navigation.navigate("AddCard")}
                activeOpacity={0.75}
                style={{ height: isSmallDevice ? 48 : 52 }}
              >
                <Text className="text-orange-500 font-semibold text-center">
                  {t("payment.addNewCard")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="mt-8 bg-gray-50 rounded-2xl p-4">
            <Text
              className="text-gray-500 mb-2"
              style={{ fontSize: isSmallDevice ? 13 : 14 }}
            >
              {quantity} × {tierName}
            </Text>

            <Text
              className="font-bold text-gray-900"
              style={{ fontSize: isSmallDevice ? 20 : 22 }}
            >
              {t("payment.total")}: ${Number(total).toFixed(2)} USD
            </Text>
          </View>

          <TouchableOpacity
            className="rounded-xl mt-10 items-center justify-center"
            onPress={handleCheckout}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              height: isSmallDevice ? 50 : 54,
              backgroundColor: loading ? "#9CA3AF" : "#000",
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {t("payment.checkout").toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}