import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import ActionBar from "../../components/Bars/ActionBar";
import { formatDateTime } from "../../utils/utils";
import { getMyBookmarks, toggleBookmark } from "../../services/bookmark.service";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticket.service";
import { createRoom } from "../../services/chat.service";
import { getEvents, approveEvent, rejectEvent } from "../../services/event.service";


export default function EventDetails() {
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  let event = route.params?.event;
  const eventId = route.params?.eventId;
  const [fetchedEvent, setFetchedEvent] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(!!eventId);

  const displayEvent = event || fetchedEvent;
  const isAdmin = user?.role === "admin";

  const isOwnEvent = user && displayEvent?.organizer && displayEvent.organizer._id === user._id;
  const isOutOfDate = displayEvent && new Date(displayEvent.date) < new Date();

  const [myTickets, setMyTickets] = useState<any[]>([]);
  const isBooked = myTickets.length > 0;
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [approvingOrRejecting, setApprovingOrRejecting] = useState(false);

  // Fetch event by ID if eventId is provided (from admin)
  useEffect(() => {
    if (eventId && !event) {
      const fetchEventData = async () => {
        try {
          const events = await getEvents();
          const data = events.find((e: any) => e._id === eventId);
          setFetchedEvent(data);
        } catch (error) {
          console.log("Fetch event error:", error);
          Alert.alert("Error", "Failed to fetch event details");
        } finally {
          setEventLoading(false);
        }
      };
      fetchEventData();
    }
  }, [eventId]);



  if (eventLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text className="mt-2 text-gray-600">Loading event...</Text>
      </SafeAreaView>
    );
  }

  if (!displayEvent) return null;




  const handleBooked = () => {
    navigation.navigate("BuyTicket", {
      eventId: displayEvent._id,
      price: displayEvent.price,
    } as never);
  };

  const handleApproveEvent = async () => {
    setApprovingOrRejecting(true);
    try {
      const updatedEvent = await approveEvent(displayEvent._id);
      setFetchedEvent(updatedEvent);
      Alert.alert("Success", "Event approved successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to approve event");
      console.error(error);
    } finally {
      setApprovingOrRejecting(false);
    }
  };

  const handleRejectEvent = async () => {
    Alert.alert(
      "Reject Event",
      "Are you sure you want to reject this event?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Reject",
          onPress: async () => {
            setApprovingOrRejecting(true);
            try {
              const updatedEvent = await rejectEvent(displayEvent._id);
              setFetchedEvent(updatedEvent);
              Alert.alert("Success", "Event rejected successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to reject event");
              console.error(error);
            } finally {
              setApprovingOrRejecting(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleViewTicket = () => {
    navigation.navigate("Ticket", {
      tickets: myTickets,
    } as never);
  };

  const handleChatWithOrganizer = async () => {
    if (!token || !displayEvent.organizer?._id) return;

    try {
      const room = await createRoom(
        { memberIds: [displayEvent.organizer._id], isGroup: false },
        token
      );
      navigation.navigate("Chat", { roomId: room._id, room });
    } catch (error) {
      console.log("Create chat room error:", error);
      Alert.alert("Error", "Failed to create chat room");
    }
  };

  const handleViewLocation = () => {
    navigation.navigate("Location", {
      address: displayEvent.location,
      title: displayEvent.title,
      coordinates: displayEvent.coordinates || null, // Pass coordinates if available
    });
  };



  const handleToggleBookmark = async () => {
    if (!token) return alert("Vui lòng đăng nhập");

    const prev = isBookmarked;
    setIsBookmarked(!prev);

    try {
      await toggleBookmark(displayEvent._id, token);
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
    if (!token || isAdmin) return;

    const fetchBookmarkStatus = async () => {
      try {
        const bookmarks = await getMyBookmarks(token);

        const found = bookmarks.find(
          (b: any) => b.event?._id === displayEvent._id
        );

        setIsBookmarked(!!found);
      } catch (err) {
        console.log("Fetch bookmark status error", err);
      }
    };

    fetchBookmarkStatus();
  }, [token, isAdmin]);


  useEffect(() => {
    if (!token || !displayEvent?._id || isAdmin) return;

    const fetchMyTickets = async () => {
      try {
        const tickets = await getMyTickets(token);

        const matched = tickets.filter(
          (t: any) =>
            t.event?._id === displayEvent._id &&
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
  }, [token, displayEvent?._id, isAdmin]);


  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* 🔥 BANNER */}
        <View className="relative">
          <Image
            source={{ uri: displayEvent.images }}
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
              {displayEvent.title}
            </Text>

            {isBooked ? (
              <View className="bg-orange-500 px-4 py-1 rounded-full">
                <Text className="text-white font-semibold">BOOKED</Text>
              </View>
            ) : (
              <View className="bg-orange-100 px-4 py-1 rounded-full">
                <Text className="text-orange-500 font-semibold">
                  ${displayEvent.price} USD
                </Text>
              </View>
            )}
          </View>

          {/* Location + Date */}
          <View className="mt-3 gap-3">
            <TouchableOpacity 
              onPress={handleViewLocation}
              className="flex-row items-center gap-2"
            >
              <Ionicons name="location" size={18} color="#F97316" />
              <Text className="text-orange-600 font-semibold underline flex-1">{displayEvent.location}</Text>
              <Ionicons name="chevron-forward" size={18} color="#F97316" />
            </TouchableOpacity>

            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar" size={18} color="#F97316" />
              <Text className="text-gray-600">
                {formatDateTime(displayEvent.date)}
              </Text>
            </View>
          </View>

          {/* Members */}
          <View className="flex-row justify-between items-center mt-4">
            <Text className="text-gray-700 font-medium">
              {displayEvent.attendees || 0}+ Members are joined
            </Text>

            <TouchableOpacity 
              onPress={() => navigation.navigate("InviteFriend" as never, {event: displayEvent} as never)}
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
              onPress={() => navigation.navigate("OrganizerProfile", { organizer: displayEvent.organizer })}
            >
              <Image
                source={{ uri: displayEvent.organizer?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg" }}
                className="w-12 h-12 rounded-full"
                defaultSource={{ uri: "https://i.pravatar.cc/100?img=12" }}
              />
              <View className="ml-3">
                <Text className="font-semibold text-gray-800">
                  {displayEvent.organizer?.name || "Unknown Organizer"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Event Organiser
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white w-10 h-10 rounded-full items-center justify-center shadow"
              onPress={handleChatWithOrganizer}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#555" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View className="mt-6">
            <Text className="font-semibold text-lg">Description</Text>
            <Text className="text-gray-600 mt-2 leading-6">
              {displayEvent.description || "No description"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🔥 Bottom Button */}
      <View className="px-6 pb-10">
        {isAdmin ? (
          // Admin approve/reject buttons
          displayEvent.approvalStatus === "PENDING" ? (
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-2xl py-4 flex-row items-center justify-center"
                onPress={handleApproveEvent}
                disabled={approvingOrRejecting}
              >
                {approvingOrRejecting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="white" />
                    <Text className="text-white text-lg font-semibold ml-2">Approve</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-2xl py-4 flex-row items-center justify-center"
                onPress={handleRejectEvent}
                disabled={approvingOrRejecting}
              >
                {approvingOrRejecting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={22} color="white" />
                    <Text className="text-white text-lg font-semibold ml-2">Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity className="bg-gray-400 rounded-2xl py-4 items-center" disabled>
              <Text className="text-white text-lg font-semibold">
                {displayEvent.approvalStatus === "ACCEPTED" ? "✓ Approved" : "✗ Rejected"}
              </Text>
            </TouchableOpacity>
          )
        ) : isOwnEvent ? (
          <TouchableOpacity className="bg-black rounded-2xl py-4 items-center">
            <Text className="text-white text-lg font-semibold">Check</Text>
          </TouchableOpacity>
        ) : isBooked ? (
          // Show 2 buttons when already booked
          <View className="flex-row gap-3">

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
