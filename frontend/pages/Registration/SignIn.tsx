import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { login } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";

export default function SignIn() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login: saveAuth } = useAuth();

  const inputHeight = isSmallDevice ? 50 : 54;
  const iconSize = isSmallDevice ? 19 : 21;
  const socialButtonSize = isSmallDevice ? 54 : 64;
  const socialIconSize = isSmallDevice ? 28 : 32;

  const isValid = useMemo(() => {
    return email.trim().length > 0 && password.trim().length > 0;
  }, [email, password]);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const data = await login({
        email: email.trim(),
        password,
      });

      await saveAuth(
        {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          country: data.country,
          interests: data.interests,
          location: data.location,
          avatar: data.avatar,
        },
        data.token
      );

      if (data.role === "admin") {
        navigation.reset({
          index: 0,
          routes: [{ name: "Admin" }],
        });
        return;
      }

      const hasCountry = data.country && data.country.trim() !== "";
      const hasInterests =
        data.interests &&
        Array.isArray(data.interests) &&
        data.interests.length > 0;
      const hasLocation = data.location && data.location.trim() !== "";

      if (hasCountry && hasInterests && hasLocation) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Drawer" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "SelectCountry" }],
        });
      }
    } catch (error: any) {
      console.log("LOGIN ERROR:", error?.response?.data);

      Alert.alert(
        "Login failed",
        error?.response?.data?.message || "Invalid credentials"
      );
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, saveAuth, navigation]);

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
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
              className="p-2"
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
              {t("auth.signIn")}
            </Text>

            <Text
              className="text-center text-gray-500"
              style={{
                marginTop: 8,
                fontSize: isSmallDevice ? 13 : 14,
              }}
            >
              {t("auth.giveCredential")}
            </Text>

            <View style={{ marginTop: isSmallDevice ? 28 : 34 }}>
              <Text
                className="text-gray-600 mb-2"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {t("auth.email")}
              </Text>

              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons name="mail-outline" size={iconSize} color="#999" />

                <TextInput
                  placeholder={t("auth.typeYourEmail")}
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 flex-1 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  returnKeyType="next"
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mt-5">
              <Text
                className="text-gray-600 mb-2"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {t("auth.password")}
              </Text>

              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={iconSize}
                  color="#999"
                />

                <TextInput
                  placeholder={t("auth.typeYourPassword")}
                  placeholderTextColor="#9CA3AF"
                  className="ml-3 flex-1 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  autoComplete="password"
                  returnKeyType="done"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  onSubmitEditing={handleSignIn}
                />

                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row items-center flex-1">
                <Switch
                  value={remember}
                  onValueChange={setRemember}
                  thumbColor={remember ? "#f97316" : "#fff"}
                  trackColor={{ true: "#fcae74", false: "#ccc" }}
                  disabled={loading}
                />

                <Text
                  numberOfLines={1}
                  className="ml-2 text-gray-600 flex-1"
                  style={{ fontSize: isSmallDevice ? 12 : 14 }}
                >
                  {t("auth.rememberMe")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => navigation.navigate("ResetPassword")}
                hitSlop={10}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text
                  className="text-orange-500 font-medium"
                  style={{ fontSize: isSmallDevice ? 12 : 14 }}
                >
                  {t("auth.forgotPassword")}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-8"
              onPress={handleSignIn}
              disabled={loading || !isValid}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#383838", "#121212"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  height: isSmallDevice ? 52 : 56,
                  borderRadius: 28,
                  opacity: loading || !isValid ? 0.55 : 1,
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
                      lineHeight: isSmallDevice ? 20 : 22,
                      includeFontPadding: false,
                      textAlignVertical: "center",
                    }}
                  >
                    {t("auth.signIn").toUpperCase()}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View className="flex-row items-center mt-10 mb-4">
              <View className="flex-1 h-[1px] bg-gray-300" />

              <Text
                numberOfLines={1}
                className="mx-3 text-gray-500"
                style={{ fontSize: isSmallDevice ? 12 : 14 }}
              >
                {t("auth.orContinueWith")}
              </Text>

              <View className="flex-1 h-[1px] bg-gray-300" />
            </View>

            <View className="flex-row justify-center" style={{ gap: 16 }}>
              <TouchableOpacity
                activeOpacity={0.75}
                className="bg-gray-100 rounded-2xl items-center justify-center"
                style={{
                  width: socialButtonSize,
                  height: socialButtonSize,
                }}
              >
                <FontAwesome
                  name="facebook"
                  size={socialIconSize}
                  color="#1877F2"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                className="bg-gray-100 rounded-2xl items-center justify-center"
                style={{
                  width: socialButtonSize,
                  height: socialButtonSize,
                }}
              >
                <FontAwesome
                  name="google"
                  size={socialIconSize}
                  color="#DB4437"
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.75}
                className="bg-gray-100 rounded-2xl items-center justify-center"
                style={{
                  width: socialButtonSize,
                  height: socialButtonSize,
                }}
              >
                <FontAwesome
                  name="apple"
                  size={socialIconSize}
                  color="black"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-10 flex-wrap px-2">
              <Text
                className="text-gray-500"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {t("auth.dontHaveAccount")}{" "}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("SignUp")}
                hitSlop={10}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text
                  className="text-orange-500 font-semibold"
                  style={{ fontSize: isSmallDevice ? 13 : 14 }}
                >
                  {t("auth.signUp")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}