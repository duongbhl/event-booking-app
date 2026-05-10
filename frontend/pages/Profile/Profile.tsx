import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { getMyProfile, UserProfile } from "../../services/user.service";
import { getMyEvents } from "../../services/event.service";
import {
  getMyBookmarks,
  getMyFollowers,
} from "../../services/bookmark.service";

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

export default function Profile() {
  const navigation = useNavigation<any>();
  const { token } = useAuth();
  const { t } = useLocalization();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const avatarSize = isTablet ? 132 : isSmallDevice ? 96 : 112;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [events, setEvents] = useState(0);

  const fetchData = useCallback(
    async (silent?: boolean) => {
      if (!token) return;

      try {
        if (!silent) setLoading(true);

        const profileData = await getMyProfile(token);
        const myEvents = await getMyEvents(token);
        const myBookmarks = await getMyBookmarks(token);
        const followersCount = await getMyFollowers(token);

        setProfile(profileData);
        setEvents(myEvents.length);
        setFollowing(myBookmarks.length);
        setFollowers(followersCount);
      } catch (error) {
        console.log("Fetch profile error:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isFocused) {
      fetchData();
    }
  }, [isFocused, fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#FF7A00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
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
            {t("profile.profile")}
          </Text>

          <View className="flex-row" style={{ gap: isSmallDevice ? 8 : 12 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings" as never)}
              hitSlop={10}
              activeOpacity={0.7}
            >
              {/* <Ionicons
                name="settings-outline"
                size={isTablet ? 28 : 24}
                color="#FF7A00"
              /> */}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("EditProfile" as never)}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Ionicons
                name="create-outline"
                size={isTablet ? 28 : 24}
                color="#FF7A00"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center mb-5">
          <View className="relative">
            <Image
              source={{ uri: profile?.avatar || DEFAULT_AVATAR }}
              className="rounded-full bg-gray-200"
              style={{
                width: avatarSize,
                height: avatarSize,
              }}
            />

            <View className="absolute bottom-1 right-1 bg-white rounded-full p-1">
              <Ionicons
                name="shield-checkmark"
                size={isSmallDevice ? 17 : 19}
                color="#FF7A00"
              />
            </View>
          </View>

          <Text
            numberOfLines={1}
            className="font-semibold mt-3 text-gray-900"
            style={{
              fontSize: isTablet ? 22 : isSmallDevice ? 17 : 18,
            }}
          >
            {profile?.name || "User"}
          </Text>
        </View>

        <View
          className="flex-row justify-between bg-gray-50 rounded-2xl px-3 py-4 mb-6"
          style={{ gap: 8 }}
        >
          <StatItem
            value={followers}
            label={t("profile.followersCount")}
            isSmallDevice={isSmallDevice}
          />

          <StatItem
            value={following}
            label={t("profile.followingCount")}
            isSmallDevice={isSmallDevice}
          />

          <StatItem
            value={events}
            label={t("profile.eventsCount")}
            isSmallDevice={isSmallDevice}
          />
        </View>

        <InfoSection
          title={t("profile.aboutMe")}
          value={profile?.description || t("profile.noDescriptionYet")}
          isSmallDevice={isSmallDevice}
        />

        {profile?.country ? (
          <InfoSection
            title={t("profile.country")}
            value={`🌍 ${profile.country}`}
            isSmallDevice={isSmallDevice}
          />
        ) : null}

        {profile?.interests && profile.interests.length > 0 ? (
          <View className="mb-6">
            <Text
              className="text-gray-900 font-semibold mb-3"
              style={{
                fontSize: isSmallDevice ? 15 : 16,
              }}
            >
              {t("profile.interests")}
            </Text>

            <View className="flex-row flex-wrap" style={{ gap: 10 }}>
              {profile.interests.map((interest) => (
                <View
                  key={interest}
                  className="bg-orange-50 rounded-full px-4 py-2"
                >
                  <Text
                    className="text-orange-500 font-semibold"
                    style={{ fontSize: isSmallDevice ? 12 : 13 }}
                  >
                    {interest}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({
  value,
  label,
  isSmallDevice,
}: {
  value: number;
  label: string;
  isSmallDevice: boolean;
}) {
  return (
    <View className="items-center flex-1">
      <Text
        className="font-bold text-gray-900"
        style={{
          fontSize: isSmallDevice ? 16 : 18,
        }}
      >
        {value}
      </Text>

      <Text
        numberOfLines={1}
        className="text-gray-500 mt-1"
        style={{
          fontSize: isSmallDevice ? 10 : 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function InfoSection({
  title,
  value,
  isSmallDevice,
}: {
  title: string;
  value: string;
  isSmallDevice: boolean;
}) {
  return (
    <View className="mb-6">
      <Text
        className="text-gray-900 font-semibold mb-2"
        style={{
          fontSize: isSmallDevice ? 15 : 16,
        }}
      >
        {title}
      </Text>

      <Text
        className="text-gray-600 leading-6"
        style={{
          fontSize: isSmallDevice ? 13 : 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}