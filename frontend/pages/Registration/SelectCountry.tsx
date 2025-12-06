import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// =============================
// TYPES
// =============================
export interface CountryApiResponse {
  name: {
    common: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  cca2: string;
}

interface Country {
  name: string;
  flag: string;
  code: string;
}

// =============================
// COMPONENT
// =============================

export const CountrySelection = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string>("");

  // =============================
  // FETCH COUNTRIES
  // =============================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("https://restcountries.com/v3.1/all");
        const json: CountryApiResponse[] = await res.json();

        const formatted: Country[] = json
          .map((item) => ({
            name: item.name.common,
            flag: item.flags.png,
            code: item.cca2,
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (error) {
        console.error("Failed to load countries:", error);
      }
    };

    fetchCountries();
  }, []);

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
        <TouchableOpacity>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text className="text-lg font-semibold">Country Selection</Text>

        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12 mb-4">
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          placeholder="Find Conversation"
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
                <Image
                  source={{ uri: country.flag }}
                  className="w-8 h-8 rounded-sm"
                />
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
        <TouchableOpacity className="bg-black py-4 rounded-2xl items-center">
          <Text className="text-white font-semibold text-lg">SAVE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
