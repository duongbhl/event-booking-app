import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalization } from "../../context/LocalizationContext";

interface ITicketTier {
  name: string;
  price: number;
  quota: number;
  sold: number;
}

export default function BuyTicket() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;

  const { eventId, ticketTiers = [] } = route.params as {
    eventId: string;
    ticketTiers?: ITicketTier[];
  };

  const [selectedTier, setSelectedTier] = useState<string>(
    ticketTiers[0]?.name || ""
  );
  const [quantity, setQuantity] = useState(1);

  const currentTier = useMemo(() => {
    return ticketTiers.find((ticket) => ticket.name === selectedTier);
  }, [selectedTier, ticketTiers]);

  const unitPrice = currentTier?.price || 0;
  const availableQuota = currentTier
    ? Math.max(currentTier.quota - currentTier.sold, 0)
    : 0;
  const total = unitPrice * quantity;

  const handleSelectTier = useCallback((tier: ITicketTier) => {
    const isSoldOut = tier.sold >= tier.quota;
    if (isSoldOut) return;

    setSelectedTier(tier.name);
    setQuantity(1);
  }, []);

  const decreaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, availableQuota));
  }, [availableQuota]);

  const canContinue = availableQuota > 0 && quantity <= availableQuota;

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
            {t("buyTicket.ticket")}
          </Text>
        </View>

        {!ticketTiers || ticketTiers.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="ticket-outline" size={56} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3 text-center">
              {t("buyTicket.noTicketTiersAvailable")}
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 110 : 90,
            }}
          >
            <Text
              className="font-semibold mb-3"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {t("buyTicket.ticketType")}
            </Text>

            <View className="flex-row flex-wrap mb-5" style={{ gap: 10 }}>
              {ticketTiers.map((tier) => {
                const active = selectedTier === tier.name;
                const isSoldOut = tier.sold >= tier.quota;

                return (
                  <TouchableOpacity
                    key={tier.name}
                    onPress={() => handleSelectTier(tier)}
                    disabled={isSoldOut}
                    activeOpacity={0.75}
                    className={`rounded-xl ${
                      isSoldOut
                        ? "bg-gray-200"
                        : active
                        ? "bg-orange-500"
                        : "bg-orange-100"
                    }`}
                    style={{
                      width: isTablet ? "31%" : "48%",
                      paddingVertical: isSmallDevice ? 12 : 14,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      className={`text-center font-semibold ${
                        isSoldOut
                          ? "text-gray-500"
                          : active
                          ? "text-white"
                          : "text-orange-500"
                      }`}
                      style={{ fontSize: isSmallDevice ? 13 : 14 }}
                    >
                      {tier.name}
                    </Text>

                    <Text
                      className={`text-center mt-1 ${
                        isSoldOut
                          ? "text-gray-500"
                          : active
                          ? "text-white"
                          : "text-orange-400"
                      }`}
                      style={{ fontSize: isSmallDevice ? 11 : 12 }}
                    >
                      ${tier.price}
                      {isSoldOut ? ` - ${t("buyTicket.soldOut")}` : ""}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              className="font-semibold mb-2"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {t("buyTicket.quantity")}
            </Text>

            <Text
              className="text-gray-600 mb-3"
              style={{ fontSize: isSmallDevice ? 13 : 14 }}
            >
              {t("buyTicket.available")}: {availableQuota}{" "}
              {t("buyTicket.tickets")}
            </Text>

            <View className="flex-row items-center justify-between bg-gray-100 rounded-xl mb-6 px-4 py-4">
              <TouchableOpacity
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
                activeOpacity={0.75}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
                style={{ opacity: quantity <= 1 ? 0.4 : 1 }}
              >
                <Ionicons name="remove" size={22} />
              </TouchableOpacity>

              <Text
                className="font-semibold"
                style={{ fontSize: isSmallDevice ? 20 : 22 }}
              >
                {String(quantity).padStart(2, "0")}
              </Text>

              <TouchableOpacity
                onPress={increaseQuantity}
                disabled={quantity >= availableQuota}
                activeOpacity={0.75}
                className="w-10 h-10 rounded-full bg-white items-center justify-center"
                style={{ opacity: quantity >= availableQuota ? 0.4 : 1 }}
              >
                <Ionicons name="add" size={22} />
              </TouchableOpacity>
            </View>

            <Text
              className="font-semibold mb-3"
              style={{ fontSize: isSmallDevice ? 16 : 18 }}
            >
              {t("buyTicket.priceSummary")}
            </Text>

            <SummaryRow
              label={`${selectedTier} ${t("buyTicket.ticket")}`}
              value={`$${unitPrice.toFixed(2)} USD`}
              isSmallDevice={isSmallDevice}
            />

            <SummaryRow
              label={`${quantity} × $${unitPrice.toFixed(2)}`}
              value={`$${total.toFixed(2)} USD`}
              isSmallDevice={isSmallDevice}
            />

            <View className="mt-5">
              <Text
                className="font-bold"
                style={{ fontSize: isSmallDevice ? 18 : 20 }}
              >
                {t("buyTicket.total")}: ${total.toFixed(2)} USD
              </Text>
            </View>

            <TouchableOpacity
              className="rounded-xl mt-10 justify-center items-center"
              onPress={() =>
                navigation.navigate("Payment", {
                  eventId,
                  tierName: selectedTier,
                  quantity,
                  total,
                })
              }
              disabled={!canContinue}
              activeOpacity={0.85}
              style={{
                height: isSmallDevice ? 50 : 54,
                backgroundColor: canContinue ? "#000" : "#9CA3AF",
              }}
            >
              <Text className="text-center text-white font-semibold">
                {availableQuota === 0
                  ? t("buyTicket.soldOut").toUpperCase()
                  : t("buyTicket.continue").toUpperCase()}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function SummaryRow({
  label,
  value,
  isSmallDevice,
}: {
  label: string;
  value: string;
  isSmallDevice: boolean;
}) {
  return (
    <View className="mb-3 flex-row justify-between items-center">
      <Text
        numberOfLines={1}
        className="text-gray-700 flex-1 mr-3"
        style={{ fontSize: isSmallDevice ? 13 : 14 }}
      >
        {label}
      </Text>

      <Text
        className="font-medium text-gray-900"
        style={{ fontSize: isSmallDevice ? 13 : 14 }}
      >
        {value}
      </Text>
    </View>
  );
}