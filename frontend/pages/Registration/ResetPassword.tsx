import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function ResetPassword() {
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {/* Back + Spacer */}
        <View className="flex-row items-center justify-between mt-2">
          <TouchableOpacity className="p-1">
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        {/* Title */}
        <Text className="text-3xl font-semibold text-center mt-4 text-gray-900">
          Reset Password
        </Text>

        {/* Subtitle */}
        <Text className="text-center text-gray-500 mt-2 leading-5">
          Please enter your email address to request a{"\n"}
          password reset
        </Text>

        {/* Email */}
        <View className="mt-8">
          <View
            className="flex-row items-center bg-gray-100 rounded-xl px-4"
            style={{ height: 52 }}
          >
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Type your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              className="flex-1 ml-3 text-gray-900"
            />
          </View>
        </View>

        {/* New Password */}
        <View className="mt-5">
          <View
            className="flex-row items-center bg-gray-100 rounded-xl px-4"
            style={{ height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showNewPass}
              className="flex-1 ml-3 text-gray-900"
            />

            <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)}>
              <Ionicons
                name={showNewPass ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View className="mt-5">
          <View
            className="flex-row items-center bg-gray-100 rounded-xl px-4"
            style={{ height: 52 }}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={!showConfirmPass}
              className="flex-1 ml-3 text-gray-900"
            />

            <TouchableOpacity
              onPress={() => setShowConfirmPass(!showConfirmPass)}
            >
              <Ionicons
                name={showConfirmPass ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* SEND Button */}
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
            <Text className="text-white text-center mt-5 text-lg font-semibold tracking-wider">
              SEND
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
