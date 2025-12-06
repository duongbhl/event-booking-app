import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function Verification() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputs = [
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
    useRef<TextInput | null>(null),
  ];

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputs[index + 1].current?.focus();
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
        <View className="flex-row items-center justify-between mt-10">
          <TouchableOpacity className="p-1">
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        {/* Title */}
        <Text className="text-3xl font-semibold text-center mt-4 text-gray-900">
          Verification
        </Text>

        {/* Description */}
        <Text className="text-center text-gray-500 mt-3 leading-5">
          We’ve send you the verification code on{"\n"}
          <Text className="font-semibold text-gray-900">+1 6358 9248 5789</Text>
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-center mt-10" style={{ gap: 16 }}>
          {otp.map((digit, i) => (
            <View
              key={i}
              className="rounded-2xl justify-center items-center"
              style={{
                width: 60,
                height: 64,
                borderWidth: 1.5,
                borderColor: digit ? "#F97316" : "#E5E7EB",
              }}
            >
              <TextInput
                ref={inputs[i]}
                className="text-center text-xl font-semibold text-gray-900"
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(value, i)}
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
          ))}
        </View>

        {/* CONTINUE Button */}
        <TouchableOpacity className="mt-10">
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
              CONTINUE
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Countdown */}
        <Text className="text-center text-gray-500 mt-6">
          Re-send code in{" "}
          <Text className="text-orange-500 font-semibold">0:53</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
