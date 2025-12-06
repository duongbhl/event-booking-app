import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUpScreen() {
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity className="p-1">
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
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4" style={{ height: 52 }}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your full name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Email */}
        <View className="mt-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4" style={{ height: 52 }}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        {/* Password */}
        <View className="mt-5">
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4" style={{ height: 52 }}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass1}
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
          <View className="flex-row items-center bg-gray-100 rounded-xl px-4" style={{ height: 52 }}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-base text-gray-900"
              placeholder="Type your confirm password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPass2}
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

        {/* SIGN UP Button */}
        <TouchableOpacity className="mt-8">
          <LinearGradient
            colors={["#383838", "#121212"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="justify-center items-center"
            style={{
              height: 56,
              borderRadius: 28,
            }}
          >
            <Text className="text-white text-center mt-4 text-lg font-semibold tracking-wider">
              SIGN UP
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center mt-10 mb-4">
          <View className="flex-1 h-[1px] bg-gray-300" />
          <Text className="mx-3 text-gray-500">or continue with</Text>
          <View className="flex-1 h-[1px] bg-gray-300" />
        </View>

        {/* Social buttons */}
        <View className="flex-row justify-center" style={{ gap: 16 }}>
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
          <TouchableOpacity>
            <Text className="text-orange-500 font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}