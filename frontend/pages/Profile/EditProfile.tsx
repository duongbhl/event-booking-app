import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  NavigationProp,
} from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { updateProfile, getMyProfile } from "../../services/user.service";

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

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
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const avatarSize = isTablet ? 120 : isSmallDevice ? 92 : 104;
  const inputHeight = isSmallDevice ? 48 : 52;

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [avatar, setAvatar] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!token || !user) return;

    const fetchProfile = async () => {
      try {
        setFetching(true);

        const profile = await getMyProfile(token);

        setName(profile.name || "");
        setCountry(profile.country || "");
        setDescription(profile.description || "");
        setAvatar(profile.avatar || "");
        setSelectedInterests(profile.interests || []);
      } catch (error) {
        console.log("Fetch profile error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  useEffect(() => {
    const selectedCountry = route.params?.selectedCountry;

    if (selectedCountry) {
      setCountry(selectedCountry);
    }
  }, [route.params?.selectedCountry]);

  const pickImage = useCallback(async () => {
    try {
      setUploadingAvatar(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setUploadingAvatar(false);
    }
  }, []);

  const toggleInterest = useCallback((key: string) => {
    setSelectedInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );
  }, []);

  const handleSaveChanges = useCallback(async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    if (!token || loading) return;

    try {
      setLoading(true);

      await updateProfile(
        {
          name: name.trim(),
          avatar,
          country,
          description,
          interests: selectedInterests,
        },
        token
      );

      await refreshUserProfile();

      Alert.alert("Success", "Profile updated successfully");
      navigation.goBack();
    } catch (error: any) {
      console.log("Update error:", error);

      Alert.alert(
        "Update failed",
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [
    name,
    token,
    loading,
    avatar,
    country,
    description,
    selectedInterests,
    refreshUserProfile,
    navigation,
  ]);

  if (fetching) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF7A00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
            paddingBottom: Platform.OS === "ios" ? 120 : 90,
          }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
              className="p-1"
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 32 : 26}
                color="black"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold flex-1 text-center mx-3"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              }}
            >
              Edit Profile
            </Text>

            <View style={{ width: isTablet ? 32 : 26 }} />
          </View>

          <View className="items-center mt-1 mb-6">
            <View className="relative">
              <Image
                source={{ uri: avatar || DEFAULT_AVATAR }}
                className="rounded-full bg-gray-200"
                style={{
                  width: avatarSize,
                  height: avatarSize,
                }}
              />

              <TouchableOpacity
                className="absolute bottom-1 right-1 bg-white rounded-full items-center justify-center"
                onPress={pickImage}
                disabled={uploadingAvatar}
                activeOpacity={0.75}
                style={{
                  width: isSmallDevice ? 30 : 34,
                  height: isSmallDevice ? 30 : 34,
                  opacity: uploadingAvatar ? 0.5 : 1,
                }}
              >
                <Ionicons
                  name={uploadingAvatar ? "hourglass" : "camera-outline"}
                  size={isSmallDevice ? 17 : 19}
                  color="#FF7A00"
                />
              </TouchableOpacity>
            </View>
          </View>

          <InputLabel label="Full Name" isSmallDevice={isSmallDevice} />

          <View
            className="border border-gray-200 rounded-xl px-4 justify-center mt-1 mb-4"
            style={{ height: inputHeight }}
          >
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              className="text-gray-900"
              style={{
                fontSize: isSmallDevice ? 14 : 15,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
              }}
              autoCorrect={false}
              returnKeyType="next"
              editable={!loading}
            />
          </View>

          <InputLabel label="Country" isSmallDevice={isSmallDevice} />

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SelectCountry", { fromEditProfile: true })
            }
            disabled={loading}
            activeOpacity={0.75}
          >
            <View
              className="border border-gray-200 rounded-xl px-4 mt-1 mb-4 flex-row justify-between items-center"
              style={{ height: inputHeight }}
            >
              <Text
                numberOfLines={1}
                className={country ? "text-gray-900 flex-1" : "text-gray-400 flex-1"}
                style={{
                  fontSize: isSmallDevice ? 14 : 15,
                }}
              >
                {country || "Tap to select country"}
              </Text>

              <Ionicons name="chevron-forward" size={20} color="#FF7A00" />
            </View>
          </TouchableOpacity>

          <InputLabel label="Description" isSmallDevice={isSmallDevice} />

          <View className="border border-gray-200 rounded-xl px-4 py-3 mt-1 mb-6">
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell us about yourself"
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              className="text-gray-900"
              style={{
                minHeight: isSmallDevice ? 82 : 96,
                fontSize: isSmallDevice ? 14 : 15,
              }}
              editable={!loading}
            />
          </View>

          <Text
            className="font-medium mb-4 text-gray-900"
            style={{ fontSize: isSmallDevice ? 14 : 15 }}
          >
            Select Your Interests
          </Text>

          <View
            className="flex-row flex-wrap justify-between mb-6"
            style={{ rowGap: isSmallDevice ? 10 : 12 }}
          >
            {INTERESTS.map((interest) => {
              const isSelected = selectedInterests.includes(interest.key);

              return (
                <TouchableOpacity
                  key={interest.key}
                  onPress={() => toggleInterest(interest.key)}
                  className="items-center"
                  style={{ width: "48%" }}
                  activeOpacity={0.75}
                  disabled={loading}
                >
                  <View
                    className="w-full rounded-2xl bg-gray-50 justify-center items-center px-2"
                    style={{
                      height: isSmallDevice ? 70 : 80,
                      borderWidth: 2,
                      borderColor: isSelected ? "#F97316" : "#E5E7EB",
                    }}
                  >
                    <Text
                      numberOfLines={1}
                      className="text-center font-medium text-gray-700"
                      style={{
                        fontSize: isSmallDevice ? 13 : 14,
                      }}
                    >
                      {interest.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            className="bg-black rounded-xl justify-center items-center"
            onPress={handleSaveChanges}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              height: isSmallDevice ? 50 : 54,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-center text-white font-semibold">
                SAVE CHANGES
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputLabel({
  label,
  isSmallDevice,
}: {
  label: string;
  isSmallDevice: boolean;
}) {
  return (
    <Text
      className="font-medium text-gray-900"
      style={{ fontSize: isSmallDevice ? 14 : 15 }}
    >
      {label}
    </Text>
  );
}