import React from "react";
import { View, Text, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { useLocalization } from "../../context/LocalizationContext";
import { UserInviteCardProps } from "../Interface/UserInviteCardProps";

export default function UserInviteCard({ name, followers, avatar, status }: UserInviteCardProps) {
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <View className="flex-row items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100" style={{ padding: isSmall ? 10 : 12 }}>
      <View className="flex-row items-center flex-1 min-w-0 pr-2">
        <Image source={{ uri: avatar }} className="rounded-full" style={{ width: isSmall ? 40 : 48, height: isSmall ? 40 : 48 }} />
        <View className="ml-3 flex-1 min-w-0">
          <Text className="font-semibold text-gray-900" numberOfLines={1} style={{ fontSize: isSmall ? 13 : 14 }}>{name}</Text>
          <Text className="text-gray-500" numberOfLines={1} style={{ fontSize: isSmall ? 11 : 13 }}>
            {followers} {t('userInviteCard.followers')}
          </Text>
        </View>
      </View>

      {status === "sent" ? (
        <TouchableOpacity className="bg-orange-500 rounded-full" style={{ paddingHorizontal: isSmall ? 12 : 20, paddingVertical: 8 }} activeOpacity={0.85}>
          <Text className="text-white font-medium" style={{ fontSize: isSmall ? 12 : 14 }}>{t('userInviteCard.invite')}</Text>
        </TouchableOpacity>
      ) : (
        <View className="bg-gray-200 rounded-full" style={{ paddingHorizontal: isSmall ? 12 : 20, paddingVertical: 8 }}>
          <Text className="text-gray-600 font-medium" style={{ fontSize: isSmall ? 12 : 14 }}>{t('userInviteCard.sent')}</Text>
        </View>
      )}
    </View>
  );
}
