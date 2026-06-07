import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { getChatSocket } from "../../services/chatSocket";
import {
  searchUsers,
  getMyRooms,
  createRoom,
} from "../../services/chat.service";

const DEFAULT_AVATAR = "https://via.placeholder.com/48";

export default function Message() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;

  const requestIdRef = useRef(0);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingRoomId, setCreatingRoomId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const data = await getMyRooms(token);
      setRooms(data || []);
    } catch (error) {
      console.log("Fetch rooms error:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isFocused && token) {
      fetchRooms();
    }
  }, [isFocused, token, fetchRooms]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = getChatSocket(token);

    const handleRoomUpdated = () => {
      if (isFocused) {
        fetchRooms();
      }
    };

    socket.on("chat:room_updated", handleRoomUpdated);

    return () => {
      socket.off("chat:room_updated", handleRoomUpdated);
    };
  }, [fetchRooms, isFocused, token]);

  useEffect(() => {
    const keyword = search.trim();

    if (!keyword || !token) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    const delayTimer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchUsers(keyword, token);

        if (requestId === requestIdRef.current) {
          setSearchResults(results || []);
        }
      } catch (error) {
        console.log("Search error:", error);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => clearTimeout(delayTimer);
  }, [search, token]);

  const getOtherMember = useCallback(
    (room: any) => {
      return room.members?.find((m: any) => m._id !== user?._id);
    },
    [user?._id]
  );

  const handleSelectUser = useCallback(
    async (selectedUser: any) => {
      if (!token || creatingRoomId) return;

      try {
        setCreatingRoomId(selectedUser._id);

        const room = await createRoom(
          {
            memberIds: [selectedUser._id],
            isGroup: false,
          },
          token
        );

        setSearch("");
        setSearchResults([]);

        navigation.navigate("Chat", {
          roomId: room._id,
          room,
        });
      } catch (error) {
        console.log("Create room error:", error);
      } finally {
        setCreatingRoomId(null);
      }
    },
    [token, navigation, creatingRoomId]
  );

  const handleSelectRoom = useCallback(
    (room: any) => {
      navigation.navigate("Chat", {
        roomId: room._id,
        room,
      });
    },
    [navigation]
  );

  const isShowingSearch = search.trim().length > 0;

  const displayData = useMemo(() => {
    return isShowingSearch ? searchResults : rooms;
  }, [isShowingSearch, searchResults, rooms]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const renderUserItem = useCallback(
    ({ item }: { item: any }) => {
      const isCreating = creatingRoomId === item._id;

      return (
        <TouchableOpacity
          onPress={() => handleSelectUser(item)}
          disabled={isCreating}
          activeOpacity={0.75}
          className="flex-row items-center bg-gray-50 rounded-xl mb-3"
          style={{
            padding: isSmallDevice ? 12 : 16,
          }}
        >
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

          {isCreating ? (
            <ActivityIndicator size="small" color="#FF7A00" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          )}
        </TouchableOpacity>
      );
    },
    [creatingRoomId, handleSelectUser, isSmallDevice]
  );

  const renderRoomItem = useCallback(
    ({ item }: { item: any }) => {
      const otherMember = getOtherMember(item);
      if (!otherMember) return null;

      return (
        <TouchableOpacity
          onPress={() => handleSelectRoom(item)}
          activeOpacity={0.75}
          className="flex-row items-center justify-between bg-gray-50 rounded-xl mb-3"
          style={{
            padding: isSmallDevice ? 12 : 16,
          }}
        >
          <View className="flex-row items-center flex-1">
            <Image
              source={{
                uri: otherMember.avatar || DEFAULT_AVATAR,
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
                {otherMember.name}
              </Text>

              <Text numberOfLines={1} className="text-gray-500 text-xs mt-1">
                {otherMember.email}
              </Text>
            </View>
          </View>

          {item.unreadCount > 0 && (
            <View className="bg-orange-500 rounded-full items-center justify-center mr-3 w-6 h-6">
              <Text className="text-white text-xs font-bold">
                {item.unreadCount > 9 ? "9+" : item.unreadCount}
              </Text>
            </View>
          )}

          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      );
    },
    [getOtherMember, handleSelectRoom, isSmallDevice]
  );

  const renderEmpty = useCallback(() => {
    if (loading || isSearching) return null;

    return (
      <View className="items-center justify-center py-16 px-6">
        <Ionicons
          name={
            isShowingSearch
              ? "search-outline"
              : "chatbubble-ellipses-outline"
          }
          size={52}
          color="#D1D5DB"
        />

        <Text className="text-gray-500 text-center mt-3">
          {isShowingSearch
            ? t("messagePage.noUsersFound")
            : t("messagePage.noConversationsYet")}
        </Text>
      </View>
    );
  }, [loading, isSearching, isShowingSearch, t]);

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
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 30 : 26}
                color="#111"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold flex-1 text-center mx-3"
              style={{
                fontSize: isTablet ? 22 : isSmallDevice ? 17 : 18,
              }}
            >
              {t("messagePage.message")}
            </Text>

            <TouchableOpacity hitSlop={10} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#111" />
            </TouchableOpacity>
          </View>

          <View
            className="flex-row items-center bg-gray-100 rounded-xl px-4 mb-4"
            style={{
              height: isSmallDevice ? 44 : 48,
            }}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />

            <TextInput
              placeholder={
                isShowingSearch
                  ? t("messagePage.findUser")
                  : t("messagePage.findConversation")
              }
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              className="flex-1 ml-2 text-gray-900"
              style={{
                fontSize: isSmallDevice ? 14 : 15,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
              }}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                hitSlop={10}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {(loading || isSearching) && (
            <View className="items-center justify-center py-5">
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          )}

          <FlatList
            data={displayData}
            keyExtractor={(item) => item._id}
            renderItem={isShowingSearch ? renderUserItem : renderRoomItem}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={8}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: Platform.OS === "ios" ? 100 : 80,
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}