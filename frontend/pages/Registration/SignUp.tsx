import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";

export default function SignUp({ navigation }: any) {
  const { t } = useLocalization();
  const { login: saveAuth } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputHeight = isSmallDevice ? 50 : 54;
  const iconSize = isSmallDevice ? 19 : 21;
  const socialButtonSize = isSmallDevice ? 54 : 64;
  const socialIconSize = isSmallDevice ? 28 : 32;

  const isValid = useMemo(() => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0
    );
  }, [name, email, password, confirmPassword]);

  const handleSignUp = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      await saveAuth(
        {
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          avatar: data.avatar,
          country: data.country,
          interests: data.interests,
          location: data.location,
          description: data.description,
        },
        data.token
      );

      navigation.reset({
        index: 0,
        routes: [{ name: "SelectCountry" }],
      });
    } catch (error: any) {
      console.log(error?.response?.data?.message || error.message);

      Alert.alert(
        "Register failed",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [name, email, password, confirmPassword, loading, navigation]);

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
              {t("auth.signUp")}
            </Text>

            <Text
              className="text-center text-gray-500"
              style={{
                marginTop: 8,
                fontSize: isSmallDevice ? 13 : 14,
              }}
            >
              {t("auth.createAccountSubtitle")}
            </Text>

            <View style={{ marginTop: isSmallDevice ? 28 : 34 }}>
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons
                  name="person-outline"
                  size={iconSize}
                  color="#9CA3AF"
                />

                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  placeholder={t("auth.typeYourFullName")}
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                  autoCorrect={false}
                  returnKeyType="next"
                  editable={!loading}
                />
              </View>
            </View>

            <View className="mt-5">
              <View
                className="flex-row items-center bg-gray-100 rounded-xl px-4"
                style={{ height: inputHeight }}
              >
                <Ionicons name="mail-outline" size={iconSize} color="#9CA3AF" />

                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  placeholder={t("auth.typeYourEmail")}
                  placeholderTextColor="#9CA3AF"
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
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  placeholder={t("auth.typeYourPassword")}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPass1}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="next"
                  editable={!loading}
                />

                <TouchableOpacity
                  onPress={() => setShowPass1((prev) => !prev)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPass1 ? "eye-off-outline" : "eye-outline"}
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
                  className="flex-1 ml-3 text-gray-900"
                  style={{
                    fontSize: isSmallDevice ? 14 : 15,
                    paddingVertical: Platform.OS === "ios" ? 10 : 6,
                  }}
                  placeholder={t("auth.confirmYourPassword")}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPass2}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="done"
                  editable={!loading}
                  onSubmitEditing={handleSignUp}
                />

                <TouchableOpacity
                  onPress={() => setShowPass2((prev) => !prev)}
                  hitSlop={10}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={showPass2 ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              className="mt-8"
              onPress={handleSignUp}
              disabled={loading || !isValid}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={["#383838", "#121212"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="justify-center items-center"
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
                    style={{ fontSize: isSmallDevice ? 15 : 17 }}
                  >
                    {t("auth.signUp").toUpperCase()}
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
                className="bg-gray-100 rounded-2xl justify-center items-center"
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
                className="bg-gray-100 rounded-2xl justify-center items-center"
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
                className="bg-gray-100 rounded-2xl justify-center items-center"
                style={{
                  width: socialButtonSize,
                  height: socialButtonSize,
                }}
              >
                <FontAwesome
                  name="apple"
                  size={socialIconSize}
                  color="#000"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-10 flex-wrap px-2">
              <Text
                className="text-gray-500"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {t("auth.alreadyHaveAccount")}{" "}
              </Text>

              <TouchableOpacity
                onPress={() => navigation.navigate("SignIn")}
                hitSlop={10}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text
                  className="text-orange-500 font-semibold"
                  style={{ fontSize: isSmallDevice ? 13 : 14 }}
                >
                  {t("auth.signIn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}