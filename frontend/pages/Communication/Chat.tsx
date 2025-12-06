import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ChatMessageProp } from "../../components/Interface/ChatMessageProps";


const MOCK_MESSAGES: ChatMessageProp[] = [
  {
    id: "1",
    text: "Halo, bro",
    time: "08:50 AM",
    fromMe: true,
  },
  {
    id: "2",
    text: "kepwiwe kie rawone ra mudun-mudun",
    time: "08:50 AM",
    fromMe: true,
  },
  {
    id: "3",
    text: "hooh kie selak kaliren weteng inyong...",
    time: "08:51 AM",
    fromMe: false,
  },
  {
    id: "4",
    text: "opo tak tuku bae",
    time: "07:53 AM",
    fromMe: true,
  },
  {
    id: "5",
    text: "karuane inyong metu nyang pasar bae",
    time: "07:53 AM",
    fromMe: true,
  },
  {
    id: "6",
    text: "Njluk duwite yoo",
    time: "07:53 AM",
    fromMe: true,
  },
  {
    id: "7",
    text: "peeh ra modal koen cuk",
    time: "07:52 AM",
    fromMe: false,
  },
];

export default function Chat() {
  const navigation = useNavigation();
  const [input, setInput] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="chevron-back" size={28} color="#111" />
          </TouchableOpacity>

          {/* Avatar + Info */}
          <Image
            source={{ uri: "https://randomuser.me/api/portraits/men/20.jpg" }}
            className="w-12 h-12 rounded-full"
          />

          <View className="ml-3">
            <Text className="font-semibold text-gray-800 text-[16px]">
              David Silbia
            </Text>
            <Text className="text-gray-500 text-xs">davidsilbia1997@gmail.com</Text>
          </View>
        </View>

        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* CHAT AREA */}
      <ScrollView className="flex-1 px-4 py-3">
        <Text className="text-center text-gray-400 text-xs mb-4">Today</Text>

        {MOCK_MESSAGES.map((msg) => (
          <View key={msg.id} className="mb-4">
            {/* Time above message group */}
            <Text
              className={`text-xs text-gray-400 mb-1 ${
                msg.fromMe ? "text-right" : "text-left"
              }`}
            >
              {msg.time}
            </Text>

            {/* BUBBLE */}
            <View
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.fromMe
                  ? "self-end bg-orange-500 rounded-br-none"
                  : "self-start bg-gray-100 rounded-bl-none"
              }`}
            >
              <Text
                className={`${msg.fromMe ? "text-white" : "text-gray-800"} text-[15px]`}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}

        <View className="h-20" />
      </ScrollView>

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
            />
          </View>

          <TouchableOpacity className="ml-3">
            <Ionicons name="happy-outline" size={26} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity className="ml-3">
            <Ionicons name="attach-outline" size={26} color="#777" />
          </TouchableOpacity>

          <TouchableOpacity className="ml-3">
            <Ionicons name="send" size={26} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
