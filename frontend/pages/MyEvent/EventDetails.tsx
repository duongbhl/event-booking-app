import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

import { useLocalization } from "../../context/LocalizationContext";
import { formatDateTime } from "../../utils/utils";
import {
  getMyBookmarks,
  toggleBookmark,
} from "../../services/bookmark.service";
import { useAuth } from "../../context/AuthContext";
import { getMyTickets } from "../../services/ticket.service";
import { createRoom } from "../../services/chat.service";
import {
  getEvents,
  approveEvent,
  rejectEvent,
} from "../../services/event.service";
import ActionBar from "../../components/Bars/ActionBar";

const DEFAULT_AVATAR =
  "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg";

export default function EventDetails() {
  const { t } = useLocalization();
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;
  const bannerHeight = isTablet ? 360 : isSmallDevice ? 230 : 280;
  const bottomButtonHeight = isSmallDevice ? 50 : 56;

  const routeEvent = route.params?.event;
  const eventId = route.params?.eventId;

  const [fetchedEvent, setFetchedEvent] = useState<any>(null);
  const [eventLoading, setEventLoading] = useState(!!eventId && !routeEvent);

  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [loadingTicket, setLoadingTicket] = useState(true);

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [approvingOrRejecting, setApprovingOrRejecting] = useState(false);

  const displayEvent = routeEvent || fetchedEvent;

  const isAdmin = user?.role === "admin";

  const isOwnEvent = useMemo(() => {
    return (
      !!user?._id &&
      !!displayEvent?.organizer?._id &&
      displayEvent.organizer._id === user._id
    );
  }, [user?._id, displayEvent?.organizer?._id]);

  const isOutOfDate = useMemo(() => {
    if (!displayEvent?.date) return false;
    return new Date(displayEvent.date) < new Date();
  }, [displayEvent?.date]);

  const isBooked = myTickets.length > 0;

  useEffect(() => {
    if (!eventId || routeEvent) {
      setEventLoading(false);
      return;
    }

    const fetchEventData = async () => {
      try {
        setEventLoading(true);

        const events = await getEvents();
        const data = events.find((item: any) => item._id === eventId);

        setFetchedEvent(data || null);
      } catch (error) {
        console.log("Fetch event error:", error);
        Alert.alert(
          t("common.error"),
          t("eventDetails.failedFetchEventDetails")
        );
      } finally {
        setEventLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, routeEvent, t]);

  useEffect(() => {
    if (!token || !displayEvent?._id || isAdmin) return;

    const fetchBookmarkStatus = async () => {
      try {
        const bookmarks = await getMyBookmarks(token);

        const found = bookmarks.find(
          (bookmark: any) => bookmark.event?._id === displayEvent._id
        );

        setIsBookmarked(!!found);
      } catch (error) {
        console.log("Fetch bookmark status error:", error);
      }
    };

    fetchBookmarkStatus();
  }, [token, displayEvent?._id, isAdmin]);

  useEffect(() => {
    if (!token || !displayEvent?._id || isAdmin) {
      setLoadingTicket(false);
      return;
    }

    const fetchMyTickets = async () => {
      try {
        setLoadingTicket(true);

        const tickets = await getMyTickets(token);

        const matched = tickets.filter(
          (ticket: any) =>
            ticket.event?._id === displayEvent._id &&
            ticket.paymentStatus === "paid"
        );

        setMyTickets(matched);
      } catch (error) {
        console.log("Fetch tickets error:", error);
      } finally {
        setLoadingTicket(false);
      }
    };

    fetchMyTickets();
  }, [token, displayEvent?._id, isAdmin]);

  const handleBooked = useCallback(() => {
    if (!displayEvent?._id) return;

    navigation.navigate("BuyTicket", {
      eventId: displayEvent._id,
      ticketTiers: displayEvent.ticketTiers || [],
    });
  }, [displayEvent?._id, displayEvent?.ticketTiers, navigation]);

  const handleApproveEvent = useCallback(async () => {
    if (!displayEvent?._id || approvingOrRejecting) return;

    try {
      setApprovingOrRejecting(true);

      const updatedEvent = await approveEvent(displayEvent._id);
      setFetchedEvent(updatedEvent);

      Alert.alert(
        t("common.success"),
        t("eventDetails.eventApprovedSuccess")
      );
    } catch (error) {
      console.log("Approve event error:", error);
      Alert.alert(t("common.error"), t("eventDetails.failedApproveEvent"));
    } finally {
      setApprovingOrRejecting(false);
    }
  }, [displayEvent?._id, approvingOrRejecting, t]);

  const handleRejectEvent = useCallback(() => {
    if (!displayEvent?._id || approvingOrRejecting) return;

    Alert.alert(
      t("eventDetails.rejectEventTitle"),
      t("eventDetails.rejectEventMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("eventDetails.reject"),
          style: "destructive",
          onPress: async () => {
            try {
              setApprovingOrRejecting(true);

              const updatedEvent = await rejectEvent(displayEvent._id);
              setFetchedEvent(updatedEvent);

              Alert.alert(t("common.success"), t("events.eventDeleted"));
            } catch (error) {
              console.log("Reject event error:", error);
              Alert.alert(
                t("common.error"),
                t("eventDetails.failedRejectEvent")
              );
            } finally {
              setApprovingOrRejecting(false);
            }
          },
        },
      ]
    );
  }, [displayEvent?._id, approvingOrRejecting, t]);

  const handleViewTicket = useCallback(() => {
    navigation.navigate("Ticket", {
      tickets: myTickets,
    });
  }, [navigation, myTickets]);

  const handleChatWithOrganizer = useCallback(async () => {
    if (!token || !displayEvent?.organizer?._id) return;

    try {
      const room = await createRoom(
        {
          memberIds: [displayEvent.organizer._id],
          isGroup: false,
        },
        token
      );

      navigation.navigate("Chat", {
        roomId: room._id,
        room,
      });
    } catch (error) {
      console.log("Create chat room error:", error);
      Alert.alert(t("common.error"), t("eventDetails.failedCreateChatRoom"));
    }
  }, [token, displayEvent?.organizer?._id, navigation, t]);

  const handleViewLocation = useCallback(() => {
    if (!displayEvent) return;

    navigation.navigate("Location", {
      address: displayEvent.location,
      title: displayEvent.title,
      coordinates: displayEvent.coordinates || null,
    });
  }, [navigation, displayEvent]);

  const handleToggleBookmark = useCallback(async () => {
    if (!token) {
      Alert.alert(t("common.error"), "Vui lòng đăng nhập");
      return;
    }

    if (!displayEvent?._id || bookmarkLoading) return;

    const previousValue = isBookmarked;

    try {
      setBookmarkLoading(true);
      setIsBookmarked(!previousValue);

      await toggleBookmark(displayEvent._id, token);

      Alert.alert(
        t("common.success"),
        previousValue
          ? t("bookmark.removedFromFavorites")
          : t("bookmark.addedToFavorites")
      );
    } catch (error) {
      console.log("Toggle bookmark error:", error);
      setIsBookmarked(previousValue);
      Alert.alert(t("common.error"), t("eventDetails.failedUpdateBookmark"));
    } finally {
      setBookmarkLoading(false);
    }
  }, [
    token,
    displayEvent?._id,
    bookmarkLoading,
    isBookmarked,
    t,
  ]);

  if (eventLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#FF7A00" />

        <Text className="mt-2 text-gray-600">
          {t("eventDetails.loadingEvent")}
        </Text>
      </SafeAreaView>
    );
  }

  if (!displayEvent) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={56} color="#FF7A00" />

        <Text className="text-gray-900 font-semibold mt-4 text-center">
          {t("eventDetails.failedFetchEventDetails")}
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-black px-5 py-3 rounded-xl mt-6"
          activeOpacity={0.85}
        >
          <Text className="text-white font-semibold">{t("common.cancel")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const lowestPrice =
    displayEvent.ticketTiers && displayEvent.ticketTiers.length > 0
      ? Math.min(...displayEvent.ticketTiers.map((tier: any) => tier.price || 0))
      : displayEvent.price || 0;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: Platform.OS === "ios" ? 120 : 100,
        }}
      >
        <View className="relative">
          <Image
            source={{ uri: displayEvent.images }}
            className="w-full bg-gray-200"
            style={{
              height: bannerHeight,
            }}
            resizeMode="cover"
          />

          <TouchableOpacity
            className="absolute bg-black/35 rounded-full items-center justify-center"
            style={{
              top: isSmallDevice ? 16 : 20,
              left: horizontalPadding,
              width: isSmallDevice ? 38 : 42,
              height: isSmallDevice ? 38 : 42,
            }}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {!isAdmin && !isOwnEvent && (
            <TouchableOpacity
              className="absolute bg-black/35 rounded-full items-center justify-center"
              style={{
                top: isSmallDevice ? 16 : 20,
                right: horizontalPadding,
                width: isSmallDevice ? 38 : 42,
                height: isSmallDevice ? 38 : 42,
                opacity: bookmarkLoading ? 0.6 : 1,
              }}
              onPress={handleToggleBookmark}
              disabled={bookmarkLoading}
              activeOpacity={0.75}
              hitSlop={10}
            >
              {bookmarkLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons
                  name={isBookmarked ? "heart" : "heart-outline"}
                  size={24}
                  color={isBookmarked ? "#EF4444" : "white"}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {isBooked && !isAdmin && (
          <View style={{ marginTop: 12 }}>
            <ActionBar eventId={displayEvent._id} />
          </View>
        )}

        <View
          className="bg-white rounded-3xl shadow"
          style={{
            marginHorizontal: horizontalPadding,
            marginTop: isBooked && !isAdmin ? 14 : -36,
            padding: isSmallDevice ? 16 : 20,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View className="flex-row justify-between items-start">
            <Text
              numberOfLines={3}
              className="font-semibold text-gray-900 flex-1 mr-3"
              style={{
                fontSize: isTablet ? 26 : isSmallDevice ? 20 : 24,
                lineHeight: isTablet ? 34 : isSmallDevice ? 27 : 31,
              }}
            >
              {displayEvent.title}
            </Text>

            {isBooked ? (
              <TouchableOpacity
                onPress={handleViewTicket}
                activeOpacity={0.75}
                className="bg-orange-500 rounded-full"
                style={{
                  paddingHorizontal: isSmallDevice ? 10 : 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                  }}
                >
                  {t("eventDetails.booked")}
                </Text>
              </TouchableOpacity>
            ) : (
              <View
                className="bg-orange-100 rounded-full"
                style={{
                  paddingHorizontal: isSmallDevice ? 10 : 14,
                  paddingVertical: 6,
                }}
              >
                <Text
                  className="text-orange-500 font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                  }}
                >
                  ${lowestPrice} USD
                </Text>
              </View>
            )}
          </View>

          <View className="mt-4" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleViewLocation}
              className="flex-row items-center"
              activeOpacity={0.75}
            >
              <Ionicons name="location" size={18} color="#F97316" />

              <Text
                numberOfLines={2}
                className="text-orange-600 font-semibold underline flex-1 ml-2"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {displayEvent.location}
              </Text>

              <Ionicons name="chevron-forward" size={18} color="#F97316" />
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Ionicons name="calendar" size={18} color="#F97316" />

              <Text
                numberOfLines={2}
                className="text-gray-600 ml-2 flex-1"
                style={{ fontSize: isSmallDevice ? 13 : 14 }}
              >
                {formatDateTime(displayEvent.date)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Ionicons name="people" size={18} color="#F97316" />

                <Text
                  numberOfLines={1}
                  className="text-gray-700 font-medium ml-2 flex-1"
                  style={{ fontSize: isSmallDevice ? 13 : 14 }}
                >
                  {displayEvent.attendees || 0}+{" "}
                  {t("eventDetails.membersJoined")}
                </Text>
              </View>

              {!isOwnEvent && !isAdmin && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("InviteFriend", {
                      event: displayEvent,
                    })
                  }
                  disabled={isOutOfDate}
                  activeOpacity={0.75}
                  style={{
                    opacity: isOutOfDate ? 0.5 : 1,
                  }}
                >
                  <Text
                    className={`font-semibold ${
                      isOutOfDate ? "text-gray-400" : "text-orange-500"
                    }`}
                    style={{ fontSize: isSmallDevice ? 13 : 14 }}
                  >
                    {isOutOfDate
                      ? t("eventDetails.eventEnded")
                      : t("eventDetails.invite")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="mt-6 flex-row items-center justify-between bg-orange-50 rounded-xl p-3">
            <TouchableOpacity
              className="flex-row items-center flex-1"
              onPress={() =>
                navigation.navigate("OrganizerProfile", {
                  organizer: displayEvent.organizer,
                })
              }
              activeOpacity={0.75}
            >
              <Image
                source={{
                  uri: displayEvent.organizer?.avatar || DEFAULT_AVATAR,
                }}
                className="rounded-full bg-gray-200"
                style={{
                  width: isSmallDevice ? 44 : 50,
                  height: isSmallDevice ? 44 : 50,
                }}
              />

              <View className="ml-3 flex-1">
                <Text
                  numberOfLines={1}
                  className="font-semibold text-gray-800"
                  style={{ fontSize: isSmallDevice ? 14 : 15 }}
                >
                  {displayEvent.organizer?.name || "Unknown Organizer"}
                </Text>

                <Text
                  numberOfLines={1}
                  className="text-gray-500"
                  style={{ fontSize: isSmallDevice ? 12 : 13 }}
                >
                  {t("eventDetails.eventOrganizer")}
                </Text>
              </View>
            </TouchableOpacity>

            {!isOwnEvent && !isAdmin && (
              <TouchableOpacity
                className="bg-white rounded-full items-center justify-center shadow"
                style={{
                  width: isSmallDevice ? 38 : 42,
                  height: isSmallDevice ? 38 : 42,
                }}
                onPress={handleChatWithOrganizer}
                activeOpacity={0.75}
              >
                <Ionicons name="chatbubble-outline" size={22} color="#555" />
              </TouchableOpacity>
            )}
          </View>

          <View className="mt-6">
            <Text
              className="font-semibold text-gray-900"
              style={{ fontSize: isSmallDevice ? 17 : 18 }}
            >
              {t("eventDetails.description")}
            </Text>

            <Text
              className="text-gray-600 mt-2 leading-6"
              style={{ fontSize: isSmallDevice ? 13 : 14 }}
            >
              {displayEvent.description || t("eventDetails.noDescription")}
            </Text>
          </View>

          {displayEvent.ticketTiers &&
            displayEvent.ticketTiers.length > 0 && (
              <View className="mt-6">
                <Text
                  className="font-semibold text-gray-900 mb-3"
                  style={{ fontSize: isSmallDevice ? 17 : 18 }}
                >
                  {t("eventDetails.ticketTiers")}
                </Text>

                <View className="flex-row flex-wrap" style={{ gap: 10 }}>
                  {displayEvent.ticketTiers.map(
                    (tier: any, index: number) => {
                      const available = Number(tier.quota || 0) - Number(tier.sold || 0);
                      const isSoldOut = available <= 0;

                      return (
                        <View
                          key={`${tier.name}-${index}`}
                          className={`rounded-xl border-2 ${
                            isSoldOut
                              ? "border-gray-300 bg-gray-100"
                              : "border-orange-500 bg-orange-50"
                          }`}
                          style={{
                            width: isTablet ? "31%" : "48%",
                            padding: isSmallDevice ? 10 : 12,
                          }}
                        >
                          <Text
                            numberOfLines={1}
                            className="font-semibold text-gray-900"
                            style={{ fontSize: isSmallDevice ? 14 : 16 }}
                          >
                            {tier.name}
                          </Text>

                          <Text
                            className="text-orange-600 font-bold mt-1"
                            style={{ fontSize: isSmallDevice ? 13 : 14 }}
                          >
                            ${Number(tier.price || 0).toFixed(2)}
                          </Text>

                          <Text
                            className={`mt-1 ${
                              isSoldOut ? "text-red-600" : "text-gray-600"
                            }`}
                            style={{ fontSize: isSmallDevice ? 11 : 12 }}
                          >
                            {isSoldOut
                              ? t("eventDetails.soldOut")
                              : `${available}/${tier.quota} ${t(
                                  "eventDetails.available"
                                )}`}
                          </Text>
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            )}
        </View>
      </ScrollView>

      <View
        className="bg-white border-t border-gray-100"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 12,
          paddingBottom: Platform.OS === "ios" ? 24 : 16,
        }}
      >
        {isAdmin ? (
          displayEvent.approvalStatus === "PENDING" ? (
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity
                className="flex-1 bg-green-500 rounded-2xl flex-row items-center justify-center"
                style={{ height: bottomButtonHeight }}
                onPress={handleApproveEvent}
                disabled={approvingOrRejecting}
                activeOpacity={0.85}
              >
                {approvingOrRejecting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={22} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      {t("eventDetails.approve")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-red-500 rounded-2xl flex-row items-center justify-center"
                style={{ height: bottomButtonHeight }}
                onPress={handleRejectEvent}
                disabled={approvingOrRejecting}
                activeOpacity={0.85}
              >
                {approvingOrRejecting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={22} color="white" />
                    <Text className="text-white font-semibold ml-2">
                      {t("eventDetails.reject")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-gray-400 rounded-2xl items-center justify-center"
              style={{ height: bottomButtonHeight }}
              disabled
            >
              <Text className="text-white font-semibold">
                {displayEvent.approvalStatus === "ACCEPTED"
                  ? t("eventDetails.approved")
                  : t("eventDetails.rejected")}
              </Text>
            </TouchableOpacity>
          )
        ) : isOwnEvent ? (
          <TouchableOpacity
            className="bg-orange-500 rounded-2xl flex-row items-center justify-center"
            style={{ height: bottomButtonHeight }}
            onPress={() =>
              navigation.navigate("CheckIn", {
                eventId: displayEvent._id,
                eventTitle: displayEvent.title,
              })
            }
            activeOpacity={0.85}
          >
            <Ionicons name="qr-code" size={22} color="white" />
            <Text className="text-white font-semibold ml-2">
              {t("eventDetails.checkInTickets")}
            </Text>
          </TouchableOpacity>
        ) : loadingTicket ? (
          <View
            className="bg-gray-300 rounded-2xl items-center justify-center"
            style={{ height: bottomButtonHeight }}
          >
            <ActivityIndicator color="white" />
          </View>
        ) : isBooked ? (
          <TouchableOpacity
            className="bg-black rounded-2xl flex-row items-center justify-center"
            style={{
              height: bottomButtonHeight,
              opacity: isOutOfDate ? 0.5 : 1,
            }}
            onPress={handleBooked}
            disabled={isOutOfDate}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={22} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isOutOfDate
                ? t("eventDetails.eventEnded")
                : t("eventDetails.buyMore")}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="bg-black rounded-2xl flex-row items-center justify-center"
            style={{
              height: bottomButtonHeight,
              opacity: isOutOfDate ? 0.5 : 1,
            }}
            onPress={handleBooked}
            disabled={isOutOfDate}
            activeOpacity={0.85}
          >
            <Ionicons name="ticket-outline" size={22} color="white" />
            <Text className="text-white font-semibold ml-2">
              {isOutOfDate
                ? t("eventDetails.eventEnded")
                : t("eventDetails.buyTicket")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}