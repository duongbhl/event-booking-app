import React from "react";
import { View, Image, Text, TouchableOpacity, Alert, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { EventCardProps } from "../Interface/EventCardProps";
import { useNavigation } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import { formatDateTime } from "../../utils/utils";
import { deleteEvent } from "../../services/event.service";

interface EventCardProp extends EventCardProps {
  onDelete?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProp> = (props) => {
  const { onDelete, ...event } = props;
  const navigation = useNavigation<any>();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  const handleEdit = () => {
    if (event.approvalStatus !== "PENDING") {
      Alert.alert(t('eventCard.cannotEdit'), `${t('eventCard.onlyEditPending')} ${event.approvalStatus}.`);
      return;
    }

    navigation.navigate("CreateEditEvent", { isEdit: true, event });
  };

  const handleDelete = () => {
    if (event.approvalStatus !== "PENDING") {
      Alert.alert(t('eventCard.cannotDelete'), `${t('eventCard.onlyDeletePending')} ${event.approvalStatus}.`);
      return;
    }

    Alert.alert(t('eventCard.deleteEvent'), t('eventCard.confirmDelete'), [
      { text: t('common.cancel'), onPress: () => {} },
      {
        text: t('common.delete'),
        onPress: async () => {
          try {
            await deleteEvent(event._id);
            onDelete?.(event._id);
            Alert.alert(t('common.success'), t('eventCard.eventDeletedSuccess'));
          } catch (error) {
            Alert.alert(t('common.error'), t('eventCard.failedDeleteEvent'));
            console.error("Delete event error:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const getApprovalStatusColor = () => {
    switch (event.approvalStatus) {
      case "PENDING": return { backgroundColor: "#FBBF24" };
      case "ACCEPTED": return { backgroundColor: "#22C55E" };
      case "REJECTED": return { backgroundColor: "#EF4444" };
      default: return { backgroundColor: "#9CA3AF" };
    }
  };

  const getApprovalStatusTextColor = () => {
    switch (event.approvalStatus) {
      case "PENDING": return { color: "#713F12" };
      case "ACCEPTED": return { color: "#15803D" };
      case "REJECTED": return { color: "#7F1D1D" };
      default: return { color: "#111827" };
    }
  };

  const isEditDisabled = event.approvalStatus !== "PENDING";
  const isEventAccepted = event.approvalStatus === "ACCEPTED";

  const parseEventDate = () => {
    try {
      return typeof event.date === "string" ? new Date(event.date) : event.date;
    } catch (error) {
      console.warn("Failed to parse event date:", event.date, error);
      return new Date(0);
    }
  };

  const isEventUpcoming = parseEventDate() >= new Date();

  const handleCheckIn = () => {
    navigation.navigate("CheckIn", { eventId: event._id, eventTitle: event.title } as never);
  };

  return (
    <View
      className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 w-full"
      style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
    >
      <View className="relative">
        <Image
          source={{ uri: event.images }}
          className="w-full bg-gray-200"
          style={{ height: isSmall ? 150 : 176 }}
          resizeMode="cover"
        />

        <View
          style={[
            { paddingHorizontal: isSmall ? 10 : 12, paddingVertical: 4, borderRadius: 20, position: "absolute", top: 8, right: 8 },
            getApprovalStatusColor(),
          ]}
        >
          <Text style={[{ fontSize: isSmall ? 11 : 12, fontWeight: "600" }, getApprovalStatusTextColor()]} numberOfLines={1}>
            {event.approvalStatus}
          </Text>
        </View>
      </View>

      <View style={{ padding: isSmall ? 12 : 16 }}>
        <Text className="font-semibold text-primary" style={{ fontSize: isSmall ? 15 : 16 }} numberOfLines={1}>
          {event.title}
        </Text>

        <View className="flex-row items-center mt-2">
          <Ionicons name="calendar-outline" size={isSmall ? 14 : 16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1 flex-1" style={{ fontSize: isSmall ? 12 : 14 }} numberOfLines={1}>
            {formatDateTime(event.date)}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={isSmall ? 14 : 16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1 flex-1" style={{ fontSize: isSmall ? 12 : 14 }} numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-3 gap-2">
          <Text className="text-gray-400 flex-1" style={{ fontSize: isSmall ? 12 : 14 }} numberOfLines={1}>
            {event.attendees || 0} {t('eventCard.joined')}
          </Text>

          <View className="flex-row gap-2 items-center shrink-0">
            {isEventAccepted && isEventUpcoming && (
              <TouchableOpacity
                onPress={handleCheckIn}
                className="bg-slate-900 rounded-full justify-center items-center"
                style={{ width: isSmall ? 36 : 40, height: isSmall ? 36 : 40 }}
                activeOpacity={0.85}
              >
                <Ionicons name="qr-code" size={isSmall ? 18 : 20} color="white" />
              </TouchableOpacity>
            )}

            {event.approvalStatus === "PENDING" && (
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-500 rounded-full justify-center items-center"
                style={{ width: isSmall ? 36 : 40, height: isSmall ? 36 : 40 }}
                activeOpacity={0.85}
              >
                <Ionicons name="trash" size={isSmall ? 18 : 20} color="white" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleEdit}
              disabled={isEditDisabled}
              className={`rounded-full ${isEditDisabled ? "bg-gray-300" : "bg-primary"}`}
              style={{ paddingHorizontal: isSmall ? 12 : 16, paddingVertical: 8 }}
              activeOpacity={0.85}
            >
              <Text
                className={`font-semibold ${isEditDisabled ? "text-gray-500" : "text-white"}`}
                style={{ fontSize: isSmall ? 12 : 14 }}
              >
                {isEditDisabled ? "LOCKED" : "EDIT"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EventCard;
