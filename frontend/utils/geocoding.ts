/**
 * Geocoding utilities for converting between coordinates and addresses
 */

const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_API_KEY"; // Replace with your actual API key

/**
 * Convert latitude/longitude coordinates to human-readable address
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise with formatted address string
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?latlng=${latitude},${longitude}` +
      `&key=${GOOGLE_MAPS_API_KEY}` +
      `&language=vi`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.log("Reverse geocode error:", error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * Convert address text to latitude/longitude coordinates
 * @param address - Address string to geocode
 * @returns Promise with coordinates {latitude, longitude}
 */
export const geocodeAddress = async (
  address: string
): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url =
      `https://maps.googleapis.com/maps/api/geocode/json` +
      `?address=${encodedAddress}` +
      `&key=${GOOGLE_MAPS_API_KEY}` +
      `&language=vi`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }

    return null;
  } catch (error) {
    console.log("Geocode address error:", error);
    return null;
  }
};

/**
 * Open Google Maps directions between two locations
 * @param fromLat - Starting latitude
 * @param fromLng - Starting longitude
 * @param toLat - Destination latitude
 * @param toLng - Destination longitude
 * @param transport - Transport mode (driving, walking, transit, bicycling)
 */
export const openGoogleMapsDirections = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  transport: "driving" | "walking" | "transit" | "bicycling" = "driving"
) => {
  const mapsUrl =
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${fromLat},${fromLng}` +
    `&destination=${toLat},${toLng}` +
    `&travelmode=${transport}`;

  // For mobile, use intent scheme (Android) or app scheme (iOS)
  const mobileUrl = `com.google.maps://maps.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=${transport}`;

  return { mapsUrl, mobileUrl };
};

/**
 * Calculate distance between two coordinates (in km) using Haversine formula
 * @param lat1 - First latitude
 * @param lon1 - First longitude
 * @param lat2 - Second latitude
 * @param lon2 - Second longitude
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};
