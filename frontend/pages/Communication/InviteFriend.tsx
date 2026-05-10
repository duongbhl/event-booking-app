import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { searchUsers } from "../../services/chat.service";
import { sendInvitation } from "../../services/invite.service";

interface UserWithStatus {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  invited?: boolean;
}

const DEFAULT_AVATAR = "https://via.placeholder.com/48";

export default function InviteFriend() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { token } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;

  const event = route.params?.event;
  const eventId = event?._id || route.params?.eventId;

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!search.trim() || !token) {
      setUsers([]);
      return;
    }

    const delayTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchUsers(search.trim(), token);
        setUsers(results || []);
      } catch (error) {
        console.log("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(delayTimer);
  }, [search, token]);

  const toggleUser = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleInvite = useCallback(async () => {
    if (selectedUsers.length === 0) {
      Alert.alert("Error", "Please select at least one user to invite");
      return;
    }

    if (!eventId) {
      Alert.alert("Error", t("inviteFriend.errorEventNotFound"));
      return;
    }

    if (!token || isSending) return;

    try {
      setIsSending(true);

      await sendInvitation(
        {
          userIds: selectedUsers,
          eventId,
        },
        token
      );

      Alert.alert("Success", t("inviteFriend.invitationsSentSuccessfully"));
      setSelectedUsers([]);
      setSearch("");
      navigation.goBack();
    } catch (error) {
      console.log("Send invitation error:", error);
      Alert.alert("Error", t("inviteFriend.failedToSendInvitations"));
    } finally {
      setIsSending(false);
    }
  }, [selectedUsers, eventId, token, isSending, navigation, t]);

  const data = useMemo(() => users, [users]);

  const renderUser = useCallback(
    ({ item }: { item: UserWithStatus }) => {
      const selected = selectedUsers.includes(item._id);

      return (
        <TouchableOpacity
          onPress={() => toggleUser(item._id)}
          className="flex-row items-center justify-between bg-gray-50 rounded-xl mb-3"
          style={{
            padding: isSmallDevice ? 12 : 16,
          }}
          disabled={isSending}
          activeOpacity={0.75}
        >
          <View className="flex-row items-center flex-1">
            <Image
              source={{
                uri: item.avatar || DEFAULT_AVATAR,
              }}
              className="rounded-full bg-gray-200"
              style={{
                width: isSmallDevice ? 42 : 48,
                height: isSmallDevice ? 42 : 48,
                marginRight: 12,
              }}
            />

            <View className="flex-1">
              <Text
                numberOfLines={1}
                className="font-semibold text-gray-900"
                style={{
                  fontSize: isSmallDevice ? 14 : 16,
                }}
              >
                {item.name}
              </Text>

              <Text numberOfLines={1} className="text-gray-500 text-xs mt-1">
                {item.email}
              </Text>
            </View>
          </View>

          <Ionicons
            name={selected ? "checkmark-circle" : "checkmark-circle-outline"}
            size={24}
            color={selected ? "#FF7A00" : "#CCC"}
          />
        </TouchableOpacity>
      );
    },
    [selectedUsers, toggleUser, isSmallDevice, isSending]
  );

  const emptyComponent = useCallback(() => {
    if (isSearching) return null;

    return (
      <View className="items-center justify-center py-16 px-6">
        <Ionicons name="person-add-outline" size={52} color="#D1D5DB" />

        <Text
          className="text-gray-500 text-center mt-3"
          style={{
            fontSize: isSmallDevice ? 13 : 14,
          }}
        >
          {search.trim()
            ? t("inviteFriend.noUsersFound")
            : t("inviteFriend.searchForUsersToInvite")}
        </Text>
      </View>
    );
  }, [isSearching, search, t, isSmallDevice]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View
          className="flex-1"
          style={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
          }}
        >
          <View className="flex-row items-center justify-between mb-5">
            <TouchableOpacity
              className="p-1"
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 32 : 26}
                color="#111827"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold text-gray-900 flex-1 text-center mx-3"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              }}
            >
              {t("inviteFriend.inviteFriend")}
            </Text>

            <View style={{ width: isTablet ? 32 : 26 }} />
          </View>

          {event && (
            <View className="bg-orange-50 rounded-xl p-3 mb-4">
              <Text
                numberOfLines={1}
                className="font-semibold text-gray-900"
                style={{
                  fontSize: isSmallDevice ? 13 : 14,
                }}
              >
                {event.title}
              </Text>

              <Text numberOfLines={1} className="text-xs text-gray-600 mt-1">
                {event.location}
              </Text>
            </View>
          )}

          <View
            className="flex-row items-center bg-gray-100 rounded-2xl px-4 mb-3"
            style={{
              height: isSmallDevice ? 44 : 48,
            }}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" />

            <TextInput
              placeholder={t("inviteFriend.searchUsers")}
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-gray-900"
              style={{
                fontSize: isSmallDevice ? 14 : 15,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
              }}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isSending}
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch("")}
                hitSlop={10}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {selectedUsers.length > 0 && (
            <Text
              className="text-orange-500 font-semibold mb-3"
              style={{
                fontSize: isSmallDevice ? 12 : 13,
              }}
            >
              {selectedUsers.length} selected
            </Text>
          )}

          {isSearching ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item._id}
              renderItem={renderUser}
              ListEmptyComponent={emptyComponent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              removeClippedSubviews={Platform.OS === "android"}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={8}
              contentContainerStyle={{
                flexGrow: 1,
                paddingBottom:
                  selectedUsers.length > 0
                    ? Platform.OS === "ios"
                      ? 130
                      : 110
                    : Platform.OS === "ios"
                    ? 90
                    : 70,
              }}
            />
          )}
        </View>

        {selectedUsers.length > 0 && (
          <View className="bg-white border-t border-gray-200 p-4">
            <TouchableOpacity
              onPress={handleInvite}
              disabled={isSending}
              className="rounded-xl items-center justify-center"
              activeOpacity={0.85}
              style={{
                height: isSmallDevice ? 48 : 52,
                backgroundColor: isSending ? "#9CA3AF" : "#FF7A00",
              }}
            >
              {isSending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-center">
                  Invite {selectedUsers.length} User
                  {selectedUsers.length !== 1 ? "s" : ""}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}