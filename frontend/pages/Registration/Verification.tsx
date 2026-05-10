import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalization } from "../../context/LocalizationContext";
import { useNavigation } from "@react-navigation/native";

export default function Verification() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputs = useRef<Array<TextInput | null>>([]);

  const otpBoxSize = useMemo(() => {
    if (isTablet) return 72;
    if (isSmallDevice) return 52;
    return 60;
  }, [isTablet, isSmallDevice]);

  const otpGap = useMemo(() => {
    if (isSmallDevice) return 10;
    return 16;
  }, [isSmallDevice]);

  const handleChange = useCallback(
    (value: string, index: number) => {
      const onlyNumbers = value.replace(/[^0-9]/g, "");

      if (onlyNumbers.length > 1) {
        const pasted = onlyNumbers.slice(0, 4).split("");
        const newOtp = ["", "", "", ""];

        pasted.forEach((char, i) => {
          newOtp[i] = char;
        });

        setOtp(newOtp);

        const nextIndex = Math.min(pasted.length, 3);
        inputs.current[nextIndex]?.focus();

        if (pasted.length === 4) {
          Keyboard.dismiss();
        }

        return;
      }

      const newOtp = [...otp];
      newOtp[index] = onlyNumbers;
      setOtp(newOtp);

      if (onlyNumbers && index < 3) {
        inputs.current[index + 1]?.focus();
      }

      if (index === 3 && onlyNumbers) {
        Keyboard.dismiss();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === "Backspace" && !otp[index] && index > 0) {
        inputs.current[index - 1]?.focus();

        setOtp((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    },
    [otp]
  );

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
            paddingHorizontal: isTablet ? 40 : isSmallDevice ? 18 : 24,
            paddingBottom: 40,
          }}
        >
          <View className="flex-row items-center justify-between mt-4">
            <TouchableOpacity
              className="p-2"
              hitSlop={10}
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 32 : 26}
                color="#111827"
              />
            </TouchableOpacity>

            <View style={{ width: 40 }} />
          </View>

          <View className="flex-1 justify-center">
            <Text
              className="font-semibold text-center text-gray-900"
              style={{
                fontSize: isTablet ? 36 : isSmallDevice ? 26 : 30,
                marginTop: isSmallDevice ? 8 : 16,
              }}
            >
              {t("auth.verification")}
            </Text>

            <Text
              className="text-center text-gray-500 leading-5"
              style={{
                marginTop: 12,
                fontSize: isSmallDevice ? 13 : 14,
              }}
            >
              {t("auth.verificationSubtitle")}
              {"\n"}
              <Text className="font-semibold text-gray-900">
                +1 6358 9248 5789
              </Text>
            </Text>

            <View
              className="flex-row justify-center"
              style={{
                gap: otpGap,
                marginTop: isSmallDevice ? 34 : 42,
              }}
            >
              {otp.map((digit, i) => (
                <View
                  key={i}
                  className="rounded-2xl justify-center items-center"
                  style={{
                    width: otpBoxSize,
                    height: otpBoxSize + 4,
                    borderWidth: 1.5,
                    borderColor: digit ? "#F97316" : "#E5E7EB",
                  }}
                >
                  <TextInput
                    ref={(ref) => {
                      inputs.current[i] = ref;
                    }}
                    className="text-center font-semibold text-gray-900"
                    style={{
                      width: "100%",
                      height: "100%",
                      fontSize: isTablet ? 26 : 20,
                      padding: 0,
                    }}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    maxLength={4}
                    value={digit}
                    onChangeText={(value) => handleChange(value, i)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, i)
                    }
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            <TouchableOpacity
              className="mt-10"
              activeOpacity={0.8}
              disabled={otp.join("").length < 4}
            >
              <LinearGradient
                colors={["#383838", "#121212"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="justify-center items-center"
                style={{
                  height: isSmallDevice ? 52 : 56,
                  borderRadius: 28,
                  opacity: otp.join("").length < 4 ? 0.5 : 1,
                }}
              >
                <Text
                  className="text-white text-center font-semibold tracking-wider"
                  style={{
                    fontSize: isSmallDevice ? 15 : 17,
                  }}
                >
                  {t("auth.continue")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text
              className="text-center text-gray-500 mt-6"
              style={{
                fontSize: isSmallDevice ? 13 : 14,
              }}
            >
              {t("auth.resendCodeIn")}{" "}
              <Text className="text-orange-500 font-semibold">0:53</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}