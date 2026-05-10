import React, { useState } from "react";
import { View, TouchableOpacity, Text, Alert, useWindowDimensions } from "react-native";
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
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const isSmall = width < 360;

  const handleMyTicketPress = async () => {
    if (!token) {
      Alert.alert(t('actionBar.loginRequired'), t('actionBar.pleaseLogin'));
      return;
    }

    try {
      setLoading(true);
      const tickets = await getMyTickets(token);
      let filteredTickets = tickets;
      if (eventId) {
        filteredTickets = tickets.filter(
          (t: any) => t.event?._id === eventId && t.paymentStatus === "paid"
        );
      }

      if (!filteredTickets || filteredTickets.length === 0) {
        Alert.alert(t('actionBar.noTickets'), t('actionBar.noTicketsBooked'));
        return;
      }

      navigation.navigate("Ticket", { tickets: filteredTickets });
    } catch (err) {
      console.log("Fetch tickets error", err);
      Alert.alert(t('common.error'), t('actionBar.failedLoadTickets'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      className="bg-white mx-auto rounded-3xl shadow-lg flex-row justify-around -mt-12 z-50"
      style={{ width: Math.min(width * 0.9, 420), paddingVertical: isSmall ? 12 : 16 }}
    >
      <TouchableOpacity className="items-center flex-1 px-2" activeOpacity={0.85}>
        <View className="bg-orange-100 rounded-full" style={{ padding: isSmall ? 12 : 16 }}>
          <MaterialIcons name="call" size={isSmall ? 22 : 26} color={Colors.primary} />
        </View>
        <Text className="mt-2 text-gray-700 text-center" style={{ fontSize: isSmall ? 11 : 12 }} numberOfLines={1}>
          {t('actionBar.call')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center flex-1 px-2"
        onPress={handleMyTicketPress}
        disabled={loading}
        activeOpacity={0.85}
      >
        <View className="bg-orange-100 rounded-full" style={{ padding: isSmall ? 12 : 16 }}>
          <MaterialIcons name="confirmation-number" size={isSmall ? 22 : 26} color={Colors.primary} />
        </View>
        <Text className="mt-2 text-gray-700 text-center" style={{ fontSize: isSmall ? 11 : 12 }} numberOfLines={1}>
          {loading ? t('common.loading') : t('actionBar.myTicket')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
