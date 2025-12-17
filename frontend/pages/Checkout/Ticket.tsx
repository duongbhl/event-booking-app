import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import { formatDateTime } from "../../utils/utils";

export default function Ticket() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const tickets = route.params?.tickets;

  if (!tickets || tickets.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text>No ticket data+{tickets.length}</Text>
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
          Tickets
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
        onPress={() =>
          Alert.alert(
            "Download",
            "You can implement download using react-native-view-shot"
          )
        }
      >
        <Text className="text-white text-center font-semibold">
          DOWNLOAD ALL TICKETS
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
