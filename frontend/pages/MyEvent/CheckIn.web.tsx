import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { checkInTicket } from "../../services/ticket.service";
import { useAuth } from "../../context/AuthContext";

interface CheckInResult {
  message: string;
  status: string;
  ticket?: {
    _id: string;
    user: { name: string; email: string };
    event: { title: string };
    tierName: string;
    seatInfo: string;
    checked: boolean;
    checkedAt: Date;
  };
}

export default function CheckInWebScreen() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const { eventId, eventTitle } = route.params as {
    eventId: string;
    eventTitle: string;
  };

  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  const handleSubmit = async () => {
    if (!token || !qrCode.trim() || loading) {
      return;
    }

    try {
      setLoading(true);
      const response = await checkInTicket({ qrCode: qrCode.trim(), eventId }, token);
      setResult(response);
    } catch (error: any) {
      setResult({
        message: error.response?.data?.message || "Failed to check in ticket",
        status: error.response?.data?.status || "ERROR",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = result?.status === "SUCCESS" && result.ticket;

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>

        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold text-lg">
            {t("checkIn.checkInTitle")}
          </Text>
          <Text className="text-slate-400 text-sm" numberOfLines={1}>
            {eventTitle}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[28px] bg-white p-6 border border-slate-200">
          <View className="items-center">
            <View className="h-16 w-16 rounded-full bg-orange-100 items-center justify-center">
              <Ionicons name="qr-code-outline" size={34} color="#F97316" />
            </View>
            <Text
              className="mt-4 text-center font-semibold text-slate-900"
              style={{ fontSize: isSmallDevice ? 20 : 24 }}
            >
              {t("checkIn.manualInput")}
            </Text>
            <Text className="mt-2 text-center text-slate-500">
              Ban web demo khong dung camera. Hay dan chuoi QR code vao o ben duoi de check-in.
            </Text>
          </View>

          <TextInput
            value={qrCode}
            onChangeText={setQrCode}
            placeholder={t("checkIn.pasteQRData")}
            multiline
            textAlignVertical="top"
            className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900"
            style={{ minHeight: 140 }}
          />

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || !qrCode.trim()}
            className="mt-5 h-14 rounded-full bg-[#FF6B00] items-center justify-center"
            style={{ opacity: loading || !qrCode.trim() ? 0.6 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg font-semibold">
                {t("checkIn.submit")}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View
            className={`mt-5 rounded-[28px] p-5 border ${
              isSuccess
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <Text
              className={`font-semibold text-lg ${
                isSuccess ? "text-green-800" : "text-red-800"
              }`}
            >
              {isSuccess ? t("checkIn.checkInSuccess") : t("checkIn.error")}
            </Text>

            <Text
              className={`mt-2 ${
                isSuccess ? "text-green-900" : "text-red-900"
              }`}
            >
              {result.message}
            </Text>

            {isSuccess && result.ticket && (
              <View className="mt-4 rounded-2xl bg-white p-4">
                <InfoRow label={t("checkIn.passenger")} value={result.ticket.user.name} />
                <InfoRow label={t("checkIn.event")} value={result.ticket.event.title} />
                <InfoRow label={t("checkIn.ticketType")} value={result.ticket.tierName} />
                <InfoRow
                  label={t("checkIn.seat")}
                  value={result.ticket.seatInfo || t("checkIn.noSeatAssignment")}
                  last
                />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View className={last ? "" : "mb-4 pb-4 border-b border-slate-200"}>
      <Text className="text-slate-500 text-sm">{label}</Text>
      <Text className="text-slate-900 font-semibold text-base">{value}</Text>
    </View>
  );
}
