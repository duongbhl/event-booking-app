import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = TextInputProps & {
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  error?: string | boolean;
  containerClassName?: string;
};

export default function Input({ icon, secureTextEntry, containerClassName, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const isPassword = secureTextEntry;

  return (
    <View className={`flex-row items-center bg-gray-100 rounded-xl px-4 ${containerClassName ?? ''}`} style={{ height: 52 }}>
      {icon ? <Ionicons name={icon as any} size={20} color="#9CA3AF" /> : null}
      <TextInput
        className="flex-1 ml-3 text-base text-gray-900"
        secureTextEntry={isPassword ? !show : false}
        {...rest}
      />
      {isPassword ? (
        <TouchableOpacity onPress={() => setShow(!show)} className="ml-2">
          <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
