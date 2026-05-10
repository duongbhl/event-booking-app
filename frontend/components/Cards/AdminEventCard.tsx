import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "../../context/LocalizationContext";
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
}: AdminEventCardProps) {
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const updatedEvent = await approveEvent(_id);
      Alert.alert(t('common.success'), t('adminEventCard.eventApprovedSuccess'));
      onApproved?.(updatedEvent);
    } catch (error) {
      Alert.alert(t('common.error'), t('adminEventCard.failedApproveEvent'));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = () => {
    Alert.alert(t('adminEventCard.confirmRejection'), t('adminEventCard.confirmRejectEvent'), [
      { text: t('common.cancel'), onPress: () => {} },
      {
        text: t('common.delete'),
        onPress: async () => {
          setLoading(true);
          try {
            const updatedEvent = await rejectEvent(_id);
            Alert.alert(t('common.success'), t('adminEventCard.eventRejectedSuccess'));
            onRejected?.(updatedEvent);
          } catch (error) {
            Alert.alert(t('common.error'), t('adminEventCard.failedRejectEvent'));
            console.error(error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100";
      case "ACCEPTED": return "bg-green-100";
      case "REJECTED": return "bg-red-100";
      default: return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "PENDING": return "text-yellow-700";
      case "ACCEPTED": return "text-green-700";
      case "REJECTED": return "text-red-700";
      default: return "text-gray-700";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const parsedDate = new Date(dateString);
    return parsedDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isExpired = new Date(date) < new Date();

  return (
    <View className="bg-white rounded-xl overflow-hidden shadow-sm mb-3 border border-gray-100">
      <View className="flex-row">
        <Image
          source={{ uri: images || "https://via.placeholder.com/150" }}
          className="bg-gray-200"
          style={{ width: isSmall ? 84 : 96, height: isSmall ? 104 : 116 }}
          resizeMode="cover"
        />

        <View className="flex-1" style={{ padding: isSmall ? 10 : 12 }}>
          <View className="flex-row justify-between items-start mb-2 gap-2">
            <View className="flex-1 min-w-0">
              <Text className="font-semibold text-gray-900 mb-1" style={{ fontSize: isSmall ? 13 : 14 }} numberOfLines={1}>
                {title}
              </Text>
              <View className="flex-row items-center mb-1">
                <Ionicons name="person" size={12} color="#6B7280" />
                <Text className="text-gray-600 ml-1 flex-1" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
                  {organizer?.name || "Unknown"}
                </Text>
              </View>
            </View>

            <View className={`rounded-full ${getStatusColor(approvalStatus)}`} style={{ paddingHorizontal: isSmall ? 6 : 8, paddingVertical: 4 }}>
              <Text className={`font-semibold ${getStatusTextColor(approvalStatus)}`} style={{ fontSize: isSmall ? 9 : 12 }} numberOfLines={1}>
                {approvalStatus}
              </Text>
            </View>
          </View>

          <View className="mb-2">
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={12} color="#6B7280" />
              <Text className="text-gray-600 ml-1 flex-1" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
                {formatDate(date)} at {time}
              </Text>
              {isExpired && approvalStatus === "PENDING" && (
                <Text className="text-red-600 ml-2 font-semibold" style={{ fontSize: isSmall ? 10 : 12 }}>
                  (EXPIRED)
                </Text>
              )}
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={12} color="#6B7280" />
              <Text className="text-gray-600 ml-1 flex-1" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
                {location}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2 flex-1 flex-wrap">
              <View className="bg-orange-100 px-2 py-1 rounded">
                <Text className="font-semibold text-orange-600" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
                  {category}
                </Text>
              </View>
              <Text className="font-semibold text-gray-900" style={{ fontSize: isSmall ? 10 : 12 }} numberOfLines={1}>
                ₫{price?.toLocaleString() || "0"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="border-t border-gray-100 flex-row">
        {approvalStatus === "PENDING" && (
          <TouchableOpacity
            className="flex-1 py-2 px-3 border-r border-gray-100 items-center justify-center bg-green-50"
            onPress={handleApprove}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                <Text className="font-semibold text-green-600" style={{ fontSize: isSmall ? 11 : 12 }}>Accept</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {approvalStatus === "PENDING" && (
          <TouchableOpacity
            className="flex-1 py-2 px-3 items-center justify-center bg-red-50"
            onPress={handleReject}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="close-circle" size={14} color="#DC2626" />
                <Text className="font-semibold text-red-600" style={{ fontSize: isSmall ? 11 : 12 }}>Reject</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {approvalStatus !== "PENDING" && (
          <View className="flex-1 py-2 px-3 items-center justify-center">
            <Text
              className={`font-semibold ${approvalStatus === "ACCEPTED" ? "text-green-600" : "text-red-600"}`}
              style={{ fontSize: isSmall ? 11 : 12 }}
            >
              {approvalStatus === "ACCEPTED" ? "✓ Approved" : "✗ Rejected"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
