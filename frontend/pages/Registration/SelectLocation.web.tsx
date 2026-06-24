import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { updateProfile } from "../../services/user.service";

const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
const NOMINATIM_HEADERS = {
  "User-Agent": "EventBookingApp/1.0",
  "Accept-Language": "vi",
};

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function SelectLocationWeb({ navigation, route }: any) {
  const isFromEditProfile = route?.params?.fromEditProfile || false;
  const isFromAddEvent = route?.params?.fromAddEvent || false;
  const returnToRoute = route?.params?.returnToRoute || "CreateEditEvent";
  const onSelectLocation = route?.params?.onSelectLocation as
    | ((value: string) => void)
    | undefined;
  const { user, token, login } = useAuth();
  const { t } = useLocalization();
  const [query, setQuery] = useState("");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initialLocation = route?.params?.selectedLocation;
    if (initialLocation) {
      setQuery(initialLocation);
      setSelectedPlaceName(initialLocation);
    }
  }, [route?.params?.selectedLocation]);

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    setSelectedPlaceName("");

    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const encodedText = encodeURIComponent(text);
      const url =
        `${NOMINATIM_BASE_URL}/search?format=json` +
        `&q=${encodedText}` +
        `&countrycodes=vn` +
        `&limit=8` +
        `&addressdetails=1` +
        `&accept-language=vi`;

      const res = await fetch(url, { headers: NOMINATIM_HEADERS });
      const json = await res.json();
      setSuggestions(Array.isArray(json) ? json : []);
    } catch (error) {
      console.log("Nominatim search error:", error);
      setSuggestions([]);
    }
  };

  const selectPlace = (place: Suggestion) => {
    setSelectedPlaceName(place.display_name);
    setQuery(place.display_name);
    setSuggestions([]);
  };

  const handleSave = async () => {
    const finalLocation = (selectedPlaceName || query).trim();

    if (!finalLocation) {
      Alert.alert(t("common.error"), t("selectLocation.searchNewAddress"));
      return;
    }

    if (isFromAddEvent && onSelectLocation) {
      onSelectLocation(finalLocation);
      navigation.navigate(returnToRoute, { selectedLocation: finalLocation });
      return;
    }

    if (isFromEditProfile) {
      navigation.navigate("EditProfile", { selectedLocation: finalLocation });
      return;
    }

    if (!user || !token) {
      Alert.alert(t("common.error"), t("auth.loginFailed"));
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateProfile(user._id, { location: finalLocation }, token);
      login(updatedUser, token);
      navigation.navigate("SelectInterest");
    } catch (error) {
      Alert.alert(t("common.error"), t("selectLocation.failedToSaveLocation"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
      <View className="px-5 pt-4 pb-6">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white rounded-2xl h-12 w-12 items-center justify-center border border-gray-200"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <Text className="ml-3 text-xl font-semibold text-gray-900">
            {t("selectLocation.selectLocation")}
          </Text>
        </View>

        <View className="mt-5 rounded-3xl bg-white border border-gray-200 p-5">
          <Text className="text-gray-900 text-lg font-semibold">
            {t("selectLocation.searchNewAddress")}
          </Text>
          <Text className="mt-2 text-sm text-gray-500">
            Ban web demo khong hien ban do. Nguoi dung co the tim dia chi va luu truc tiep.
          </Text>

          <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 px-4 h-14">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={fetchSuggestions}
              placeholder={t("selectLocation.searchNewAddress")}
              className="ml-3 flex-1 text-gray-900"
            />
          </View>

          {suggestions.length > 0 && (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => String(item.place_id)}
              className="mt-4 max-h-72"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectPlace(item)}
                  className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 mb-3"
                >
                  <Text className="text-gray-900">{item.display_name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {!!selectedPlaceName && (
            <View className="mt-4 rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3">
              <Text className="text-orange-700 font-medium">
                Dia chi da chon
              </Text>
              <Text className="text-orange-900 mt-1">{selectedPlaceName}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="mt-6 h-14 rounded-full bg-[#FF6B00] items-center justify-center"
          >
            <Text className="text-white text-lg font-semibold">
              {saving ? t("common.loading") : t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
