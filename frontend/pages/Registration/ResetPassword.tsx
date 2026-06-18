import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalization } from "../../context/LocalizationContext";
import { useNavigation } from "@react-navigation/native";
import {
  forgotPassword,
  resetPassword as submitResetPassword,
} from "../../services/auth.service";

export default function ResetPassword() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);

  const inputHeight = isSmallDevice ? 50 : 54;
  const iconSize = isSmallDevice ? 19 : 21;

  const isValid = useMemo(() => {
    return (
      email.trim().length > 0 &&
      code.trim().length >= 4 &&
      newPassword.length >= 6 &&
      confirmPassword.length >= 6
    );
  }, [email, code, newPassword, confirmPassword]);

  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Error", t("auth.enterEmailFirst"));
      return;
    }

    if (sendingCode) return;

    try {
      setSendingCode(true);
      const response = await forgotPassword({ email: normalizedEmail });
      const alertMessage = response.resetCode
        ? `${response.message}\n\nReset code: ${response.resetCode}`
        : response.message;

      Alert.alert(t("common.success"), alertMessage);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.response?.data?.message || t("errors.serverError")
      );
    } finally {
      setSendingCode(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !code.trim() || !newPassword || !confirmPassword) {
      Alert.alert("Error", t("auth.fillAllResetFields"));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", t("errors.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", t("errors.passwordMismatch"));
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const response = await submitResetPassword({
        email: normalizedEmail,
        code: code.trim(),
        newPassword,
      });

      Alert.alert(t("common.success"), response.message, [
        {
          text: "OK",
          onPress: () => navigation.navigate("SignIn"),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error?.response?.data?.message || t("errors.serverError")
      );
    } finally {
      setLoading(false);
    }
  };

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
              {t("auth.resetPassword")}
            </Text>

            <Text
              className="text-center text-gray-500 leading-5"
              style={{
                marginTop: 10,
                fontSize: isSmallDevice ? 13 : 14,
              }}
            >
              {t("auth.resetPasswordSubtitle")}
            </Text>

            <View style={{ marginTop: isSmallDevice ? 28 : 34 }}>
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="mail-outline"
                  size={iconSize}
                  color="#9CA3AF"
                />

                <TextInput
                  placeholder={t("auth.typeYourEmail")}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  editable={!loading && !sendingCode}
                />
              </View>
            </View>

            <TouchableOpacity
              className="mt-4 self-end"
              onPress={handleSendCode}
              disabled={loading || sendingCode}
              activeOpacity={0.7}
            >
              <Text className="text-orange-500 font-medium">
                {sendingCode ? t("auth.sendingCode") : t("auth.sendResetCode")}
              </Text>
            </TouchableOpacity>

            <View className="mt-5">
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="key-outline"
                  size={iconSize}
                  color="#9CA3AF"
                />

                <TextInput
                  placeholder={t("auth.enterResetCode")}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  returnKeyType="next"
                  value={code}
                  onChangeText={(value) =>
                    setCode(value.replace(/[^0-9]/g, "").slice(0, 6))
                  }
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mt-5">
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={iconSize}
                  color="#9CA3AF"
                />

                <TextInput
                  placeholder={t("auth.newPassword")}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showNewPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setShowNewPass((prev) => !prev)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showNewPass ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-5">
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={iconSize}
                  color="#9CA3AF"
                />

                <TextInput
                  placeholder={t("auth.confirmNewPassword")}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPass}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setShowConfirmPass((prev) => !prev)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showConfirmPass ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="mt-8"
              activeOpacity={0.8}
              disabled={!isValid || loading}
              onPress={handleResetPassword}
            >
              <LinearGradient
                colors={["#383838", "#121212"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="justify-center items-center"
                style={{
                    height: isSmallDevice ? 52 : 56,
                    borderRadius: 28,
                    opacity: isValid && !loading ? 1 : 0.5,
                    justifyContent: "center",
                    alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    className="text-white text-center font-semibold tracking-wider"
                    style={{
                      fontSize: isSmallDevice ? 15 : 17,
                    }}
                  >
                    {t("auth.send")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
