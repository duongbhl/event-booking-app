import React from "react";
import { View } from "react-native";
import { Card, Avatar, Text, Button } from "react-native-paper";

interface InvitationCardProps {
  name: string;
  message: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  name,
  message,
  onAccept,
  onDecline,
}) => {
  return (
    <Card className="m-3 rounded-2xl shadow-sm bg-white">
      <Card.Title
        title={name}
        left={(props) => <Avatar.Text {...props} label={name.charAt(0)} />}
      />
      <Card.Content>
        <Text variant="bodyMedium" className="text-gray-700 mb-3">
          {message}
        </Text>
        <View className="flex-row justify-end gap-2">
          <Button mode="outlined" onPress={onDecline}>
            Từ chối
          </Button>
          <Button mode="contained" onPress={onAccept}>
            Chấp nhận
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};
