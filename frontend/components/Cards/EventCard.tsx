import React from "react";
import { View, Image, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/colors";
import { EventCardProps } from "../Interface/EventCardProps";
import { useNavigation } from "@react-navigation/native";
import { formatDateTime } from "../../utils/utils";
import { deleteEvent } from "../../services/event.service";

interface EventCardProp extends EventCardProps {
  onDelete?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProp> = (props) => {
  const { onDelete, ...event } = props;
  const navigation = useNavigation<any>();

  const handleEdit = () => {
    // Only allow editing PENDING events
    if (event.approvalStatus !== "PENDING") {
      Alert.alert(
        "Cannot Edit",
        `You can only edit PENDING events. This event is ${event.approvalStatus}.`
      );
      return;
    }

    navigation.navigate("CreateEditEvent", {
      isEdit: true,
      event,
    });
  };

  const handleDelete = () => {
    // Only allow deleting PENDING events
    if (event.approvalStatus !== "PENDING") {
      Alert.alert(
        "Cannot Delete",
        `You can only delete PENDING events. This event is ${event.approvalStatus}.`
      );
      return;
    }

    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteEvent(event._id);
              onDelete?.(event._id);
              Alert.alert("Success", "Event deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete event");
              console.error("Delete event error:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const getApprovalStatusColor = () => {
    switch (event.approvalStatus) {
      case "PENDING":
        return { backgroundColor: "#FBBF24" }; // yellow-400
      case "ACCEPTED":
        return { backgroundColor: "#22C55E" }; // green-500
      case "REJECTED":
        return { backgroundColor: "#EF4444" }; // red-500
      default:
        return { backgroundColor: "#9CA3AF" }; // gray-400
    }
  };

  const getApprovalStatusTextColor = () => {
    switch (event.approvalStatus) {
      case "PENDING":
        return { color: "#713F12" }; // yellow-900
      case "ACCEPTED":
        return { color: "#15803D" }; // green-900
      case "REJECTED":
        return { color: "#7F1D1D" }; // red-900
      default:
        return { color: "#111827" }; // gray-900
    }
  };

  const isEditDisabled = event.approvalStatus !== "PENDING";
  const isEventAccepted = event.approvalStatus === "ACCEPTED";
  
  // Safely parse date - handle both Date objects and strings
  const parseEventDate = () => {
    try {
      const date = typeof event.date === 'string' 
        ? new Date(event.date)
        : event.date;
      return date;
    } catch (error) {
      console.warn('Failed to parse event date:', event.date, error);
      return new Date(0); // Return past date on error
    }
  };
  
  const eventDate = parseEventDate();
  const isEventUpcoming = eventDate >= new Date();
  
  const handleCheckIn = () => {
    navigation.navigate("CheckIn", {
      eventId: event._id,
      eventTitle: event.title
    } as never);
  };

  return (
    <View
      className="bg-white rounded-2xl shadow-md overflow-hidden mb-4 w-full"
      style={{ shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
    >
      {/* Image Container with Status Badge */}
      <View className="relative">
        <Image
          source={{ uri: event.images }}
          className="w-full h-44 bg-gray-200"
          resizeMode="cover"
        />
        
        {/* Approval Status Badge */}
        <View
          style={[
            { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, position: "absolute", top: 8, right: 8 },
            getApprovalStatusColor(),
          ]}
        >
          <Text
            style={[
              { fontSize: 12, fontWeight: "600" },
              getApprovalStatusTextColor(),
            ]}
          >
            {event.approvalStatus}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-base font-semibold text-primary" numberOfLines={1}>
          {event.title}
        </Text>

        <View className="flex-row items-center mt-2">
          <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1">
            {formatDateTime(event.date)}
          </Text>
        </View>

        <View className="flex-row items-center mt-1">
          <Ionicons name="location-outline" size={16} color={Colors.primary} />
          <Text className="text-gray-500 ml-1" numberOfLines={1}>
            {event.location}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-gray-400">
            {event.attendees || 0} joined
          </Text>

          {/* Action Buttons */}
          <View className="flex-row gap-2 items-center">
            {/* Check-in QR Button - Only for ACCEPTED and upcoming events */}
            {isEventAccepted && isEventUpcoming && (
              <TouchableOpacity
                onPress={handleCheckIn}
                className="bg-slate-900 rounded-full justify-center items-center"
                style={{ width: 40, height: 40 }}
              >
                <Ionicons name="qr-code" size={20} color="white" />
              </TouchableOpacity>
            )}

            {/* Delete Button - Only for PENDING */}
            {event.approvalStatus === "PENDING" && (
              <TouchableOpacity
                onPress={handleDelete}
                className="bg-red-500 rounded-full justify-center items-center"
                style={{ width: 40, height: 40 }}
              >
                <Ionicons name="trash" size={20} color="white" />
              </TouchableOpacity>
            )}

            {/* Edit Button */}
            <TouchableOpacity
              onPress={handleEdit}
              disabled={isEditDisabled}
              className={`rounded-full px-4 py-2 ${
                isEditDisabled ? "bg-gray-300" : "bg-primary"
              }`}
            >
              <Text
                className={`font-semibold text-sm ${
                  isEditDisabled ? "text-gray-500" : "text-white"
                }`}
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

