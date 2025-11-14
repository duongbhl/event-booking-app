import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";

const GOOGLE_KEY = "YOUR_GOOGLE_API_KEY";

interface Suggestion {
  place_id: string;
  description: string;
}

export default function SelectLocationScreen() {
  const mapRef = useRef<MapView | null>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [region, setRegion] = useState({
    latitude: 10.762622, // Việt Nam default
    longitude: 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);


  // 📍 GET REAL GPS LOCATION
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let current = await Location.getCurrentPositionAsync({});
      setRegion({
        ...region,
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let current = await Location.getCurrentPositionAsync({});
      const lat = current.coords.latitude;
      const lng = current.coords.longitude;

      setMyLocation({ latitude: lat, longitude: lng });

      setRegion({
        ...region,
        latitude: lat,
        longitude: lng,
      });

      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        800
      );
    })();
  }, []);


  // 📍 fetch suggestions
  const fetchSuggestions = async (text: string) => {
    setQuery(text);

    if (text.length < 2) return setSuggestions([]);

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${GOOGLE_KEY}&language=en&components=country:vn`
    );
    const json = await res.json();
    setSuggestions(json.predictions || []);
  };

  // 📍 when user selects an address
  const selectPlace = async (placeId: string) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_KEY}`
    );
    const json = await res.json();

    const { lat, lng } = json.result.geometry.location;

    setRegion({
      ...region,
      latitude: lat,
      longitude: lng,
    });

    mapRef.current?.animateToRegion(
      {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      800
    );

    setSuggestions([]);
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
          onPress={() => {
            if (myLocation) {
              mapRef.current?.animateToRegion(
                {
                  latitude: myLocation.latitude,
                  longitude: myLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                },
                800
              );
            }
          }}
          className="absolute right-4 top-[120px] bg-white w-12 h-12 rounded-full shadow items-center justify-center"
          style={{ elevation: 8 }}
        >
          <Ionicons name="locate" size={26} color="#F97316" />
        </TouchableOpacity>


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
      />

      {/* CENTER MARKER (FIXED) */}
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
