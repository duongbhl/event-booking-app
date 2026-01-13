import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventCardProps } from "../Interface/EventCardProps";
import { approveEvent, rejectEvent } from "../../services/event.service";

interface AdminEventCardProps extends EventCardProps {
  onApproved?: (event: EventCardProps) => void;
  onRejected?: (event: EventCardProps) => void;
  onViewDetails?: (eventId: string) => void;
}

export default function AdminEventCard({
  _id,
  title,
  description,
  category,
  date,
  time,
  location,
  price,
  images,
  organizer,
  approvalStatus,
  onApproved,
  onRejected,
  onViewDetails,
}: AdminEventCardProps) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const updatedEvent = await approveEvent(_id);
      Alert.alert("Success", "Event approved successfully!");
      onApproved?.(updatedEvent);
    } catch (error) {
      Alert.alert("Error", "Failed to approve event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    Alert.alert(
      "Confirm Rejection",
      "Are you sure you want to reject this event?",
      [
        { text: "Cancel", onPress: () => {} },
        {
          text: "Reject",
          onPress: async () => {
            setLoading(true);
            try {
              const updatedEvent = await rejectEvent(_id);
              Alert.alert("Success", "Event rejected successfully!");
              onRejected?.(updatedEvent);
            } catch (error) {
              Alert.alert("Error", "Failed to reject event");
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100";
      case "ACCEPTED":
        return "bg-green-100";
      case "REJECTED":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-700";
      case "ACCEPTED":
        return "text-green-700";
      case "REJECTED":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isExpired = new Date(date) < new Date();

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-3 border border-gray-100">
      {/* Card Container */}
      <View className="flex-row">
        {/* Image */}
        <Image
          source={{
            uri: images || "https://via.placeholder.com/150",
          }}
          className="w-24 h-24 bg-gray-200"
        />

        {/* Content */}
        <View className="flex-1 p-3">
          {/* Title and Status */}
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </Text>
              <View className="flex-row items-center mb-1">
                <Ionicons name="person" size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600 ml-1">
                  {organizer?.name || "Unknown"}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View
              className={`px-2 py-1 rounded-full ${getStatusColor(
                approvalStatus
              )}`}
            >
              <Text
                className={`text-xs font-semibold ${getStatusTextColor(
                  approvalStatus
                )}`}
              >
                {approvalStatus}
              </Text>
            </View>
          </View>

          {/* Date, Time, Location */}
          <View className="mb-2">
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1">
                {formatDate(date)} at {time}
              </Text>
              {isExpired && approvalStatus === "PENDING" && (
                <Text className="text-xs text-red-600 ml-2 font-semibold">
                  (EXPIRED)
                </Text>
              )}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-600 ml-1" numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          {/* Price and Category */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="bg-orange-100 px-2 py-1 rounded">
                <Text className="text-xs font-semibold text-orange-600">
                  {category}
                </Text>
              </View>
              <Text className="text-xs font-semibold text-gray-900">
                ₫{price?.toLocaleString() || "0"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="border-t border-gray-100 flex-row">
        {/* View Details Button */}
        <TouchableOpacity
          className="flex-1 py-2 px-3 border-r border-gray-100 items-center justify-center"
          onPress={() => onViewDetails?.(_id)}
          disabled={loading}
        >
          <View className="flex-row items-center gap-1">
            <Ionicons name="eye" size={14} color="#FF7A00" />
            <Text className="text-xs font-semibold text-orange-500">Details</Text>
          </View>
        </TouchableOpacity>

        {/* Accept Button - Only show if PENDING */}
        {approvalStatus === "PENDING" && (
          <TouchableOpacity
            className="flex-1 py-2 px-3 border-r border-gray-100 items-center justify-center bg-green-50"
            onPress={handleApprove}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text className="text-xs font-semibold text-green-600">
                  Accept
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Reject Button - Only show if PENDING */}
        {approvalStatus === "PENDING" && (
          <TouchableOpacity
            className="flex-1 py-2 px-3 items-center justify-center bg-red-50"
            onPress={handleReject}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="close-circle" size={14} color="#DC2626" />
                <Text className="text-xs font-semibold text-red-600">
                  Reject
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Status Info - Show for ACCEPTED or REJECTED */}
        {approvalStatus !== "PENDING" && (
          <View className="flex-1 py-2 px-3 items-center justify-center">
            <Text
              className={`text-xs font-semibold ${
                approvalStatus === "ACCEPTED"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {approvalStatus === "ACCEPTED" ? "✓ Approved" : "✗ Rejected"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
