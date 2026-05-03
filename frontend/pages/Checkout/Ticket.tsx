import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
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
  const [loadingEvent, setLoadingEvent] = useState(false);

  const tickets = route.params?.tickets;

  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Ionicons name="alert-circle" size={48} color="#FF7A00" />
        <Text className="text-lg font-semibold mt-4">{t('ticketView.noTickets')}</Text>
        <Text className="text-gray-500 text-center mt-2 px-6">
          {t('ticketView.noTicketDataReceived')}
        </Text>
        <TouchableOpacity
          className="bg-black px-6 py-3 rounded-xl mt-6"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-semibold">{t('ticketView.goBack')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5 mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-semibold mr-6">
          {t('ticketView.tickets')}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {tickets.map((ticket: any, index: number) => {
          const event = ticket.event;

          const qrValue =
            ticket.qrCode ||
            JSON.stringify({
              ticketId: ticket._id,
              eventId: event?._id,
              userId: ticket.user,
            });

          return (
            <View
              key={ticket._id}
              className="bg-orange-500 rounded-3xl p-5 mb-6"
            >
              {/* Event Image */}
              {event?.images && (
                <Image
                  source={{ uri: event.images }}
                  className="w-full h-40 rounded-2xl mb-4"
                />
              )}

              <View className="bg-white rounded-2xl p-4">
                <Text className="font-semibold text-lg mb-2">
                  {event?.title}
                </Text>

                <Text className="text-gray-700">
                  📍 Location: {event?.location}
                </Text>

                <Text className="text-gray-700 mt-1">
                  📅 Date: {formatDateTime(event?.date)}
                </Text>

                <Text className="text-gray-700 mt-1">
                  🎟 Type: {ticket.ticketType}
                </Text>

                <Text className="text-gray-700 mt-1">
                  💺 Seat: {ticket.seatInfo}
                </Text>

                <Text className="text-gray-700 mt-1">
                  💰 Price: ${ticket.price} USD
                </Text>

                <View className="mt-5 items-center">
                  <QRCode value={qrValue} size={160} />
                  <Text className="text-xs text-gray-500 mt-2">
                    Ticket #{index + 1}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        className="bg-black py-4 rounded-xl mx-5 mb-5"
        disabled={loadingEvent}
        onPress={async () => {
          try {
            setLoadingEvent(true);
            // Fetch full event with organizer details
            const eventId = tickets[0]?.event?._id;
            if (!eventId) {
              Alert.alert("Error", t('ticketView.noEventIdFound'));
              return;
            }

            const { data: fullEvent } = await api.get(`/events/${eventId}`);

            Alert.alert(
              "Success",
              t('ticketView.ticketsSaved'),
              [
                {
                  text: "OK",
                  onPress: () => {
                    navigation.navigate("EventDetails", {
                      event: fullEvent,
                    } as never);
                  },
                },
              ]
            );
          } catch (error) {
            console.error("Fetch event error:", error);
            Alert.alert("Error", t('ticketView.failedToLoadEventDetails'));
          } finally {
            setLoadingEvent(false);
          }
        }}
      >
        {loadingEvent ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-center font-semibold">
            {t('ticketView.downloadAllTickets').toUpperCase()}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
