import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/user.service";

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

export const SelectionCountry = ({ navigation }: any) => {
  const { user, token, login } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>("");
  const [loadingCountries, setLoadingCountries] = useState(true);

  // =============================
  // FETCH COUNTRIES
  // =============================
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadError("");
        setLoadingCountries(true);
        
        // Using v3.1 with fields parameter (v3.1 requires specifying fields)
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
          {
            method: "GET",
            headers: {
              "Accept": "application/json",
            },
          }
        );
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status} ${res.statusText}`);
        }
        
        const json = await res.json();
        
        // Validate that json is an array
        if (!Array.isArray(json)) {
          console.error("Invalid API response: expected array", json);
          setCountries([]);
          setLoadError("Invalid response format. Please try again.");
          return;
        }

        const formatted: Country[] = json
          .map((item) => ({
            name: item.name?.common || "Unknown",
            flag: item.flags?.png || "",
            code: item.cca2 || "",
          }))
          .filter((c) => c.name && c.flag && c.code)
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (error) {
        console.error("Failed to load countries:", error);
        setCountries([]);
        setLoadError("Failed to load countries. Please check your internet connection and try again.");
      } finally {
        setLoadingCountries(false);
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
          editable={countries.length > 0}
        />
      </View>

      {/* ERROR MESSAGE */}
      {loadError && (
        <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <Text className="text-red-700 text-sm mb-3">{loadError}</Text>
          <TouchableOpacity 
            className="bg-red-600 px-4 py-2 rounded-lg"
            onPress={() => {
              setLoadError("");
              // Reload countries
              const fetchCountries = async () => {
                try {
                  setLoadError("");
                  setLoadingCountries(true);
                  const res = await fetch(
                    "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
                    {
                      method: "GET",
                      headers: {
                        "Accept": "application/json",
                      },
                    }
                  );
                  
                  if (!res.ok) {
                    throw new Error(`API error: ${res.status} ${res.statusText}`);
                  }
                  
                  const json = await res.json();
                  
                  if (!Array.isArray(json)) {
                    setLoadError("Invalid response format. Please try again.");
                    return;
                  }

                  const formatted: Country[] = json
                    .map((item) => ({
                      name: item.name?.common || "Unknown",
                      flag: item.flags?.png || "",
                      code: item.cca2 || "",
                    }))
                    .filter((c) => c.name && c.flag && c.code)
                    .sort((a, b) => a.name.localeCompare(b.name));

                  setCountries(formatted);
                } catch (error) {
                  console.error("Failed to load countries:", error);
                  setLoadError("Failed to load countries. Please try again.");
                } finally {
                  setLoadingCountries(false);
                }
              };
              fetchCountries();
            }}
          >
            <Text className="text-white font-semibold text-center">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LOADING STATE */}
      {loadingCountries && !loadError && (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text className="mt-4 text-gray-600">Loading countries...</Text>
        </View>
      )}

      {/* COUNTRY LIST */}
      {!loadingCountries && countries.length > 0 && (
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
                  className="w-8 h-8 rounded-sm mr-2"
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
      )}

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
              
              navigation.navigate("SelectLocation");
            } catch (error) {
              console.error("Error updating country:", error);
              Alert.alert("Error", "Failed to save country. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={!selected || loading}
        >
          <Text className="text-white font-semibold text-lg">{loading ? "SAVING..." : "NEXT"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
