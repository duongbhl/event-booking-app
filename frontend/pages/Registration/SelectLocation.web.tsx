import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import type { LeafletMouseEvent, Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
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

type LeafletModule = typeof import("leaflet");

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface RegionState {
  latitude: number;
  longitude: number;
  zoom: number;
}

export default function SelectLocationWeb({ navigation, route }: any) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const isFromEditProfile = route?.params?.fromEditProfile || false;
  const isFromAddEvent = route?.params?.fromAddEvent || false;
  const onSelectLocation = route?.params?.onSelectLocation as
    | ((value: string) => void)
    | undefined;
  const { user, token, login } = useAuth();
  const { t } = useLocalization();
  const [query, setQuery] = useState("");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<RegionState>({
    latitude: DEFAULT_COORDINATE.latitude,
    longitude: DEFAULT_COORDINATE.longitude,
    zoom: 17,
  });
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const markerHtml = useMemo(
    () =>
      `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#f97316;box-shadow:0 12px 28px rgba(15,23,42,.28);border:3px solid white;">
        <div style="width:10px;height:10px;border-radius:9999px;background:white;"></div>
      </div>`,
    []
  );

  useEffect(() => {
    const initialLocation = route?.params?.selectedLocation;
    if (initialLocation) {
      setQuery(initialLocation);
      setSelectedPlaceName(initialLocation);
    }
  }, [route?.params?.selectedLocation]);

  useEffect(() => {
    let cancelled = false;

    const setupMap = async () => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const L = await import("leaflet");
      leafletRef.current = L;

      const styleId = "leaflet-web-styles";
      if (!document.getElementById(styleId)) {
        const link = document.createElement("link");
        link.id = styleId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(
        [DEFAULT_COORDINATE.latitude, DEFAULT_COORDINATE.longitude],
        region.zoom
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const icon = L.divIcon({
        html: markerHtml,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(
        [DEFAULT_COORDINATE.latitude, DEFAULT_COORDINATE.longitude],
        { icon, draggable: false }
      ).addTo(map);

      map.on("click", (event: LeafletMouseEvent) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        setRegion((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          zoom: map.getZoom(),
        }));
        setSelectedPlaceName("");
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        marker.setLatLng(center);
        setRegion({
          latitude: center.lat,
          longitude: center.lng,
          zoom: map.getZoom(),
        });
      });

      if (!cancelled) {
        mapRef.current = map;
        markerRef.current = marker;
      } else {
        map.remove();
      }
    };

    setupMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [markerHtml, region.zoom]);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setMyLocation({ latitude: lat, longitude: lng });
        setRegion({
          latitude: lat,
          longitude: lng,
          zoom: 17,
        });

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lng], 17, { animate: true });
          markerRef.current.setLatLng([lat, lng]);
        }
      },
      (error) => {
        console.log("Location error:", error);
      },
      {
        enableHighAccuracy: true,
      }
    );
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

  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    setSelectedPlaceName("");

    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

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
        setSuggestions([]);
        return;
      }

      setSuggestions(json);
    } catch (error) {
      console.log("Nominatim search error:", error);
      setSuggestions([]);
    }
  };

  const selectPlace = (place: Suggestion) => {
    const lat = Number(place.lat);
    const lng = Number(place.lon);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return;
    }

    setSelectedPlaceName(place.display_name);
    setQuery(place.display_name);
    setSuggestions([]);
    setRegion((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      zoom: 17,
    }));

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 17, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const focusMyLocation = () => {
    if (!myLocation || !mapRef.current || !markerRef.current) {
      return;
    }

    const { latitude, longitude } = myLocation;
    setRegion((prev) => ({
      ...prev,
      latitude,
      longitude,
      zoom: 17,
    }));

    mapRef.current.setView([latitude, longitude], 17, { animate: true });
    markerRef.current.setLatLng([latitude, longitude]);
  };

  const handleSave = async () => {
    const locationName =
      selectedPlaceName ||
      (await reverseGeocode(region.latitude, region.longitude));

    if (isFromEditProfile) {
      navigation.navigate({
        name: "EditProfile",
        params: { selectedLocation: locationName },
        merge: true,
      });
      return;
    }

    if (isFromAddEvent) {
      onSelectLocation?.(locationName);
      if (navigation.canGoBack?.()) {
        navigation.goBack();
      }
      return;
    }

    if (!user || !token) {
      return;
    }

    try {
      setLoading(true);
      const updatedUser = await updateProfile({ location: locationName }, token);
      await login(updatedUser, token);

      const nextRoute = getOnboardingRoute({
        ...updatedUser,
        location: locationName,
      });

      navigation.navigate(nextRoute as never);
    } catch (error) {
      console.error("Error updating location:", error);
      Alert.alert(t("common.error"), t("selectLocation.failedToSaveLocation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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

        <TouchableOpacity
          onPress={focusMyLocation}
          className="absolute right-4 top-[120px] bg-white w-12 h-12 rounded-full shadow items-center justify-center"
        >
          <Ionicons name="locate" size={26} color="#F97316" />
        </TouchableOpacity>

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

      <View
        ref={(node) => {
          mapContainerRef.current = node as HTMLDivElement | null;
        }}
        style={{ width: "100%", height: "100%" }}
      />

      <View className="absolute bottom-10 w-full px-6">
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <LinearGradient
            colors={["#383838", "#121212"]}
            className="justify-center items-center"
            style={{ height: 56, borderRadius: 28 }}
          >
            <Text className="text-white text-center mt-5 text-lg font-semibold">
              {loading
                ? t("selectLocation.saving")
                : isFromEditProfile || isFromAddEvent
                ? t("selectLocation.add")
                : t("selectLocation.next")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
