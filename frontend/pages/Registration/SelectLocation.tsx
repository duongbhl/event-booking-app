import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Camera, UrlTile } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "../../services/user.service";
import { useLocalization } from "../../context/LocalizationContext";
import { getOnboardingRoute } from "../../utils/onboarding";


const DEFAULT_COORDINATE = {
  latitude: 10.762622,
  longitude: 106.660172,
};

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

export default function SelectLocation({ navigation, route }: any) {
  const mapRef = useRef<MapView | null>(null);
  const isFromEditProfile = route?.params?.fromEditProfile || false;
  const isFromAddEvent = route?.params?.fromAddEvent || false;
  const returnToRoute = route?.params?.returnToRoute || "CreateEditEvent";
  const onSelectLocation = route?.params?.onSelectLocation as
    | ((value: string) => void)
    | undefined;
  const { user, token, login } = useAuth();
  const { t } = useLocalization();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: DEFAULT_COORDINATE.latitude,
    longitude: DEFAULT_COORDINATE.longitude,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const initialLocation = route?.params?.selectedLocation;

    if (initialLocation) {
      setQuery(initialLocation);
      setSelectedPlaceName(initialLocation);
    }
  }, [route?.params?.selectedLocation]);

  // ===============================
  // 📍 LẤY VỊ TRÍ CHÍNH XÁC NHẤT
  // ===============================
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        const lat = current.coords.latitude;
        const lng = current.coords.longitude;

        setMyLocation({ latitude: lat, longitude: lng });

        setRegion((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        }));

        mapRef.current?.animateCamera(
          {
            center: { latitude: lat, longitude: lng },
            zoom: 17,
          } as Camera,
          { duration: 800 }
        );
      } catch (error) {
        console.log("Location error:", error);
      }
    })();
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    const url =
      `${NOMINATIM_BASE_URL}/reverse?format=json` +
      `&lat=${latitude}` +
      `&lon=${longitude}` +
      `&zoom=18` +
      `&addressdetails=1` +
      `&accept-language=vi`;

    try {
      const res = await fetch(url, { headers: NOMINATIM_HEADERS });
      const json = await res.json();

      return json.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    } catch (error) {
      console.log("Reverse geocode error:", error);
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    }
  };

  // ===============================
  // 📍 GỢI Ý TÌM KIẾM ĐỊA CHỈ
  // ===============================
  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    setSelectedPlaceName("");

    if (text.length < 2) return setSuggestions([]);

    const encodedText = encodeURIComponent(text);

    const url =
      `${NOMINATIM_BASE_URL}/search?format=json` +
      `&q=${encodedText}` +
      `&countrycodes=vn` +
      `&limit=8` +
      `&addressdetails=1` +
      `&accept-language=vi`;

    try {
      const res = await fetch(url, { headers: NOMINATIM_HEADERS });
      const json = await res.json();

      if (!Array.isArray(json)) {
        console.log("Nominatim search error:", json);
        setSuggestions([]);
        return;
      }

      setSuggestions(json);
    } catch (error) {
      console.log("Nominatim search error:", error);
    }
  };


  // ===============================
  // 📍 CHỌN 1 ĐỊA ĐIỂM TRONG GỢI Ý
  // ===============================
  const selectPlace = async (place: Suggestion) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    setRegion((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

    setSelectedPlaceName(place.display_name);
    setQuery(place.display_name);

    mapRef.current?.animateCamera(
      {
        center: { latitude: lat, longitude: lng },
        zoom: 17,
      },
      { duration: 800 }
    );

    setSuggestions([]);
  };


  // ===============================
  // 📍 NÚT "ĐỊNH VỊ TÔI"
  // ===============================
  const focusMyLocation = () => {
    if (!myLocation || !mapRef.current) return;

    const { latitude, longitude } = myLocation;

    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
    }));

    mapRef.current.animateCamera(
      {
        center: { latitude, longitude },
        zoom: 17,
      },
      { duration: 800 }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* SEARCH */}
      <View className="absolute z-50 w-full px-4 top-3 mt-10">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack?.()) {
                navigation.goBack();
              }
            }}
            className="bg-white rounded-xl h-12 w-12 shadow items-center justify-center"
            activeOpacity={0.75}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View className="flex-1 flex-row items-center bg-white rounded-xl h-12 px-4 ml-3 shadow">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={fetchSuggestions}
              placeholder={t("selectLocation.searchNewAddress")}
              className="ml-2 flex-1"
            />
          </View>
        </View>

        {/* LOCATE ME BUTTON */}
        <TouchableOpacity
          onPress={focusMyLocation}
          className="absolute right-4 top-[120px] bg-white w-12 h-12 rounded-full shadow items-center justify-center"
          style={{ elevation: 8 }}
        >
          <Ionicons name="locate" size={26} color="#F97316" />
        </TouchableOpacity>

        {/* AUTOCOMPLETE LIST */}
        {suggestions.length > 0 && (
          <FlatList
            className="bg-white rounded-xl mt-2 shadow"
            data={suggestions}
            keyExtractor={(item) => String(item.place_id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectPlace(item)}
                className="p-3 border-b border-gray-200"
              >
                <Text>{item.display_name}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        mapType="none"
        region={region}
        onRegionChangeComplete={(r) => {
          setRegion(r);
          setSelectedPlaceName("");
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </MapView>

      {/* FIXED CENTER MARKER */}
      <View className="absolute top-[42%] left-[50%] -ml-4 -mt-8">
        <Ionicons name="location" size={40} color="#F97316" />
      </View>

      {/* ADD BUTTON */}
      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity 
          onPress={async () => {
            const locationName =
              selectedPlaceName ||
              (await reverseGeocode(region.latitude, region.longitude));
            
            if (isFromEditProfile) {
              // Return location to EditProfile and update it
              navigation.navigate({
                name: "EditProfile",
                params: { selectedLocation: locationName },
                merge: true,
              });
            } else if (isFromAddEvent) {
              onSelectLocation?.(locationName);

              if (navigation.canGoBack?.()) {
                navigation.goBack();
              }
            } else {
              // Save location to backend
              if (!user || !token) return;
              
              try {
                setLoading(true);
                await updateProfile({ location: locationName }, token);
                
                // Update local auth context
                if (user) {
                  await login({ ...user, location: locationName }, token);
                }
                
                const nextRoute = getOnboardingRoute({
                  ...user,
                  location: locationName,
                });

                navigation.navigate(nextRoute as never);
              } catch (error) {
                console.error("Error updating location:", error);
                Alert.alert(t("common.error"), t("selectLocation.failedToSaveLocation"));
              } finally {
                setLoading(false);
              }
            }
          }}
          disabled={loading}
        >
          <LinearGradient
            colors={["#383838", "#121212"]}
            className="justify-center items-center"
            style={{ height: 56, borderRadius: 28 }}
          >
            <Text className="text-white text-center mt-5 text-lg font-semibold">
              {loading
                ? t("selectLocation.saving")
                : (isFromEditProfile || isFromAddEvent ? t("selectLocation.add") : t("selectLocation.next"))}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}
