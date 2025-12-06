import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ActionBar from "../../components/Bars/ActionBar";


export default function EventDetails() {
  const navigation = useNavigation();

  // 👇 STATE QUYẾT ĐỊNH UI
  const [isBooked, setIsBooked] = useState(false); // đổi true để test UI booked

  const handleBooked = () => {
    setIsBooked(true)
    navigation.navigate('BuyTicket' as never);
    
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 BANNER */}
        <View className="relative">
          <Image
            source={{
              uri: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg",
            }}
            className="w-full h-72"
          />

          {/* Back */}
          <TouchableOpacity
            className="absolute top-12 left-4 bg-white/30 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Heart */}
          <TouchableOpacity className="absolute top-12 right-4 bg-white/30 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="heart" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* 🔥 ActionBar chỉ hiện khi đã booked */}
        {isBooked && <ActionBar />}

        {/* 🔥 EVENT CARD */}
        <View className={`bg-white mx-4 ${isBooked ? "mt-4" : "-mt-10"} rounded-3xl p-5 shadow`}>
          {/* Header drag indicator */}
          <View className="items-center mb-4">
            <View className="w-12 h-1 bg-gray-300 rounded-full mb-3" />
          </View>

          {/* Title + Price/Booked */}
          <View className="flex-row justify-between items-start">
            <Text className="text-2xl font-semibold text-gray-900">
              Shere Bangla Concert
            </Text>

            {/* Chuyển badge theo trạng thái */}
            {isBooked ? (
              <View className="bg-orange-500 px-4 py-1 rounded-full">
                <Text className="text-white font-semibold">BOOKED</Text>
              </View>
            ) : (
              <View className="bg-orange-100 px-4 py-1 rounded-full">
                <Text className="text-orange-500 font-semibold">$299 USD</Text>
              </View>
            )}
          </View>

          {/* Location + Date */}
          <View className="mt-3 space-y-1">
            <View className="flex-row items-center space-x-2">
              <Ionicons name="location" size={18} color="#F97316" />
              <Text className="text-gray-600">ABC Avenue, Dhaka</Text>
            </View>

            <View className="flex-row items-center space-x-2">
              <Ionicons name="calendar" size={18} color="#F97316" />
              <Text className="text-gray-600">25–27 October, 22</Text>
            </View>
          </View>

          {/* Members */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-gray-700 font-medium">15.7k+ Members are joined</Text>

            <TouchableOpacity onPress={() => navigation.navigate("InviteFriend" as never)}>
              <Text className="text-orange-500 font-semibold">
                {isBooked ? "INVITE" : "INVITE"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Organizer */}
          <View className="mt-6 flex-row items-center justify-between bg-orange-50 rounded-xl p-3">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => navigation.navigate("OrganizerProfile" as never)}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/100?img=12" }}
                  className="w-12 h-12 rounded-full"
                />
              </TouchableOpacity>
              <View className="ml-3">
                <Text className="font-semibold text-gray-800">Tamim Ikram</Text>
                <Text className="text-gray-500 text-sm">Event Organiser</Text>
              </View>
            </View>

            <TouchableOpacity className="bg-white w-10 h-10 rounded-full items-center justify-center shadow">
              <Ionicons name="chatbubble-outline" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="font-semibold text-lg">Description</Text>
            <Text className="text-gray-600 mt-2 leading-6">
              Ultricies arcu venenatis in lorem faucibus lobortis at...
              <Text className="text-orange-500 font-semibold"> Read More</Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🔥 Bottom Button */}
      <View className="px-6 pb-10">

        {/* Nếu chưa mua → BUY A TICKET */}
        {!isBooked && (
          <TouchableOpacity
            className="bg-black rounded-2xl py-4 flex-row items-center justify-center"
            onPress={() => handleBooked()}  // tạm thời simulate mua vé
          >
            <Ionicons name="ticket-outline" size={22} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">BUY TICKET</Text>
          </TouchableOpacity>
        )}

        {/* Nếu đã mua → Messages */}
        {isBooked && (
          <TouchableOpacity className="bg-black rounded-2xl py-4 flex-row items-center justify-center">
            <Text className="text-white text-lg font-semibold">Messages</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
