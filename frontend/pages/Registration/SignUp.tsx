import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { register } from "../../services/auth.service";


export default function SignUp({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const data = await register({
        name,
        email,
        password,
      });

      // Save token to AsyncStorage
      await AsyncStorage.setItem("token", data.token);
      
      Alert.alert("Success", "Account created successfully");

      // Navigate to SelectCountry
      navigation.navigate("SelectCountry");

    } catch (error: any) {
      console.log(error?.response?.data.message || error.message);
      Alert.alert(
        "Register failed",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        {/* Title */}
        <Text className="text-3xl font-semibold text-center mt-4 text-gray-900">
          Sign up
        </Text>
        <Text className="text-center text-gray-500 mt-2">
          Create account and enjoy all services
        </Text>

        {/* Full Name */}
        <View className="mt-8">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-[52px]">
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your full name"
              placeholderTextColor="#9CA3AF"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        {/* Email */}
        <View className="mt-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-[52px]">
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Password */}
        <View className="mt-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-[52px]">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass1}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass1(!showPass1)}>
              <Ionicons
                name={showPass1 ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mt-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-[52px]">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Confirm your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass2}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowPass2(!showPass2)}>
              <Ionicons
                name={showPass2 ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          className="mt-8"
          onPress={handleSignUp}
          disabled={loading}
        >
          <LinearGradient
            colors={["#383838", "#121212"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="justify-center items-center"
            style={{ height: 56, borderRadius: 28 }}
          >
            <Text className="text-white text-center mt-4 text-lg font-semibold tracking-wider">
              {loading ? "LOADING..." : "SIGN UP"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mt-10 mb-4">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500">or continue with</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Social */}
        <View className="flex-row justify-center gap-4">
          <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl justify-center items-center">
            <FontAwesome name="facebook" size={32} color="#1877F2" />
          </TouchableOpacity>
          <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl justify-center items-center">
            <FontAwesome name="google" size={32} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity className="w-16 h-16 bg-gray-100 rounded-2xl justify-center items-center">
            <FontAwesome name="apple" size={32} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-gray-500">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
            <Text className="text-orange-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
