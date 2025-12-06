import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Camera } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";



const GOOGLE_KEY = "YOUR_GOOGLE_API_KEY";

interface Suggestion {
  place_id: string;
  description: string;
}

export default function SelectLocationScreen() {
  const mapRef = useRef<MapView | null>(null);
  const sessionToken = useRef(Crypto.randomUUID()).current;
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [region, setRegion] = useState({
    latitude: 10.762622,
    longitude: 106.660172,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  });

  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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

  // ===============================
  // 📍 GỢI Ý TÌM KIẾM ĐỊA CHỈ
  // ===============================
  const fetchSuggestions = async (text: string) => {
    setQuery(text);

    if (text.length < 2) return setSuggestions([]);

    const encodedText = encodeURIComponent(text);

    let currentPos = myLocation || { latitude: 10.7626, longitude: 106.6601 };

    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodedText}` +
      `&key=${GOOGLE_KEY}` +
      `&language=vi` +
      `&components=country:vn` +
      `&location=${currentPos.latitude},${currentPos.longitude}` +
      `&radius=20000` + // 20 km
      `&sessiontoken=${sessionToken}`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== "OK") {
        console.log("AutoComplete Error:", json.status);
        setSuggestions([]);
        return;
      }

      setSuggestions(json.predictions || []);
    } catch (error) {
      console.log("AutoComplete Error:", error);
    }
  };


  // ===============================
  // 📍 CHỌN 1 ĐỊA ĐIỂM TRONG GỢI Ý
  // ===============================
  const selectPlace = async (placeId: string) => {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=geometry,name,formatted_address` +
      `&key=${GOOGLE_KEY}` +
      `&sessiontoken=${sessionToken}`;

    const res = await fetch(url);
    const json = await res.json();

    if (!json.result || !json.result.geometry) return;

    const { lat, lng } = json.result.geometry.location;

    setRegion((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));

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
        <View className="flex-row items-center bg-white rounded-xl h-12 px-4 shadow">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={query}
            onChangeText={fetchSuggestions}
            placeholder="Search new address..."
            className="ml-2 flex-1"
          />
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
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => selectPlace(item.place_id)}
                className="p-3 border-b border-gray-200"
              >
                <Text>{item.description}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "100%" }}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        showsUserLocation
        showsMyLocationButton={false}
      />

      {/* FIXED CENTER MARKER */}
      <View className="absolute top-[42%] left-[50%] -ml-4 -mt-8">
        <Ionicons name="location" size={40} color="#F97316" />
      </View>

      {/* ADD BUTTON */}
      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity onPress={() => console.log("Selected:", region)}>
          <LinearGradient
            colors={["#383838", "#121212"]}
            className="justify-center items-center"
            style={{ height: 56, borderRadius: 28 }}
          >
            <Text className="text-white text-center mt-5 text-lg font-semibold">ADD</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

