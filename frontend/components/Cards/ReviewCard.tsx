import React from "react";
import { View, useWindowDimensions } from "react-native";
import { Card, Avatar, Text, IconButton } from "react-native-paper";
import { ReviewCardProps } from "../Interface/ReviewCardProps";

export const ReviewCard: React.FC<ReviewCardProps> = ({ name, date, rating, comment }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;

  return (
    <Card className="rounded-2xl shadow-sm bg-white" style={{ margin: isSmall ? 8 : 12 }}>
      <Card.Title
        title={name}
        subtitle={date}
        titleNumberOfLines={1}
        subtitleNumberOfLines={1}
        left={(props) => <Avatar.Text {...props} size={isSmall ? 38 : 44} label={name.charAt(0)} />}
        titleStyle={{ fontSize: isSmall ? 14 : 16 }}
        subtitleStyle={{ fontSize: isSmall ? 11 : 12 }}
      />
      <View className="flex-row items-center flex-wrap" style={{ marginHorizontal: isSmall ? 4 : 8 }}>
        {[...Array(5)].map((_, i) => (
          <IconButton
            key={i}
            icon={i < rating ? "star" : "star-outline"}
            size={isSmall ? 18 : 20}
            iconColor={i < rating ? "#FFD700" : "#BDBDBD"}
            style={{ margin: isSmall ? 0 : 2 }}
          />
        ))}
      </View>

      <Card.Content>
        <Text variant="bodyMedium" className="text-gray-600 mt-2" style={{ fontSize: isSmall ? 13 : 14 }}>
          {comment}
        </Text>
      </Card.Content>
    </Card>
  );
};
