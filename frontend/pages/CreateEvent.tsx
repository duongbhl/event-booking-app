import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { TextInput, Button } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { RouteProp } from "@react-navigation/native";

const EVENT_TYPES = ["Music", "Design", "Art", "Sports", "Food", "Others"];

interface EventData {
  id?: string;
  name: string;
  type: string;
  description: string;
  datetime: string;
  cover: string;
  gallery: string[];
}
export default function CreateEventScreen({ route }: { route: RouteProp<any, any> }) {
  const editData: EventData | undefined = route?.params?.eventData;

  const isEditMode = !!editData;

  // State
  const [cover, setCover] = useState<string | null>(editData?.cover || null);
  const [gallery, setGallery] = useState<string[]>(editData?.gallery || []);
  const [eventName, setEventName] = useState(editData?.name || "");
  const [eventType, setEventType] = useState(editData?.type || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [date, setDate] = useState<Date>(
    editData ? new Date(editData.datetime) : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Pick cover photo
  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCover(result.assets[0].uri);
    }
  };

  // Pick gallery photos
  const pickGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && gallery.length < 4) {
      setGallery([...gallery, result.assets[0].uri]);
    }
  };

  const onSave = () => {
    const eventPayload: EventData = {
      name: eventName,
      type: eventType,
      description,
      datetime: date.toISOString(),
      cover: cover || "",
      gallery,
    };

    if (isEditMode) {
      console.log("Save changes:", eventPayload);
    } else {
      console.log("Publish new event:", eventPayload);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      {/* Header */}
      <View className="flex-row items-center mt-2 mb-4">
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={26} color="#444" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold ml-3">
          {isEditMode ? "Create New Event" : "Create New Event"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* COVER PHOTO */}
        <View className="mb-4">
          {cover ? (
            <TouchableOpacity onPress={pickCover}>
              <Image
                source={{ uri: cover }}
                className="w-full h-44 rounded-xl"
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={pickCover}
              className="w-full h-44 border-2 border-dashed border-orange-400 rounded-xl items-center justify-center"
            >
              <Ionicons name="add" size={26} color="#FF7A00" />
              <Text className="text-orange-500 mt-1">Add Cover Photos</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* GALLERY */}
        <View className="flex-row items-center justify-between mb-6">
          {[...gallery, ""].slice(0, 4).map((img, index) =>
            img ? (
              <Image
                key={index}
                source={{ uri: img }}
                className="w-20 h-20 rounded-lg"
              />
            ) : (
              <TouchableOpacity
                key={index}
                onPress={pickGallery}
                className="w-20 h-20 border border-dashed border-orange-300 rounded-lg items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#FF7A00" />
              </TouchableOpacity>
            )
          )}
        </View>

        {/* EVENT DETAILS */}
        <Text className="text-lg font-semibold mb-2">Event Details</Text>

        {/* Event Name */}
        <Text className="text-sm text-gray-600 mb-1">Event Name *</Text>
        <TextInput
          mode="outlined"
          placeholder="Type your event name"
          value={eventName}
          onChangeText={setEventName}
          className="mb-4 bg-white"
        />

        {/* Event Type */}
        <Text className="text-sm text-gray-600 mb-1">Event Type *</Text>

        <View className="border border-gray-300 rounded-lg px-3 py-3 mb-4 flex-row items-center justify-between">
          <Text className="text-gray-700">
            {eventType || "Choose event type"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#555" />
        </View>

        {/* Quick Select Types */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {EVENT_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setEventType(type)}
              className={`px-4 py-2 rounded-full mr-2 ${
                eventType === type ? "bg-orange-500" : "bg-gray-200"
              }`}
            >
              <Text
                className={`text-sm ${
                  eventType === type ? "text-white" : "text-gray-700"
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* DATE PICKER */}
        <Text className="text-sm text-gray-600 mb-1">Select Date and Time *</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-300 rounded-lg px-3 py-4 flex-row justify-between items-center mb-4"
        >
          <Text className="text-gray-700">
            {date.toLocaleString()}
          </Text>
          <Ionicons name="calendar-outline" size={20} color="#555" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* DESCRIPTION */}
        <Text className="text-sm text-gray-600 mb-1">Event Description *</Text>

        <TextInput
          mode="outlined"
          placeholder="Type your event description..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          className="bg-white mb-8"
        />

        {/* BUTTON */}
        <TouchableOpacity
          onPress={onSave}
          className="bg-black rounded-xl py-4 mb-10"
        >
          <Text className="text-center text-white font-semibold text-lg">
            {isEditMode ? "SAVE CHANGES" : "PUBLISH NOW"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
