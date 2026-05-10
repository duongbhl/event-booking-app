import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { useLocalization } from "../../context/LocalizationContext";
import { formatDateTime } from "../../utils/utils";
import api from "../../services/api";

export default function Ticket() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const qrSize = isTablet ? 190 : isSmallDevice ? 140 : 160;

  const [loadingEvent, setLoadingEvent] = useState(false);

  const tickets = route.params?.tickets;

  const handleOpenEvent = useCallback(async () => {
    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) return;

    try {
      setLoadingEvent(true);

      const eventId = tickets[0]?.event?._id;

      if (!eventId) {
        Alert.alert("Error", t("ticketView.noEventIdFound"));
        return;
      }

      const { data: fullEvent } = await api.get(`/events/${eventId}`);

      Alert.alert("Success", t("ticketView.ticketsSaved"), [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("EventDetails", {
              event: fullEvent,
            } as never);
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", t("ticketView.failedToLoadEventDetails"));
    } finally {
      setLoadingEvent(false);
    }
  }, [tickets, navigation, t]);

  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Ionicons name="alert-circle" size={52} color="#FF7A00" />

        <Text
          className="font-semibold mt-4 text-center"
          style={{ fontSize: isSmallDevice ? 17 : 18 }}
        >
          {t("ticketView.noTickets")}
        </Text>

        <Text className="text-gray-500 text-center mt-2">
          {t("ticketView.noTicketDataReceived")}
        </Text>

        <TouchableOpacity
          className="bg-black px-6 py-3 rounded-xl mt-6"
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold">
            {t("ticketView.goBack")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderTicket = ({ item, index }: { item: any; index: number }) => {
    const event = item.event;

    const qrValue =
      item.qrCode ||
      JSON.stringify({
        ticketId: item._id,
        eventId: event?._id,
        userId: item.user,
      });

    return (
      <View
        className="bg-orange-500 rounded-3xl mb-6"
        style={{
          padding: isSmallDevice ? 16 : 20,
        }}
      >
        {event?.images && (
          <Image
            source={{ uri: event.images }}
            className="w-full rounded-2xl mb-4 bg-gray-200"
            style={{
              height: isTablet ? 230 : isSmallDevice ? 140 : 170,
            }}
            resizeMode="cover"
          />
        )}

        <View
          className="bg-white rounded-2xl"
          style={{
            padding: isSmallDevice ? 14 : 16,
          }}
        >
          <Text
            numberOfLines={2}
            className="font-semibold mb-2 text-gray-900"
            style={{ fontSize: isSmallDevice ? 16 : 18 }}
          >
            {event?.title}
          </Text>

          <TicketInfo label="📍 Location" value={event?.location} />
          <TicketInfo label="📅 Date" value={formatDateTime(event?.date)} />
          <TicketInfo label="🎟 Type" value={item.ticketType} />
          <TicketInfo label="💺 Seat" value={item.seatInfo} />
          <TicketInfo label="💰 Price" value={`$${item.price} USD`} />

          <View className="mt-5 items-center">
            <QRCode value={qrValue} size={qrSize} />

            <Text className="text-xs text-gray-500 mt-2">
              Ticket #{index + 1}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-row items-center mb-4"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isSmallDevice ? 8 : 12,
        }}
      >
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
          {t("ticketView.tickets")}
        </Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item, index) => item?._id || String(index)}
        renderItem={renderTicket}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS === "android"}
        initialNumToRender={3}
        maxToRenderPerBatch={4}
        windowSize={6}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: Platform.OS === "ios" ? 120 : 100,
        }}
      />

      <View
        className="bg-white border-t border-gray-100"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 24 : 16,
        }}
      >
        <TouchableOpacity
          className="bg-black rounded-xl justify-center items-center"
          disabled={loadingEvent}
          onPress={handleOpenEvent}
          activeOpacity={0.85}
          style={{
            height: isSmallDevice ? 50 : 54,
            opacity: loadingEvent ? 0.6 : 1,
          }}
        >
          {loadingEvent ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-semibold">
              {t("ticketView.downloadAllTickets").toUpperCase()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TicketInfo({ label, value }: { label: string; value?: string }) {
  return (
    <Text className="text-gray-700 mt-1" numberOfLines={2}>
      {label}: {value || "-"}
    </Text>
  );
}