import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function Header({ title, onBack, right }: Props) {
  return (
    <View className="flex-row items-center justify-between mt-2">
      <TouchableOpacity onPress={onBack} className="p-1">
        <Ionicons name="chevron-back" size={26} color="#111827" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold">{title}</Text>
      <View style={{ width: 24 }}>{right}</View>
    </View>
  );
}
