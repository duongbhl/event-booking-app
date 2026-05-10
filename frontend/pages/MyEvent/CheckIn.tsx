import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
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

export default function CheckInScreen() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const scanBoxSize = isTablet ? 320 : isSmallDevice ? 220 : 260;

  const { eventId, eventTitle } = route.params as {
    eventId: string;
    eventTitle: string;
  };

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [permission, requestPermission]);

  const restartScanner = useCallback(() => {
    setShowResult(false);
    setScanning(true);
    setLastScanned("");
  }, []);

  const processQRCode = useCallback(
    async (qrCode: string) => {
      if (!token || loading) return;

      try {
        setLoading(true);
        setScanning(false);

        const response = await checkInTicket(
          {
            qrCode,
            eventId,
          },
          token
        );

        setResult(response);
        setShowResult(true);
      } catch (error: any) {
        setResult({
          message:
            error.response?.data?.message || "Failed to check in ticket",
          status: error.response?.data?.status || "ERROR",
        });
        setShowResult(true);
      } finally {
        setLoading(false);

        timeoutRef.current = setTimeout(() => {
          restartScanner();
        }, 3000);
      }
    },
    [token, loading, eventId, restartScanner]
  );

  const handleBarCodeScanned = useCallback(
    async (scannedData: string) => {
      if (!scanning || loading) return;
      if (lastScanned === scannedData) return;

      setLastScanned(scannedData);
      await processQRCode(scannedData);
    },
    [scanning, loading, lastScanned, processQRCode]
  );

  const handleManualInput = useCallback(() => {
    Alert.prompt(
      t("checkIn.enterQRCode"),
      t("checkIn.pasteQRData"),
      [
        {
          text: t("checkIn.cancel"),
          style: "cancel",
        },
        {
          text: t("checkIn.submit"),
          onPress: (text?: string) => {
            if (text?.trim()) handleBarCodeScanned(text.trim());
          },
        },
      ],
      "plain-text"
    );
  }, [t, handleBarCodeScanned]);

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="camera" size={64} color="#FF7A00" />

        <Text
          className="font-semibold mt-4 text-center text-gray-900"
          style={{
            fontSize: isSmallDevice ? 17 : 19,
          }}
        >
          {t("checkIn.cameraPermissionRequired")}
        </Text>

        <Text className="text-gray-600 text-center mt-2">
          {t("checkIn.needCameraAccess")}
        </Text>

        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
          activeOpacity={0.85}
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">
            {t("checkIn.grantPermission")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const renderResult = () => {
    if (!result) return null;

    const isSuccess = result.status === "SUCCESS" && result.ticket;
    const isAlreadyChecked = result.status === "ALREADY_CHECKED";
    const isWrongEvent = result.status === "WRONG_EVENT";

    const color = isSuccess
      ? "green"
      : isAlreadyChecked
      ? "yellow"
      : "red";

    const iconName = isSuccess
      ? "checkmark"
      : isAlreadyChecked
      ? "warning"
      : "close";

    const title = isSuccess
      ? t("checkIn.checkInSuccess")
      : isAlreadyChecked
      ? t("checkIn.alreadyChecked")
      : isWrongEvent
      ? t("checkIn.wrongEvent")
      : t("checkIn.error");

    return (
      <View className="flex-1 bg-gray-900 items-center justify-center p-4">
        <ScrollView
          className="w-full"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
          }}
        >
          <View
            className={`p-5 rounded-2xl mx-2 border-2 ${
              color === "green"
                ? "bg-green-50 border-green-500"
                : color === "yellow"
                ? "bg-yellow-50 border-yellow-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <View className="items-center mb-4">
              <View
                className={`rounded-full items-center justify-center ${
                  color === "green"
                    ? "bg-green-500"
                    : color === "yellow"
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{
                  width: isSmallDevice ? 58 : 64,
                  height: isSmallDevice ? 58 : 64,
                }}
              >
                <Ionicons name={iconName as any} size={38} color="white" />
              </View>
            </View>

            <Text
              className={`text-center font-bold ${
                color === "green"
                  ? "text-green-700"
                  : color === "yellow"
                  ? "text-yellow-700"
                  : "text-red-700"
              }`}
              style={{
                fontSize: isSmallDevice ? 20 : 24,
              }}
            >
              {title}
            </Text>

            {isSuccess && result.ticket ? (
              <View className="bg-white p-4 rounded-xl mt-6">
                <InfoRow label={t("checkIn.passenger")} value={result.ticket.user.name} />
                <InfoRow label={t("checkIn.event")} value={result.ticket.event.title} />
                <InfoRow label={t("checkIn.ticketType")} value={result.ticket.tierName} />
                <InfoRow
                  label={t("checkIn.seat")}
                  value={result.ticket.seatInfo || t("checkIn.noSeatAssignment")}
                  last
                />
              </View>
            ) : (
              <View className="bg-white p-4 rounded-xl mt-6">
                <Text className="text-gray-700 text-center">
                  {isWrongEvent ? t("checkIn.wrongEventMessage") : result.message}
                </Text>
              </View>
            )}

            <Text className="text-center text-gray-600 text-sm mt-6">
              {t("checkIn.restartingScanner")}
            </Text>

            {!isSuccess && (
              <TouchableOpacity
                className="bg-orange-500 px-6 py-3 rounded-xl mt-5"
                activeOpacity={0.85}
                onPress={restartScanner}
              >
                <Text className="text-white font-semibold text-center">
                  {t("checkIn.tryAgain")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center bg-gray-900 px-4 py-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={10}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>

        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">
            {t("checkIn.checkInTitle")}
          </Text>

          <Text numberOfLines={1} className="text-gray-400 text-sm">
            {eventTitle}
          </Text>
        </View>
      </View>

      {scanning && !showResult && (
        <View className="flex-1 overflow-hidden">
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={({ data }) => handleBarCodeScanned(data)}
          />

          <View className="absolute inset-0 items-center justify-center">
            <View
              style={{
                width: scanBoxSize,
                height: scanBoxSize,
                borderWidth: 2,
                borderColor: "#FF7A00",
                borderRadius: 24,
              }}
            />

            <Text className="absolute bottom-24 text-white text-center font-semibold px-6">
              {t("checkIn.alignQRCode")}
            </Text>
          </View>

          <View
            className="absolute left-0 right-0 bg-black/70 px-4 py-4 flex-row items-center justify-between"
            style={{
              bottom: Platform.OS === "ios" ? 20 : 0,
            }}
          >
            <TouchableOpacity
              className="flex-row items-center px-3 py-2"
              activeOpacity={0.75}
              onPress={handleManualInput}
            >
              <Ionicons name="create" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">
                {t("checkIn.manualInput")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-3 py-2"
              activeOpacity={0.75}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">
                {t("checkIn.exit")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showResult && renderResult()}

      {loading && (
        <View className="absolute inset-0 bg-black/50 items-center justify-center">
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text className="text-white mt-4 font-semibold">
            {t("checkIn.processing")}
          </Text>
        </View>
      )}
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
    <View className={`${last ? "" : "mb-4 pb-4 border-b border-gray-200"}`}>
      <Text className="text-gray-600 text-sm">{label}</Text>
      <Text className="text-gray-900 font-semibold text-base">{value}</Text>
    </View>
  );
}