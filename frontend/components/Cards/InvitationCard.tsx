import React from "react";
import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useLocalization } from "../../context/LocalizationContext";
import { InvitationCardProps } from "../Interface/InvitationCardProps";
import { formatRelativeTime } from "../../utils/utils";

export const InvitationCard: React.FC<InvitationCardProps> = ({
  avatar,
  name,
  message,
  time,
  type = "invite",
  onAccept,
  onReject,
}) => {
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const displayTime = formatRelativeTime(time, t);
  const hasAvatar = Boolean(avatar && avatar.trim());
  const avatarLabel = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <View className="bg-white rounded-2xl mb-3 shadow-sm flex-row" style={{ padding: isSmall ? 12 : 16 }}>
      {hasAvatar ? (
        <Avatar.Image source={{ uri: avatar }} size={isSmall ? 40 : 48} />
      ) : (
        <Avatar.Text size={isSmall ? 40 : 48} label={avatarLabel} />
      )}

      <View className="flex-1 ml-3 min-w-0">
        <View className="flex-row justify-between gap-2">
          <Text className="font-semibold flex-1" numberOfLines={1} style={{ fontSize: isSmall ? 13 : 14 }}>{name}</Text>
          <Text className="text-gray-400 shrink-0" style={{ fontSize: isSmall ? 9 : 10 }}>{displayTime}</Text>
        </View>
        <Text className="text-gray-600 mt-1" numberOfLines={2} style={{ fontSize: isSmall ? 11 : 12 }}>
          {message}
        </Text>

        {type === "invite" && (
          <View className="flex-row flex-wrap mt-3 gap-2">
            <TouchableOpacity onPress={onReject} className="rounded-lg border border-gray-300" style={{ paddingHorizontal: isSmall ? 12 : 16, paddingVertical: 6 }} activeOpacity={0.85}>
              <Text className="text-gray-600" style={{ fontSize: isSmall ? 12 : 14 }}>{t('invitationCard.reject')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onAccept} className="rounded-lg bg-orange-500" style={{ paddingHorizontal: isSmall ? 12 : 16, paddingVertical: 6 }} activeOpacity={0.85}>
              <Text className="text-white font-semibold" style={{ fontSize: isSmall ? 12 : 14 }}>{t('invitationCard.accept')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default InvitationCard;
