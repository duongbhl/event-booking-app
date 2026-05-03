import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../constants/colors";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { getMyTickets } from "../../services/ticket.service";

interface ActionBarProps {
  eventId?: string;
}

export default function ActionBar({ eventId }: ActionBarProps) {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(false);

  const handleMyTicketPress = async () => {
    if (!token) {
      Alert.alert(t('actionBar.loginRequired'), t('actionBar.pleaseLogin'));
      return;
    }

    try {
      setLoading(true);

      // 🔥 FETCH MỚI MỖI LẦN NHẤN
      const tickets = await getMyTickets(token);

      // 🔥 FILTER TICKETS CHỈ CỦA EVENT ĐÓ NẾU CÓ EVENID
      let filteredTickets = tickets;
      if (eventId) {
        filteredTickets = tickets.filter(
          (t: any) =>
            t.event?._id === eventId &&
            t.paymentStatus === "paid"
        );
      }

      if (!filteredTickets || filteredTickets.length === 0) {
        Alert.alert(t('actionBar.noTickets'), t('actionBar.noTicketsBooked'));
        return;
      }

      // 👉 luôn truyền data mới
      navigation.navigate("Ticket", { tickets: filteredTickets });
    } catch (err) {
      console.log("Fetch tickets error", err);
      Alert.alert(t('common.error'), t('actionBar.failedLoadTickets'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white w-[85%] mx-auto rounded-3xl shadow-lg py-4 flex-row justify-around -mt-12 z-50">
      {/* Call */}
      <TouchableOpacity className="items-center">
        <View className="bg-orange-100 p-4 rounded-full">
          <MaterialIcons name="call" size={26} color={Colors.primary} />
        </View>
        <Text className="text-xs mt-2 text-gray-700">{t('actionBar.call')}</Text>
      </TouchableOpacity>


      {/* 🎟 MY TICKET */}
      <TouchableOpacity
        className="items-center"
        onPress={handleMyTicketPress}
        disabled={loading}
      >
        <View className="bg-orange-100 p-4 rounded-full">
          <MaterialIcons
            name="confirmation-number"
            size={26}
            color={Colors.primary}
          />
        </View>
        <Text className="text-xs mt-2 text-gray-700">
          {loading ? t('common.loading') : t('actionBar.myTicket')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
