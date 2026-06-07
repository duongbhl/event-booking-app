import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { useAuth } from "../../context/AuthContext";
import { getChatSocket } from "../../services/chatSocket";
import {
  getMessages,
  sendMessage,
  markRoomAsRead,
} from "../../services/chat.service";

const DEFAULT_AVATAR = "https://via.placeholder.com/48";

export default function Chat() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, token } = useAuth();
  const isFocused = useIsFocused();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const roomId = route.params?.roomId;
  const initialRoom = route.params?.room;

  const listRef = useRef<FlatList<any>>(null);
  const requestIdRef = useRef(0);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const otherMember = useMemo(() => {
    return initialRoom?.members?.find((m: any) => m._id !== user?._id);
  }, [initialRoom, user?._id]);

  const appendMessage = useCallback((message: any) => {
    setMessages((prev) => {
      const exists = prev.some((item) => String(item._id) === String(message._id));
      const next = exists
        ? prev.map((item) =>
            String(item._id) === String(message._id) ? message : item
          )
        : [...prev, message];

      return next.sort(
        (a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  const fetchMessages = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!roomId || !token) return;

      const requestId = ++requestIdRef.current;

      try {
        if (!options?.silent) {
          setLoading(true);
        }

        const data = await getMessages(roomId, token);
        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        if (requestId !== requestIdRef.current) {
          return;
        }

        setMessages(sorted);
        await markRoomAsRead(roomId, token);
      } catch (error) {
        console.log("Fetch messages error:", error);
      } finally {
        if (!options?.silent && requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [roomId, token]
  );

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (!roomId || !token) {
      return;
    }

    const socket = getChatSocket(token);

    const handleNewMessage = ({ roomId: incomingRoomId, message }: any) => {
      if (String(incomingRoomId) !== String(roomId) || !message) {
        return;
      }

      appendMessage(message);

      if (String(message.sender?._id) !== String(user?._id)) {
        markRoomAsRead(roomId, token).catch((error) => {
          console.log("Mark room as read error:", error);
        });
      }
    };

    socket.emit("chat:join_room", roomId);
    socket.on("chat:new_message", handleNewMessage);

    fetchMessages();

    return () => {
      socket.off("chat:new_message", handleNewMessage);
      socket.emit("chat:leave_room", roomId);
    };
  }, [appendMessage, fetchMessages, isFocused, roomId, token, user?._id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  }, [messages.length]);

  const handleSendMessage = useCallback(async () => {
    const content = input.trim();

    if (!content || !roomId || !token || sending) return;

    try {
      setSending(true);
      setInput("");

      const newMessage = await sendMessage(
        roomId,
        { content, type: "text" },
        token
      );

      appendMessage(newMessage);
    } catch (error) {
      console.log("Send message error:", error);
      setInput(content);
    } finally {
      setSending(false);
    }
  }, [appendMessage, input, roomId, token, sending]);

  const renderMessage = useCallback(
    ({ item }: { item: any }) => {
      const isOwnMessage = String(item.sender?._id) === user?._id;

      const isSeen =
        item.readBy &&
        item.readBy.some((reader: any) => {
          if (typeof reader === "string") {
            return reader === otherMember?._id;
          }

          return String(reader._id) === otherMember?._id;
        });

      return (
        <View style={{ marginBottom: 14 }}>
          <Text
            className={`text-xs text-gray-400 mb-1 ${
              isOwnMessage ? "text-right" : "text-left"
            }`}
          >
            {new Date(item.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          <View
            className={`flex-row items-end ${
              isOwnMessage ? "self-end" : "self-start"
            }`}
          >
            <View
              className={`px-4 py-2 rounded-2xl ${
                isOwnMessage
                  ? "bg-orange-500 rounded-br-none"
                  : "bg-gray-100 rounded-bl-none"
              }`}
              style={{
                maxWidth: isTablet ? "65%" : "80%",
              }}
            >
              <Text
                className={isOwnMessage ? "text-white" : "text-gray-800"}
                style={{
                  fontSize: isSmallDevice ? 14 : 15,
                  lineHeight: isSmallDevice ? 19 : 21,
                }}
              >
                {item.content}
              </Text>
            </View>

            {isOwnMessage && isSeen && otherMember && (
              <View className="ml-2 flex-row items-center">
                <Image
                  source={{
                    uri: otherMember.avatar || DEFAULT_AVATAR,
                  }}
                  className="rounded-full"
                  style={{
                    width: isSmallDevice ? 20 : 24,
                    height: isSmallDevice ? 20 : 24,
                  }}
                />
                <View className="w-3 h-3 rounded-full bg-green-500 -ml-1 -mb-1 border border-white" />
              </View>
            )}
          </View>
        </View>
      );
    },
    [user?._id, otherMember, isSmallDevice, isTablet]
  );

  const emptyComponent = useCallback(() => {
    return (
      <View className="items-center justify-center py-20 px-6">
        <Ionicons name="chatbubble-ellipses-outline" size={52} color="#D1D5DB" />
        <Text className="text-center text-gray-400 text-sm mt-3">
          No messages yet. Start the conversation!
        </Text>
      </View>
    );
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
              hitSlop={10}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={isTablet ? 32 : 28}
                color="#111"
              />
            </TouchableOpacity>

            {otherMember && (
              <>
                <Image
                  source={{
                    uri: otherMember.avatar || DEFAULT_AVATAR,
                  }}
                  className="rounded-full bg-gray-200"
                  style={{
                    width: isSmallDevice ? 40 : 48,
                    height: isSmallDevice ? 40 : 48,
                  }}
                />

                <View className="ml-3 flex-1">
                  <Text
                    numberOfLines={1}
                    className="font-semibold text-gray-800"
                    style={{
                      fontSize: isSmallDevice ? 14 : 16,
                    }}
                  >
                    {otherMember.name}
                  </Text>

                  <Text
                    numberOfLines={1}
                    className="text-gray-500 text-xs"
                  >
                    {otherMember.email}
                  </Text>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity hitSlop={10} activeOpacity={0.7}>
            <Ionicons name="search" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#FF7A00" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderMessage}
            ListEmptyComponent={emptyComponent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            removeClippedSubviews={Platform.OS === "android"}
            initialNumToRender={12}
            maxToRenderPerBatch={12}
            windowSize={10}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: isSmallDevice ? 12 : 16,
              paddingTop: 12,
              paddingBottom: 18,
            }}
          />
        )}

        <View className="flex-row items-center bg-white px-4 py-3 border-t border-gray-200">
          <View className="flex-1 bg-gray-100 rounded-2xl px-4 justify-center">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("chatPage.writeReply")}
              placeholderTextColor="#888"
              className="text-gray-800"
              style={{
                minHeight: isSmallDevice ? 42 : 46,
                maxHeight: 110,
                fontSize: isSmallDevice ? 14 : 15,
                paddingVertical: Platform.OS === "ios" ? 10 : 6,
              }}
              multiline
              editable={!sending}
              returnKeyType="default"
            />
          </View>

          <TouchableOpacity
            className="ml-3"
            disabled={sending}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons name="attach-outline" size={26} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!input.trim() || sending}
            className="ml-3"
            hitSlop={10}
            activeOpacity={0.7}
            style={{
              opacity: input.trim() && !sending ? 1 : 0.45,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FF6B00" />
            ) : (
              <Ionicons name="send" size={26} color="#FF6B00" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}