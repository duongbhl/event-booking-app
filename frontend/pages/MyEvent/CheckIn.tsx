import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();

  const { eventId, eventTitle } = route.params as {
    eventId: string;
    eventTitle: string;
  };

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = async (scannedData: string) => {
    // Prevent scanning the same code twice quickly
    if (lastScanned === scannedData) {
      return;
    }

    setLastScanned(scannedData);
    await processQRCode(scannedData);
  };

  const processQRCode = async (qrCode: string) => {
    try {
      setLoading(true);
      setScanning(false);

      const response = await checkInTicket(
        {
          qrCode,
          eventId,
        },
        token!
      );

      setResult(response);
      setShowResult(true);

      // Auto-restart scanning after 3 seconds
      setTimeout(() => {
        setShowResult(false);
        setScanning(true);
        setLastScanned("");
      }, 3000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to check in ticket";
      setResult({
        message: errorMessage,
        status: error.response?.data?.status || "ERROR",
      });
      setShowResult(true);

      // Auto-restart scanning after 3 seconds
      setTimeout(() => {
        setShowResult(false);
        setScanning(true);
        setLastScanned("");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    // For testing purposes, allow manual QR input
    Alert.prompt(
      "Enter QR Code",
      "Paste the QR code data directly",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Submit",
          onPress: (text: string | undefined) => {
            if (text) {
              handleBarCodeScanned(text);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-5">
        <Ionicons name="camera" size={64} color="#FF7A00" />
        <Text className="text-lg font-semibold mt-4">Camera Permission Required</Text>
        <Text className="text-gray-600 text-center mt-2">
          We need access to your camera to scan ticket QR codes
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center bg-gray-900 px-4 py-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold">Check-in</Text>
          <Text className="text-gray-400 text-sm">{eventTitle}</Text>
        </View>
      </View>

      {/* Camera View */}
      {scanning && !showResult && (
        <View className="flex-1 overflow-hidden">
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            facing="back"
            onBarcodeScanned={({ data }) => {
              handleBarCodeScanned(data);
            }}
          />

          {/* Focus Box */}
          <View className="absolute inset-0 items-center justify-center">
            <View
              style={{
                width: 250,
                height: 250,
                borderWidth: 2,
                borderColor: "#FF7A00",
                borderRadius: 20,
              }}
            />
            <Text className="absolute bottom-20 text-white text-center font-semibold">
              Align QR code within the frame
            </Text>
          </View>

          {/* Bottom Control Bar */}
          <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 px-4 py-4 flex-row items-center justify-between">
            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              onPress={handleManualInput}
            >
              <Ionicons name="create" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">Manual Input</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center px-4 py-2"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={20} color="white" />
              <Text className="text-white ml-2 font-semibold">Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Result Display */}
      {showResult && result && (
        <View className="flex-1 bg-gray-900 items-center justify-center p-4">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            className="w-full"
          >
            {result.status === "SUCCESS" && result.ticket ? (
              <View className="bg-green-50 p-6 rounded-2xl mx-4 border-2 border-green-500">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 bg-green-500 rounded-full items-center justify-center">
                    <Ionicons name="checkmark" size={40} color="white" />
                  </View>
                </View>

                <Text className="text-center text-2xl font-bold text-green-700">
                  Check-in Success
                </Text>

                <View className="bg-white p-4 rounded-xl mt-6">
                  <View className="mb-4 pb-4 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Passenger</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {result.ticket.user.name}
                    </Text>
                  </View>

                  <View className="mb-4 pb-4 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Event</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {result.ticket.event.title}
                    </Text>
                  </View>

                  <View className="mb-4 pb-4 border-b border-gray-200">
                    <Text className="text-gray-600 text-sm">Ticket Type</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {result.ticket.tierName}
                    </Text>
                  </View>

                  <View>
                    <Text className="text-gray-600 text-sm">Seat</Text>
                    <Text className="text-gray-900 font-semibold text-base">
                      {result.ticket.seatInfo || "No seat assignment"}
                    </Text>
                  </View>
                </View>

                <Text className="text-center text-gray-600 text-sm mt-6">
                  Restarting scanner...
                </Text>
              </View>
            ) : result.status === "ALREADY_CHECKED" ? (
              <View className="bg-yellow-50 p-6 rounded-2xl mx-4 border-2 border-yellow-500">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 bg-yellow-500 rounded-full items-center justify-center">
                    <Ionicons name="warning" size={40} color="white" />
                  </View>
                </View>

                <Text className="text-center text-2xl font-bold text-yellow-700">
                  Already Checked
                </Text>

                <View className="bg-white p-4 rounded-xl mt-6">
                  <Text className="text-gray-700 text-center mb-4">
                    This ticket has already been checked in
                  </Text>
                  <Text className="text-gray-600 text-center text-sm">
                    {result.message}
                  </Text>
                </View>

                <Text className="text-center text-gray-600 text-sm mt-6">
                  Restarting scanner...
                </Text>
              </View>
            ) : result.status === "WRONG_EVENT" ? (
              <View className="bg-red-50 p-6 rounded-2xl mx-4 border-2 border-red-500">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center">
                    <Ionicons name="close" size={40} color="white" />
                  </View>
                </View>

                <Text className="text-center text-2xl font-bold text-red-700">
                  Wrong Event
                </Text>

                <View className="bg-white p-4 rounded-xl mt-6">
                  <Text className="text-gray-700 text-center">
                    This QR code does not belong to this event
                  </Text>
                </View>

                <Text className="text-center text-gray-600 text-sm mt-6">
                  Restarting scanner...
                </Text>
              </View>
            ) : (
              <View className="bg-red-50 p-6 rounded-2xl mx-4 border-2 border-red-500">
                <View className="items-center mb-4">
                  <View className="w-16 h-16 bg-red-500 rounded-full items-center justify-center">
                    <Ionicons name="alert-circle" size={40} color="white" />
                  </View>
                </View>

                <Text className="text-center text-xl font-bold text-red-700">
                  Error
                </Text>

                <View className="bg-white p-4 rounded-xl mt-6">
                  <Text className="text-gray-700 text-center">
                    {result.message}
                  </Text>
                </View>

                <TouchableOpacity
                  className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
                  onPress={() => {
                    setShowResult(false);
                    setScanning(true);
                    setLastScanned("");
                  }}
                >
                  <Text className="text-white font-semibold text-center">
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center rounded-2xl">
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text className="text-white mt-4 font-semibold">Processing...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}
