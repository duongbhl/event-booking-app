import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useLocalization } from "../../context/LocalizationContext";
import UpcomingEvents from "./EventsUpcoming";
import PastEvents from "./EventsPass";

type TabType = "upcoming" | "past";

export default function Events() {
  const { t } = useLocalization();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 28 : isSmallDevice ? 12 : 16;

  const [tab, setTab] = useState<TabType>("upcoming");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="flex-1"
        style={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isSmallDevice ? 8 : 12,
        }}
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={10}
            activeOpacity={0.7}
            className="p-1"
          >
            <Ionicons
              name="chevron-back"
              size={isTablet ? 32 : 26}
              color="black"
            />
          </TouchableOpacity>

          <Text
            numberOfLines={1}
            className="flex-1 text-center font-semibold"
            style={{
              fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              marginRight: 32,
            }}
          >
            {t("myEventList.events")}
          </Text>
        </View>

        <View
          className="flex-row justify-center mb-5 bg-gray-100 rounded-full p-1"
          style={{
            alignSelf: "center",
            maxWidth: isTablet ? 420 : "100%",
          }}
        >
          <TabButton
            label={t("myEventList.upcoming")}
            active={tab === "upcoming"}
            onPress={() => setTab("upcoming")}
            isSmallDevice={isSmallDevice}
          />

          <TabButton
            label={t("myEventList.pastEvents")}
            active={tab === "past"}
            onPress={() => setTab("past")}
            isSmallDevice={isSmallDevice}
          />
        </View>

        <View
          className="flex-1"
          style={{
            paddingBottom: Platform.OS === "ios" ? 80 : 64,
          }}
        >
          {tab === "upcoming" ? <UpcomingEvents /> : <PastEvents />}
        </View>
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  label,
  active,
  onPress,
  isSmallDevice,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isSmallDevice: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      className={`rounded-full ${active ? "bg-orange-500" : "bg-transparent"}`}
      style={{
        paddingHorizontal: isSmallDevice ? 16 : 22,
        paddingVertical: isSmallDevice ? 8 : 10,
        minWidth: isSmallDevice ? 120 : 140,
      }}
    >
      <Text
        numberOfLines={1}
        className={`text-center font-semibold ${
          active ? "text-white" : "text-gray-700"
        }`}
        style={{
          fontSize: isSmallDevice ? 13 : 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}