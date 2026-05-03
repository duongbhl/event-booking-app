import React from "react";
import { View, Text, Image, TouchableOpacity} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalization } from "../../context/LocalizationContext";

export default function ScanCard() {
  const { t } = useLocalization();
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} />
      </TouchableOpacity>

      <Text className="text-xl font-semibold text-center mt-4">
        {t('booking.scanCard')}
      </Text>

      <Text className="text-center text-gray-500 mt-2 mb-6">
        {t('booking.pleaseHoldCard')}
      </Text>

      <View className="items-center">
        <Image
          source={{ uri: "https://i.imgur.com/2nCt3Sb.png" }}
          className="w-72 h-44 rounded-2xl"
        />
      </View>

      <TouchableOpacity className="bg-black py-4 rounded-xl mt-10">
        <Text className="text-white text-center">{t('booking.scanning')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
