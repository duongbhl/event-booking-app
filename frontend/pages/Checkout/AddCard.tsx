import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { addCard } from "../../services/card.service";

export default function AddCard() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();

  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!token) return;

    if (!cardNumber || !expMonth || !expYear) {
      Alert.alert("Missing info");
      return;
    }

    try {
      setLoading(true);
      await addCard(
        {
          cardNumber,
          expMonth: Number(expMonth),
          expYear: Number(expYear),
          isPrimary: save,
        },
        token
      );

      Alert.alert("Success", "Card added successfully");
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to add card"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={26} />
              </TouchableOpacity>
              <Text className="flex-1 text-center text-xl font-semibold mr-6">
                Add New Card
              </Text>
            </View>

            <Text className="text-gray-500 mb-1">Card Number</Text>
            <TextInput
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="0000 0000 0000 0000"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl p-3 mb-4"
              returnKeyType="next"
            />

            <View className="flex-row justify-between mb-4">
              <View className="w-[48%]">
                <Text className="text-gray-500 mb-1">Exp Month</Text>
                <TextInput
                  value={expMonth}
                  onChangeText={setExpMonth}
                  placeholder="MM"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl p-3"
                  returnKeyType="next"
                />
              </View>

              <View className="w-[48%]">
                <Text className="text-gray-500 mb-1">Exp Year</Text>
                <TextInput
                  value={expYear}
                  onChangeText={setExpYear}
                  placeholder="YY"
                  keyboardType="numeric"
                  className="border border-gray-300 rounded-xl p-3"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>
            </View>

            {/* Save Switch */}
            <TouchableOpacity
              className="flex-row items-center my-4"
              onPress={() => setSave(!save)}
            >
              <Ionicons
                name={save ? "checkbox" : "square-outline"}
                size={22}
                color="#FF7A00"
              />
              <Text className="ml-2 text-gray-800">
                Save as primary card
              </Text>
            </TouchableOpacity>

            {/* Add Button */}
            <TouchableOpacity
              className="bg-black py-4 rounded-xl mt-10 items-center"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold">
                  ADD CARD
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
