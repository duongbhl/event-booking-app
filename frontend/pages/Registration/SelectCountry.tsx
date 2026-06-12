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
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/user.service";
import { getOnboardingRoute } from "../../utils/onboarding";
import { COUNTRIES, getFlagEmoji } from "../../constants/countries";

// =============================
// TYPES
// =============================
interface Country {
  name: string;
  code: string;
}

// =============================
// COMPONENT
// =============================

export const SelectionCountry = ({ navigation, route }: any) => {
  const { t } = useLocalization();
  const { user, token, login } = useAuth();
  const isFromEditProfile = route?.params?.fromEditProfile || false;
  const [countries] = useState<Country[]>(COUNTRIES);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // =============================
  // FILTERED LIST
  // =============================
  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-4 pt-4">
      {/* HEADER */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">{t('selectCountry.countrySelection')}</Text>

        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mb-4">
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder={t('selectCountry.findCountry')}
          placeholderTextColor="#9CA3AF"
          className="flex-1 ml-2"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* COUNTRY LIST */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {filtered.map((country) => {
          const isActive = selected === country.name;

          return (
            <TouchableOpacity
              key={country.code}
              onPress={() => setSelected(country.name)}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              {/* Flag + Name */}
              <View className="flex-row items-center space-x-3">
                <Text className="mr-2 text-2xl">{getFlagEmoji(country.code)}</Text>
                <Text className="text-gray-800 text-[16px]">{country.name}</Text>
              </View>

              {/* Radio Button */}
              {isActive ? (
                <View className="w-6 h-6 rounded-full bg-orange-500 items-center justify-center">
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              ) : (
                <View className="w-6 h-6 rounded-full border border-gray-300" />
              )}
            </TouchableOpacity>
          );
        })}

        <View className="h-24" />
      </ScrollView>

      {/* SAVE BUTTON */}
      <View className="absolute bottom-6 left-0 right-0 px-6">
        <TouchableOpacity 
          className="bg-black py-4 rounded-2xl items-center"
          onPress={async () => {
            if (!selected || !user || !token) return;
            
            try {
              setLoading(true);
              await updateProfile({ country: selected }, token);
              
              // Update local auth context
              if (user) {
                await login({ ...user, country: selected }, token);
              }
              
              if (isFromEditProfile) {
                // Return country to EditProfile and update it
                navigation.goBack();
                navigation.navigate("EditProfile", {
                  selectedCountry: selected,
                });
              } else {
                const nextRoute = getOnboardingRoute({
                  ...user,
                  country: selected,
                });

                navigation.navigate(nextRoute as never);
              }
            } catch (error) {
              console.error("Error updating country:", error);
              Alert.alert("Error", t('selectCountry.failedToSaveCountry'));
            } finally {
              setLoading(false);
            }
          }}
          disabled={!selected || loading}
        >
          <Text className="text-white font-semibold text-lg">{loading ? t('selectCountry.saving') : (isFromEditProfile ? t('selectCountry.add') : t('selectCountry.next'))}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
