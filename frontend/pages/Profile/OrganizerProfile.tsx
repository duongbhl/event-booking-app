import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function OrganizerProfile() {
  const [tab, setTab] = useState<"about" | "events" | "reviews">("about");
  const navigation = useNavigation()

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="justify-start">
          <TouchableOpacity onPress={()=>navigation.goBack()} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Avatar */}
      <View className="items-center">
        <Image
          source={{
            uri: "https://i.pravatar.cc/300?img=12",
          }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="mt-3 text-lg font-semibold">Tamim Ikram</Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-center mt-6">
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">3,583</Text>
          <Text className="text-gray-500 text-sm">Followers</Text>
        </View>
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">167</Text>
          <Text className="text-gray-500 text-sm">Following</Text>
        </View>
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">20</Text>
          <Text className="text-gray-500 text-sm">Events</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mt-8 border-b border-gray-200">
        {["About", "Events", "Reviews"].map((label) => {
          const key = label.toLowerCase() as "about" | "events" | "reviews";
          const active = tab === key;
          return (
            <TouchableOpacity
              key={label}
              className="flex-1 items-center pb-3"
              onPress={() => setTab(key)}
            >
              <Text
                className={`font-medium ${active ? "text-orange-500" : "text-gray-500"
                  }`}
              >
                {label}
              </Text>
              {active && <View className="h-1 w-10 bg-orange-500 rounded-full mt-2" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {tab === "about" && (
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-2">About</Text>
          <Text className="text-gray-600 leading-6">
            Ultricies arcu venenatis in lorem faucibus lobortis at. East odio
            varius nisl congue aliquam nunc est sit pulvinar magna. Est
            scelerisque dignissim non nibh arcu venenatis in lorem faucibus
            lobortis at. East odio…
            <Text className="text-orange-500 font-semibold"> Read More</Text>
          </Text>
        </View>
      )}

      {tab === "events" && (
        <Text className="text-center mt-10 text-gray-400">Events List…</Text>
      )}

      {tab === "reviews" && (
        <Text className="text-center mt-10 text-gray-400">Reviews…</Text>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
