import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { addCard } from "../../services/card.service";
import { useLocalization } from "../../context/LocalizationContext";

export default function AddCard() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const inputHeight = isSmallDevice ? 48 : 52;

  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanCardNumber = useMemo(
    () => cardNumber.replace(/\s/g, ""),
    [cardNumber]
  );

  const isValid = useMemo(() => {
    return cleanCardNumber.length >= 12 && expMonth.length >= 1 && expYear.length >= 2;
  }, [cleanCardNumber, expMonth, expYear]);

  const formatCardNumber = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 19);
    const grouped = cleaned.match(/.{1,4}/g);
    setCardNumber(grouped ? grouped.join(" ") : "");
  }, []);

  const handleMonthChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 2);
    setExpMonth(cleaned);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4);
    setExpYear(cleaned);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!token || loading) return;

    if (!isValid) {
      Alert.alert(t("common.error"), t("booking.failedAddCard"));
      return;
    }

    const month = Number(expMonth);
    const year = Number(expYear);

    if (month < 1 || month > 12) {
      Alert.alert(t("common.error"), "Invalid expiration month");
      return;
    }

    try {
      setLoading(true);

      await addCard(
        {
          cardNumber: cleanCardNumber,
          expMonth: month,
          expYear: year,
          isPrimary: save,
        },
        token
      );

      Alert.alert(t("common.success"), t("booking.cardAddedSuccess"));
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        t("common.error"),
        err?.response?.data?.message || t("booking.failedAddCard")
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    loading,
    isValid,
    expMonth,
    expYear,
    cleanCardNumber,
    save,
    t,
    navigation,
  ]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
            paddingBottom: Platform.OS === "ios" ? 110 : 90,
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
              {t("booking.addNewCard")}
            </Text>
          </View>

          <InputLabel label={t("booking.cardNumber")} isSmallDevice={isSmallDevice} />

          <TextInput
            value={cardNumber}
            onChangeText={formatCardNumber}
            placeholder="0000 0000 0000 0000"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="border border-gray-300 rounded-xl px-4 text-gray-900 mb-4"
            style={{
              height: inputHeight,
              fontSize: isSmallDevice ? 14 : 15,
              paddingVertical: Platform.OS === "ios" ? 10 : 6,
            }}
            returnKeyType="next"
            editable={!loading}
            maxLength={23}
          />

          <View className="flex-row justify-between mb-4">
            <View style={{ width: "48%" }}>
              <InputLabel label={t("booking.expMonth")} isSmallDevice={isSmallDevice} />

              <TextInput
                value={expMonth}
                onChangeText={handleMonthChange}
                placeholder="MM"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="border border-gray-300 rounded-xl px-4 text-gray-900"
                style={{
                  height: inputHeight,
                  fontSize: isSmallDevice ? 14 : 15,
                  paddingVertical: Platform.OS === "ios" ? 10 : 6,
                }}
                returnKeyType="next"
                editable={!loading}
                maxLength={2}
              />
            </View>

            <View style={{ width: "48%" }}>
              <InputLabel label={t("booking.expYear")} isSmallDevice={isSmallDevice} />

              <TextInput
                value={expYear}
                onChangeText={handleYearChange}
                placeholder="YY"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="border border-gray-300 rounded-xl px-4 text-gray-900"
                style={{
                  height: inputHeight,
                  fontSize: isSmallDevice ? 14 : 15,
                  paddingVertical: Platform.OS === "ios" ? 10 : 6,
                }}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                editable={!loading}
                maxLength={4}
              />
            </View>
          </View>

          <TouchableOpacity
            className="flex-row items-center my-4"
            onPress={() => setSave((prev) => !prev)}
            activeOpacity={0.75}
            disabled={loading}
          >
            <Ionicons
              name={save ? "checkbox" : "square-outline"}
              size={22}
              color="#FF7A00"
            />

            <Text
              className="ml-2 text-gray-800 flex-1"
              style={{ fontSize: isSmallDevice ? 13 : 14 }}
            >
              {t("booking.saveAsPrimaryCard")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-xl mt-10 items-center justify-center"
            onPress={handleSubmit}
            disabled={loading || !isValid}
            activeOpacity={0.85}
            style={{
              height: isSmallDevice ? 50 : 54,
              backgroundColor: "#000",
              opacity: loading || !isValid ? 0.5 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">
                {t("booking.addCard")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputLabel({
  label,
  isSmallDevice,
}: {
  label: string;
  isSmallDevice: boolean;
}) {
  return (
    <Text
      className="text-gray-500 mb-2"
      style={{ fontSize: isSmallDevice ? 12 : 13 }}
    >
      {label}
    </Text>
  );
}