import React, { useEffect, useState } from "react";
import { View, Text, Image, TextInput, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, NavigationProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, getMyProfile } from "../../services/user.service";

const INTERESTS = [
  { key: "music", label: "Music" },
  { key: "design", label: "Design" },
  { key: "art", label: "Art" },
  { key: "sports", label: "Sports" },
  { key: "food", label: "Food" },
  { key: "others", label: "Others" },
];

export default function EditProfile() {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const { token, user, refreshUserProfile } = useAuth();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const fetchProfile = async () => {
      try {
        const profile = await getMyProfile(token);
        setName(profile.name || "");
        setCountry(profile.country || "");
        setLocation(profile.location || "");
        setDescription(profile.description || "");
        setAvatar(profile.avatar || "");
        setSelectedInterests(profile.interests || []);
      } catch (error) {
        console.log("Fetch profile error:", error);
      }
    };

    fetchProfile();
  }, [token, user]);

  // Listen for location from SelectLocation
  useEffect(() => {
    const selectedLocation = route.params?.selectedLocation;
    if (selectedLocation) {
      setLocation(selectedLocation);
    }
  }, [route.params?.selectedLocation]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingAvatar(true);
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleInterest = (key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  };

  const handleSaveChanges = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      setLoading(true);
      if (token) {
        await updateProfile(
          {
            name,
            avatar,
            country,
            location,
            description,
            interests: selectedInterests,
          },
          token
        );
        // Refresh user profile in AuthContext
        await refreshUserProfile();
        Alert.alert("Success", "Profile updated successfully");
        navigation.goBack();
      }
    } catch (error: any) {
      console.log("Update error:", error);
      Alert.alert(
        "Update failed",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">Edit Profile</Text>

        <View className="w-6" />
      </View>

      {/* Avatar */}
      <View className="items-center mt-2 mb-6">
        <View className="relative">
          <Image
            source={{ uri: avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
            className="w-24 h-24 rounded-full"
          />
          <TouchableOpacity 
            className="absolute bottom-1 right-1 bg-white p-1 rounded-full"
            onPress={pickImage}
            disabled={uploadingAvatar}
            style={{ opacity: uploadingAvatar ? 0.5 : 1 }}
          >
            <Ionicons 
              name={uploadingAvatar ? "hourglass" : "camera-outline"} 
              size={17} 
              color="#FF7A00" 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Full Name */}
      <Text className="font-medium">Full Name</Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 mt-1 mb-4"
        value={name}
        onChangeText={setName}
        placeholder="Enter your full name"
      />

      {/* Country */}
      <Text className="font-medium">Country</Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 mt-1 mb-4"
        value={country}
        onChangeText={setCountry}
        placeholder="Enter your country"
      />

      {/* Location */}
      <Text className="font-medium">Location</Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("SelectLocation", { fromEditProfile: true })}
      >
        <View className="border border-gray-200 rounded-xl p-3 mt-1 mb-4 flex-row justify-between items-center">
          <Text className={location ? "text-gray-900" : "text-gray-400"}>
            {location || "Tap to select location"}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FF7A00" />
        </View>
      </TouchableOpacity>

      {/* Description */}
      <Text className="font-medium">Description</Text>
      <TextInput
        className="border border-gray-200 rounded-xl p-3 mt-1 mb-6 h-24"
        value={description}
        onChangeText={setDescription}
        placeholder="Tell us about yourself"
        multiline
        textAlignVertical="top"
      />

      {/* Interests */}
      <Text className="font-medium mb-4">Select Your Interests</Text>
      <View className="flex-row flex-wrap justify-between mb-6" style={{ rowGap: 12 }}>
        {INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.key);

          return (
            <TouchableOpacity
              key={interest.key}
              onPress={() => toggleInterest(interest.key)}
              className="w-[48%] items-center"
            >
              <View
                className="w-full h-20 rounded-2xl bg-gray-50 justify-center items-center"
                style={{
                  borderWidth: 2,
                  borderColor: isSelected ? "#F97316" : "#E5E7EB",
                }}
              >
                <Text className="text-center font-medium text-gray-700">
                  {interest.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Save button */}
      <TouchableOpacity 
        className={`${loading ? "opacity-60" : "opacity-100"} bg-black rounded-xl py-4 mb-10`}
        onPress={handleSaveChanges}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text className="text-center text-white font-semibold">
          {loading ? "SAVING..." : "SAVE CHANGES"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
