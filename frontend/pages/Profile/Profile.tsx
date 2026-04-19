import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { getMyProfile, UserProfile } from "../../services/user.service";
import { getMyEvents } from "../../services/event.service";
import { getMyBookmarks, getMyFollowers } from "../../services/bookmark.service";

export default function Profile() {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const { t } = useLocalization();
  const isFocused = useIsFocused();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState(0); // số người bookmark events của mình
  const [following, setFollowing] = useState(0); // số events mình đã bookmark
  const [events, setEvents] = useState(0); // số events mình tạo

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch profile
        const profileData = await getMyProfile(token);
        setProfile(profileData);
        
        // Fetch my events
        const myEvents = await getMyEvents(token);
        setEvents(myEvents.length);
        
        // Fetch my bookmarks (following)
        const myBookmarks = await getMyBookmarks(token);
        setFollowing(myBookmarks.length);
        
        // Fetch followers
        const followersCount = await getMyFollowers(token);
        setFollowers(followersCount);
      } catch (error) {
        console.log("Fetch profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchData();
    }
  }, [token, isFocused]);

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">{t('profile.profile')}</Text>

        {/* ⭐ Edit & Settings buttons */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings" as never)}
          >
            <Ionicons name="settings-outline" size={24} color="#FF7A00" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditProfile" as never)}
          >
            <Ionicons name="create-outline" size={24} color="#FF7A00" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Avatar */}
      <View className="items-center mb-4">
        <View className="relative">
          <Image
            source={{ uri: profile?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
            className="w-28 h-28 rounded-full"
          />
          {/* Badge */}
          <View className="absolute bottom-1 right-1 bg-white rounded-full p-1">
            <Ionicons name="shield-checkmark" size={18} color="#FF7A00" />
          </View>
        </View>

        <Text className="text-lg font-semibold mt-3">{profile?.name}</Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between px-3 mt-4 mb-6">
        <View className="items-center">
          <Text className="text-lg font-bold">{followers}</Text>
          <Text className="text-gray-500 text-xs">{t('profile.followersCount')}</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold">{following}</Text>
          <Text className="text-gray-500 text-xs">{t('profile.followingCount')}</Text>
        </View>

        <View className="items-center">
          <Text className="text-lg font-bold">{events}</Text>
          <Text className="text-gray-500 text-xs">{t('profile.eventsCount')}</Text>
        </View>
      </View>

      {/* About Me */}
      <View className="mb-6">
        <Text className="text-gray-900 font-semibold text-base mb-2">{t('profile.aboutMe')}</Text>

        <Text className="text-gray-600">
          {profile?.description || t('profile.noDescriptionYet')}
        </Text>
      </View>

      {/* Country */}
      {(profile?.country ) && (
        <View className="mb-6">
          <Text className="text-gray-900 font-semibold text-base mb-2">{t('profile.country')}</Text>
          <Text className="text-gray-600">
            {profile?.country && `🌍 ${profile.country}`}
          </Text>
        </View>
      )}

      {/* Interests */}
      {profile?.interests && profile.interests.length > 0 && (
        <View>
          <Text className="text-gray-900 font-semibold text-base mb-3">
            {t('profile.interests')}
          </Text>

          <View className="flex-row flex-wrap gap-2">
            {profile.interests.map((item, i) => (
              <View
                key={i}
                className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full"
              >
                <Ionicons name="pricetag-outline" size={14} color="#FF7A00" />
                <Text className="ml-2 text-gray-800">{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
