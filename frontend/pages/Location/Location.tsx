import React, { useEffect, useState, useRef } from 'react';
import { 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Camera, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { reverseGeocode, calculateDistance } from '../../utils/geocoding';

const GOOGLE_KEY = "YOUR_GOOGLE_API_KEY";

interface Suggestion {
  place_id: string;
  description: string;
}

const LocationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mapRef = useRef<MapView | null>(null);
  const sessionToken = useRef(Crypto.randomUUID()).current;
  
  const eventAddress = route.params?.address || '';
  const eventTitle = route.params?.title || 'Event';
  const eventCoordinates = route.params?.coordinates || null; // {latitude, longitude}
  
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [myLocation, setMyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: eventCoordinates?.latitude || 10.762622,
    longitude: eventCoordinates?.longitude || 106.660172,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [distance, setDistance] = useState<number | null>(null);

  // Get user's current location on mount
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

        // Calculate distance to event if event coordinates exist
        if (eventCoordinates) {
          const dist = calculateDistance(
            lat,
            lng,
            eventCoordinates.latitude,
            eventCoordinates.longitude
          );
          setDistance(dist);
        }
      } catch (error) {
        console.log("Location error:", error);
      }
    })();
  }, []);

  // Animate to event location when coordinates are available
  useEffect(() => {
    if (eventCoordinates && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: eventCoordinates.latitude,
            longitude: eventCoordinates.longitude,
          },
          zoom: 15,
        } as Camera,
        { duration: 1000 }
      );
    }
  }, [eventCoordinates]);

  // Fetch search suggestions
  const fetchSuggestions = async (text: string) => {
    setSearch(text);

    if (text.length < 2) return setSuggestions([]);

    const encodedText = encodeURIComponent(text);
    let currentPos = myLocation || { latitude: 10.7626, longitude: 106.6601 };

    const url =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodedText}` +
      `&key=${GOOGLE_KEY}` +
      `&language=vi` +
      `&location=${currentPos.latitude},${currentPos.longitude}` +
      `&radius=20000` +
      `&sessiontoken=${sessionToken}`;

    try {
      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== "OK") {
        setSuggestions([]);
        return;
      }

      setSuggestions(json.predictions || []);
    } catch (error) {
      console.log("AutoComplete Error:", error);
    }
  };

  // Select a place from suggestions
  const selectPlace = async (placeId: string, placeName?: string) => {
    const url =
      `https://maps.googleapis.com/maps/api/place/details/json` +
      `?place_id=${placeId}` +
      `&fields=geometry,name,formatted_address` +
      `&key=${GOOGLE_KEY}` +
      `&sessiontoken=${sessionToken}`;

    try {
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
          zoom: 15,
        },
        { duration: 800 }
      );

      setSuggestions([]);
      setSearch('');
    } catch (error) {
      console.log("Select place error:", error);
    }
  };

  // Open directions in Google Maps
  const handleGetDirections = async () => {
    if (!myLocation || !eventCoordinates) {
      Alert.alert("Error", "Location information not available");
      return;
    }

    const mapsUrl =
      `https://www.google.com/maps/dir/?api=1` +
      `&origin=${myLocation.latitude},${myLocation.longitude}` +
      `&destination=${eventCoordinates.latitude},${eventCoordinates.longitude}` +
      `&travelmode=driving`;

    try {
      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to web Google Maps
        const webUrl =
          `https://maps.google.com/?q=${eventCoordinates.latitude},${eventCoordinates.longitude}`;
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open maps application");
      console.log("Open maps error:", error);
    }
  };

  // Focus on user location

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
        zoom: 15,
      },
      { duration: 800 }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER WITH BACK BUTTON */}
      <View className="flex-row items-center justify-between  border-b border-gray-200 bg-white ml-2 p-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">{eventTitle}</Text>
        <View className="w-8" />
      </View>

      {/* MAP */}
      <MapView
        ref={mapRef}
        style={{ width: "100%", height: "60%" }}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Event marker */}
        {eventCoordinates && (
          <Marker
            coordinate={{
              latitude: eventCoordinates.latitude,
              longitude: eventCoordinates.longitude,
            }}
            title={eventTitle}
            description={eventAddress}
            pinColor="#FF7A00"
          />
        )}

        {/* User location marker */}
        {myLocation && (
          <Marker
            coordinate={myLocation}
            title="Your Location"
            pinColor="#3b82f6"
          />
        )}
      </MapView>

      {/* Locate button */}
 

      {/* Search bar */}


      {/* Event and Distance Info */}
      <View className="bg-white px-4 pt-4 border-t border-gray-200">
        {eventAddress && (
          <View className="bg-orange-50 rounded-xl p-4 mb-3">
            <Text className="text-sm font-semibold text-gray-600 mb-1">
              📍 Event Location
            </Text>
            <Text className="text-gray-900 font-semibold text-sm">
              {eventAddress}
            </Text>
            {distance !== null && (
              <Text className="text-orange-600 text-xs mt-2 font-medium">
                📏 {distance} km from your location
              </Text>
            )}
          </View>
        )}

        {/* Get Directions Button */}
        {eventCoordinates && myLocation && (
          <TouchableOpacity
            onPress={handleGetDirections}
            className="bg-orange-500 rounded-xl py-3 flex-row items-center justify-center mb-4"
          >
            <Ionicons name="navigate" size={20} color="white" />
            <Text className="text-white text-base font-semibold ml-2">
              Get Directions
            </Text>
          </TouchableOpacity>
        )}

        <View className="h-4" />
      </View>
    </SafeAreaView>
  );
};

export default LocationScreen;