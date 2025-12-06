import React from "react";
import { View } from "react-native";
import { Card, Avatar, Text, IconButton } from "react-native-paper";
import { ReviewCardProps } from "../Interface/ReviewCardProps";


export const ReviewCard: React.FC<ReviewCardProps> = ({
  name,
  date,
  rating,
  comment,
}) => {
  return (
    <Card className="m-3 rounded-2xl shadow-sm bg-white">
      <Card.Title
        title={name}
        subtitle={date}
        left={(props) => <Avatar.Text {...props} label={name.charAt(0)} />}
      />
      <View className="flex-row items-center mr-2">
            {[...Array(5)].map((_, i) => (
              <IconButton
                key={i}
                icon={i < rating ? "star" : "star-outline"}
                size={20}
                iconColor={i < rating ? "#FFD700" : "#BDBDBD"}
              />
            ))}
          </View>

      <Card.Content>
        <Text variant="bodyMedium" className="text-gray-600 mt-2">
          {comment}
        </Text>
      </Card.Content>
    </Card>
  );
};
