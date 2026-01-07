import React, { useEffect, useState } from 'react';
import { 
  Text, 
  View, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Location = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const eventAddress = route.params?.address || '';
  const eventTitle = route.params?.title || 'Event';
  
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock locations database
  const COMMON_LOCATIONS = [
    { id: 1, address: 'Times Square, New York, NY, USA', city: 'New York' },
    { id: 2, address: 'Golden Gate Park, San Francisco, CA, USA', city: 'San Francisco' },
    { id: 3, address: 'Central Park, Manhattan, NY, USA', city: 'Manhattan' },
    { id: 4, address: 'Santa Monica Pier, Los Angeles, CA, USA', city: 'Los Angeles' },
    { id: 5, address: 'Navy Pier, Chicago, IL, USA', city: 'Chicago' },
    { id: 6, address: 'Las Vegas Strip, Las Vegas, NV, USA', city: 'Las Vegas' },
  ];

  const filteredLocations = search.trim() 
    ? COMMON_LOCATIONS.filter(loc =>
        loc.address.toLowerCase().includes(search.toLowerCase()) ||
        loc.city.toLowerCase().includes(search.toLowerCase())
      )
    : COMMON_LOCATIONS;

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
  };

  const handleViewDirection = async () => {
    if (!selectedLocation) {
      alert('Please select a location first');
      return;
    }

    // In a real app, you would use react-native-maps or similar
    // and calculate the route between selectedLocation and eventAddress
    // For now, just show an alert with the route info
    
    alert(
      `Directions\n\nFrom: ${selectedLocation.address}\nTo: ${eventAddress}\n\n` +
      'In production, this would show directions using Google Maps or Apple Maps'
    );

    // If you want to close the location picker and go back:
    // navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#111" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">{eventTitle}</Text>
        <View className="w-8" />
      </View>

      {/* Event Address Display */}
      {eventAddress && (
        <View className="bg-orange-50 mx-4 mt-4 rounded-xl p-4">
          <Text className="text-sm font-semibold text-gray-600 mb-1">Event Location</Text>
          <Text className="text-gray-900 font-semibold">{eventAddress}</Text>
        </View>
      )}

      {/* Search Bar */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 h-12">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Search starting location..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-gray-900"
          />
          {search && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Locations List */}
      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : filteredLocations.length > 0 ? (
          filteredLocations.map((location) => (
            <TouchableOpacity
              key={location.id}
              onPress={() => handleSelectLocation(location)}
              className={`flex-row items-center rounded-xl p-4 mb-3 border-2 ${
                selectedLocation?.id === location.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">
                  {location.city}
                </Text>
                <Text className="text-gray-600 text-xs mt-1">
                  {location.address}
                </Text>
              </View>
              {selectedLocation?.id === location.id && (
                <Ionicons name="checkmark-circle" size={24} color="#FF7A00" />
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500">No locations found</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Direction Button */}
      {selectedLocation && (
        <View className="px-4 pb-6 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleViewDirection}
            className="bg-orange-500 rounded-2xl py-4 flex-row items-center justify-center mt-4"
          >
            <Ionicons name="navigate-outline" size={22} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Location;