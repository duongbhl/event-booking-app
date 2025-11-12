import { View, Text, Image } from "react-native";

type UserInviteCardProps = {
  name: string;
  followers: string;
  avatar: string;
  status?: "sent" | "accept" | "none";
};

export default function UserInviteCard({
  name,
  followers,
  avatar,
  status = "sent",
}: UserInviteCardProps) {
  return (
    <View className="flex-row items-center bg-white rounded-2xl shadow-md p-3 w-[280px] justify-between">
      <View className="flex-row items-center">
        <Image
          source={{ uri: avatar }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <View>
          <Text className="font-bold text-gray-900">{name}</Text>
          <Text className="text-xs text-gray-500">{followers} Followers</Text>
        </View>
      </View>

      {status === "sent" && (
        <View className="bg-orange-100 px-3 py-1 rounded-xl">
          <Text className="text-orange-500 font-semibold text-xs">Sent</Text>
        </View>
      )}
    </View>
  );
}
