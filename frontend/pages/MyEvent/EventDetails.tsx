import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActionBar from "../../components/Bars/ActionBar";
import { formatDateTime } from "../../utils/utils";
import { getMyBookmarks, toggleBookmark } from "../../services/bookmark.service";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticket.service";


export default function EventDetails() {
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const event = route.params?.event;

  const isOwnEvent = user && event?.organizer && event.organizer._id === user._id;
  const isOutOfDate = event && new Date(event.date) < new Date();

  const [myTickets, setMyTickets] = useState<any[]>([]);
  const isBooked = myTickets.length > 0;
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);


  if (!event) return null;




  const handleBooked = () => {
    navigation.navigate("BuyTicket", {
      eventId: event._id,
      price: event.price,
    } as never);
  };

  const handleViewTicket = () => {
    navigation.navigate("Ticket", {
      tickets: myTickets,
    } as never);
  };



  const handleToggleBookmark = async () => {
    if (!token) return alert("Vui lòng đăng nhập");

    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      await toggleBookmark(event._id, token);
      Alert.alert(
        "Success",
        isBookmarked ? "Removed from favorites" : "Added to favorites"
      );
    } catch (e) {
      setIsBookmarked(prev); // rollback
      Alert.alert("Error", "Failed to update bookmark");
    }
  };


  useEffect(() => {
    if (!token) return;

    const fetchBookmarkStatus = async () => {
      try {
        const bookmarks = await getMyBookmarks(token);

        const found = bookmarks.find(
          (b: any) => b.event?._id === event._id
        );

        setIsBookmarked(!!found);
      } catch (err) {
        console.log("Fetch bookmark status error", err);
      }
    };

    fetchBookmarkStatus();
  }, [token]);


  useEffect(() => {
    if (!token || !event?._id) return;

    const fetchMyTickets = async () => {
      try {
        const tickets = await getMyTickets(token);

        const matched = tickets.filter(
          (t: any) =>
            t.event?._id === event._id &&
            t.paymentStatus === "paid"
        );

        setMyTickets(matched);
      } catch (err) {
        console.log("Fetch tickets error", err);
      } finally {
        setLoadingTicket(false);
      }
    };

    fetchMyTickets();
  }, [token, event?._id]);


  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 BANNER */}
        <View className="relative">
          <Image
            source={{ uri: event.images }}
            className="w-full h-72"
          />

          <TouchableOpacity
            className="absolute top-12 left-4 bg-white/30 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            className="absolute top-12 right-4 bg-white/30 w-10 h-10 rounded-full items-center justify-center"
            onPress={handleToggleBookmark}
            disabled={loading}
          >
            <Ionicons
              name={isBookmarked ? "heart" : "heart-outline"}
              size={24}
              color={isBookmarked ? "red" : "white"}
            />
          </TouchableOpacity>


        </View>

        {/* 🔥 ActionBar */}
        {isBooked && <ActionBar/>}

        {/* 🔥 EVENT CARD */}
        <View className={`bg-white mx-4 ${isBooked ? "mt-4" : "-mt-10"} rounded-3xl p-5 shadow`}>

          {/* Title + Price */}
          <View className="flex-row justify-between items-start">
            <Text className="text-2xl font-semibold text-gray-900">
              {event.title}
            </Text>

            {isBooked ? (
              <View className="bg-orange-500 px-4 py-1 rounded-full">
                <Text className="text-white font-semibold">BOOKED</Text>
              </View>
            ) : (
              <View className="bg-orange-100 px-4 py-1 rounded-full">
                <Text className="text-orange-500 font-semibold">
                  ${event.price} USD
                </Text>
              </View>
            )}
          </View>

          {/* Location + Date */}
          <View className="mt-3 gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" size={18} color="#F97316" />
              <Text className="text-gray-600">{event.location}</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar" size={18} color="#F97316" />
              <Text className="text-gray-600">
                {formatDateTime(event.date)}
              </Text>
            </View>
          </View>

          {/* Members */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-gray-700 font-medium">
              {event.attendees || 0}+ Members are joined
            </Text>

            <TouchableOpacity 
              onPress={() => navigation.navigate("InviteFriend" as never)}
              disabled={isOwnEvent || isOutOfDate}
              style={{ opacity: isOwnEvent || isOutOfDate ? 0.5 : 1 }}
            >
              <Text className={`font-semibold ${isOwnEvent || isOutOfDate ? "text-gray-400" : "text-orange-500"}`}>
                {isOutOfDate ? "EVENT ENDED" : "INVITE"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Organizer */}
          <View className="mt-6 flex-row items-center justify-between bg-orange-50 rounded-xl p-3">
            <TouchableOpacity 
              className="flex-row items-center flex-1"
              onPress={() => navigation.navigate("OrganizerProfile", { organizer: event.organizer })}
            >
              <Image
                source={{ uri: event.organizer?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
                className="w-12 h-12 rounded-full"
                defaultSource={{ uri: "https://i.pravatar.cc/100?img=12" }}
              />
              <View className="ml-3">
                <Text className="font-semibold text-gray-800">
                  {event.organizer?.name || "Unknown Organizer"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Event Organiser
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-white w-10 h-10 rounded-full items-center justify-center shadow">
              <Ionicons name="chatbubble-outline" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="font-semibold text-lg">Description</Text>
            <Text className="text-gray-600 mt-2 leading-6">
              {event.description || "No description"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🔥 Bottom Button */}
      <View className="px-6 pb-10">
        {isOwnEvent ? (
          <TouchableOpacity className="bg-black rounded-2xl py-4 items-center">
            <Text className="text-white text-lg font-semibold">Check</Text>
          </TouchableOpacity>
        ) : isBooked ? (
          // Show 2 buttons when already booked
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-orange-500 rounded-2xl py-4 items-center"
              onPress={handleViewTicket}
              disabled={isOutOfDate}
              style={{ opacity: isOutOfDate ? 0.5 : 1 }}
            >
              <Text className="text-white text-lg font-semibold">
                {isOutOfDate ? "EVENT ENDED" : "My Tickets"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-black rounded-2xl py-4 flex-row items-center justify-center"
              onPress={handleBooked}
              disabled={isOutOfDate}
              style={{ opacity: isOutOfDate ? 0.5 : 1 }}
            >
              <Ionicons name="add-circle-outline" size={22} color="white" />
              <Text className="text-white text-lg font-semibold ml-2">
                {isOutOfDate ? "EVENT ENDED" : "Buy More"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            className="bg-black rounded-2xl py-4 flex-row items-center justify-center" 
            onPress={handleBooked}
            disabled={isOutOfDate}
            style={{ opacity: isOutOfDate ? 0.5 : 1 }}
          >
            <Ionicons name="ticket-outline" size={22} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              {isOutOfDate ? "EVENT ENDED" : "BUY TICKET"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
}
