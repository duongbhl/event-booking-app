import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";

import { CATEGORIES } from "../Home";
import EventCategoryBar from "../../components/Bars/EventCategoryBar";

type TimeOption = "Tomorrow" | "This week" | "This month";

type SearchFilter = {
  category?: string;
  time?: TimeOption;
  date?: Date;
  minPrice?: number;
  maxPrice?: number;
};

const timeOptions: TimeOption[] = ["Tomorrow", "This week", "This month"];

export default function Filter() {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 32 : isSmallDevice ? 16 : 20;
  const inputHeight = isSmallDevice ? 48 : 52;

  const [selectedCategory, setSelectedCategory] = useState<string>("music");
  const [selectedTime, setSelectedTime] = useState<TimeOption>("Tomorrow");

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState<Date>(new Date());

  const [minPrice, setMinPrice] = useState("0");
  const [maxPrice, setMaxPrice] = useState("120");

  const formattedDate = useMemo(() => {
    return date.toLocaleDateString("en-GB");
  }, [date]);

  const minPriceValue = useMemo(() => {
    return Number(minPrice.replace(/[^0-9]/g, "")) || 0;
  }, [minPrice]);

  const maxPriceValue = useMemo(() => {
    return Number(maxPrice.replace(/[^0-9]/g, "")) || 0;
  }, [maxPrice]);

  const isPriceValid = maxPriceValue >= minPriceValue;

  const handleApply = useCallback(() => {
    const filters: SearchFilter = {
      category: selectedCategory,
      time: selectedTime,
      date,
      minPrice: minPriceValue,
      maxPrice: maxPriceValue,
    };

    navigation.navigate("Search", { filters });
  }, [
    navigation,
    selectedCategory,
    selectedTime,
    date,
    minPriceValue,
    maxPriceValue,
  ]);

  const handleReset = useCallback(() => {
    setSelectedCategory("music");
    setSelectedTime("Tomorrow");
    setMinPrice("0");
    setMaxPrice("120");
    setDate(new Date());
  }, []);

  const handleMinPriceChange = useCallback((value: string) => {
    setMinPrice(value.replace(/[^0-9]/g, ""));
  }, []);

  const handleMaxPriceChange = useCallback((value: string) => {
    setMaxPrice(value.replace(/[^0-9]/g, ""));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View
          className="flex-1"
          style={{
            paddingHorizontal: horizontalPadding,
          }}
        >
          <View
            className="flex-row items-center"
            style={{
              marginTop: isSmallDevice ? 6 : 10,
              marginBottom: 18,
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              hitSlop={10}
              activeOpacity={0.7}
              className="p-1"
            >
              <Ionicons
                name="close"
                size={isTablet ? 32 : 28}
                color="black"
              />
            </TouchableOpacity>

            <Text
              numberOfLines={1}
              className="font-semibold flex-1 text-center"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
                marginRight: 34,
              }}
            >
              Filter
            </Text>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Platform.OS === "ios" ? 120 : 100,
            }}
          >
            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: isSmallDevice ? 15 : 16,
              }}
            >
              Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingRight: horizontalPadding,
              }}
            >
              {CATEGORIES.map((cat) => (
                <EventCategoryBar
                  key={cat.key}
                  title={cat.label}
                  iconKey={cat.key}
                  active={selectedCategory === cat.key}
                  onPress={() => setSelectedCategory(cat.key)}
                />
              ))}
            </ScrollView>

            <Text
              className="font-semibold mb-3"
              style={{
                marginTop: 24,
                fontSize: isSmallDevice ? 15 : 16,
              }}
            >
              Time and Date
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingRight: horizontalPadding,
              }}
              style={{
                marginBottom: 14,
              }}
            >
              {timeOptions.map((option) => {
                const isActive = selectedTime === option;

                return (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedTime(option)}
                    activeOpacity={0.75}
                    className={`rounded-full border mr-3 ${
                      isActive
                        ? "bg-orange-500 border-orange-500"
                        : "border-gray-300 bg-white"
                    }`}
                    style={{
                      paddingHorizontal: isSmallDevice ? 14 : 18,
                      paddingVertical: isSmallDevice ? 8 : 10,
                    }}
                  >
                    <Text
                      className={isActive ? "text-white" : "text-gray-700"}
                      style={{
                        fontSize: isSmallDevice ? 13 : 14,
                        fontWeight: "600",
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              activeOpacity={0.75}
              className="border border-gray-300 rounded-xl flex-row justify-between items-center"
              style={{
                height: inputHeight,
                paddingHorizontal: 16,
                marginBottom: 22,
              }}
            >
              <Text
                className="text-gray-700"
                style={{
                  fontSize: isSmallDevice ? 14 : 15,
                }}
              >
                {formattedDate}
              </Text>

              <Ionicons name="calendar-outline" size={21} color="gray" />
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={date}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selected) => {
                  if (Platform.OS === "android") {
                    setShowPicker(false);
                  }

                  if (selected) {
                    setDate(selected);
                  }
                }}
              />
            )}

            {Platform.OS === "ios" && showPicker && (
              <TouchableOpacity
                onPress={() => setShowPicker(false)}
                activeOpacity={0.8}
                className="bg-orange-500 rounded-xl items-center justify-center mb-5"
                style={{
                  height: 44,
                }}
              >
                <Text className="text-white font-semibold">Done</Text>
              </TouchableOpacity>
            )}

            <Text
              className="font-semibold mb-3"
              style={{
                fontSize: isSmallDevice ? 15 : 16,
              }}
            >
              Select price range
            </Text>

            <View className="flex-row justify-between mb-2">
              <View style={{ width: "48%" }}>
                <Text
                  className="text-gray-500 mb-2"
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                  }}
                >
                  Min Price
                </Text>

                <View
                  className="border border-gray-300 rounded-xl px-4 justify-center"
                  style={{
                    height: inputHeight,
                  }}
                >
                  <TextInput
                    keyboardType="number-pad"
                    value={minPrice}
                    onChangeText={handleMinPriceChange}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-900"
                    style={{
                      fontSize: isSmallDevice ? 14 : 15,
                      paddingVertical: Platform.OS === "ios" ? 10 : 6,
                    }}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View style={{ width: "48%" }}>
                <Text
                  className="text-gray-500 mb-2"
                  style={{
                    fontSize: isSmallDevice ? 12 : 13,
                  }}
                >
                  Max Price
                </Text>

                <View
                  className={`border rounded-xl px-4 justify-center ${
                    isPriceValid ? "border-gray-300" : "border-red-400"
                  }`}
                  style={{
                    height: inputHeight,
                  }}
                >
                  <TextInput
                    keyboardType="number-pad"
                    value={maxPrice}
                    onChangeText={handleMaxPriceChange}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    className="text-gray-900"
                    style={{
                      fontSize: isSmallDevice ? 14 : 15,
                      paddingVertical: Platform.OS === "ios" ? 10 : 6,
                    }}
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>

            {!isPriceValid && (
              <Text
                className="text-red-500 mb-4"
                style={{
                  fontSize: isSmallDevice ? 12 : 13,
                }}
              >
                Max price must be greater than or equal to min price.
              </Text>
            )}

            <View
              className="flex-row justify-between"
              style={{
                marginTop: isPriceValid ? 28 : 12,
                marginBottom: 24,
              }}
            >
              <TouchableOpacity
                onPress={handleReset}
                activeOpacity={0.75}
                className="border border-gray-400 rounded-xl items-center justify-center"
                style={{
                  width: "48%",
                  height: isSmallDevice ? 48 : 52,
                }}
              >
                <Text
                  className="text-gray-700 font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  RESET
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                disabled={!isPriceValid}
                activeOpacity={0.85}
                className="rounded-xl items-center justify-center"
                style={{
                  width: "48%",
                  height: isSmallDevice ? 48 : 52,
                  backgroundColor: "#111111",
                  opacity: isPriceValid ? 1 : 0.45,
                }}
              >
                <Text
                  className="text-white font-semibold"
                  style={{
                    fontSize: isSmallDevice ? 13 : 14,
                  }}
                >
                  APPLY
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}