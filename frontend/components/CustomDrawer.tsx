import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function CustomDrawer(props: any) {
  const navigation = useNavigation();
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 22,
      }}
    >
      {/* User */}
      <View className="flex-row items-center mb-10">
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
          className="w-20 h-20 rounded-full mr-4"
        />
        <View>
          <Text className="text-xl font-semibold text-gray-900">
            MD Rafi Islam
          </Text>
          <Text className="text-gray-500 text-sm mt-1">
            rafiislama...@gmail.com
          </Text>
        </View>
      </View>

      {/* SECTION: Notifications */}
      

      <DrawerItem
        label="Notifications"
        icon={() => (
          <Ionicons
            name="notifications-outline" // ⭐ Outline có viền cam
            size={30}
            color="#FF7A00"
          />
        )}
        onPress={() => navigation.navigate('Notifications' as never)}
      />

      {/* SECTION: Add Event */}
      <DrawerItem
        label="Add Event"
        icon={() => (
          <Ionicons
            name="add-circle-outline"
            size={30}
            color="#FF7A00"
          />
        )}
        onPress={() => props.navigation.navigate("CreateEvent")}
      />

      {/* Bookmark */}
      <DrawerItem
        label="Bookmark"
        icon={() => (
          <Ionicons
            name="bookmark-outline" // ⭐ Outline icon viền cam
            size={30}
            color="#FF7A00"
          />
        )}
        onPress={() => {}}
      />

      {/* Settings */}
      <DrawerItem
        label="Settings"
        icon={() => (
          <Ionicons name="settings-outline" size={30} color="#FF7A00" />
        )}
        onPress={() => {}}
      />

      {/* Log out */}
      <DrawerItem
        label="Sign Out"
        icon={() => (
          <Ionicons name="log-out-outline" size={30} color="#FF7A00" />
        )}
        onPress={() => console.log("Logout")}
      />
    </DrawerContentScrollView>
  );
}

/* 🔥 Component Drawer Item — to, đẹp, chuẩn Figma */
const DrawerItem = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-3 mb-2"
      activeOpacity={0.6}
    >
      {/* ICON */}
      <View className="w-10 justify-center items-center">{icon()}</View>

      {/* TEXT */}
      <Text className="ml-2 text-[20px] text-gray-800 font-medium">
        {label}
      </Text>
    </TouchableOpacity>
  );
};
