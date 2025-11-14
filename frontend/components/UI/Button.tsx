import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'outline';
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({ title, onPress, variant = 'primary', style, loading, disabled }: Props) {
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} disabled={disabled || loading} className="w-full">
        <LinearGradient
          colors={["#FF6B00", "#FF3D00"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="justify-center items-center"
          style={[{ height: 56, borderRadius: 28 }, style]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-lg font-semibold">{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        className="w-full items-center justify-center"
        style={[{ height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#E5E7EB' }, style]}
      >
        {loading ? <ActivityIndicator /> : <Text className="text-gray-700 text-lg font-medium">{title}</Text>}
      </TouchableOpacity>
    );
  }

  // ghost
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} className="w-full items-center justify-center" style={[{ height: 56, borderRadius: 28 }, style]}>
      {loading ? <ActivityIndicator /> : <Text className="text-gray-700 text-lg">{title}</Text>}
    </TouchableOpacity>
  );
}
