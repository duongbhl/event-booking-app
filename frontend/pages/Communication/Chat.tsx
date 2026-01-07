import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getMessages, sendMessage, markRoomAsRead } from "../../services/chat.service";

export default function Chat() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user, token } = useAuth();

  const roomId = route.params?.roomId;
  const initialRoom = route.params?.room;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get other member from room
  const otherMember = initialRoom?.members?.find((m: any) => m._id !== user?._id);

  // Fetch messages
  useEffect(() => {
    if (!roomId || !token) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getMessages(roomId, token);
        // Sort messages chronologically (oldest first)
        const sorted = data.sort(
          (a: any, b: any) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        setMessages(sorted);
        
        // Mark room as read
        await markRoomAsRead(roomId, token);
      } catch (error) {
        console.log("Fetch messages error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [roomId, token]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!input.trim() || !roomId || !token) return;

    try {
      setSending(true);
      const messageText = input;
      setInput("");

      const newMessage = await sendMessage(
        roomId,
        { content: messageText, type: "text" },
        token
      );

      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.log("Send message error:", error);
      setInput(input); // Restore input on error
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#111" />
          </TouchableOpacity>

          {/* Avatar + Info */}
          {otherMember && (
            <>
              <Image
                source={{
                  uri: otherMember.avatar || "https://via.placeholder.com/48",
                }}
                className="w-12 h-12 rounded-full"
              />

              <View className="ml-3">
                <Text className="font-semibold text-gray-800 text-[16px]">
                  {otherMember.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {otherMember.email}
                </Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* CHAT AREA */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF7A00" />
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-3"
          scrollEnabled={true}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: false })
          }
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10">
              <Text className="text-center text-gray-400 text-sm">
                No messages yet. Start the conversation!
              </Text>
            </View>
          ) : (
            messages.map((msg) => (
              <View key={msg._id} className="mb-4">
                {/* Time */}
                <Text
                  className={`text-xs text-gray-400 mb-1 ${
                    String(msg.sender?._id) === user?._id
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>

                {/* BUBBLE */}
                <View
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    String(msg.sender?._id) === user?._id
                      ? "self-end bg-orange-500 rounded-br-none"
                      : "self-start bg-gray-100 rounded-bl-none"
                  }`}
                >
                  <Text
                    className={`${
                      String(msg.sender?._id) === user?._id
                        ? "text-white"
                        : "text-gray-800"
                    } text-[15px]`}
                  >
                    {msg.content}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View className="h-10" />
        </ScrollView>
      )}

      {/* INPUT BAR */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={10}
      >
        <View className="flex-row items-center bg-white px-4 py-3 border-t border-gray-200">
          <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-3">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Write a reply..."
              placeholderTextColor="#888"
              className="text-gray-800"
              editable={!sending}
            />
          </View>


          <TouchableOpacity className="ml-3 mr-3" disabled={sending}>
            <Ionicons name="attach-outline" size={26} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={!input.trim() || sending}
            className={input.trim() && !sending ? "" : "opacity-50"}
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
