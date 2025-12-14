import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createEvent } from "../../services/event.service";
import { CATEGORIES } from "../Home";

type Errors = {
  eventName?: string;
  eventType?: string;
  location?: string;
  description?: string;
  date?: string;
};

export default function CreateEditEvent() {
  const navigation = useNavigation<any>();
  const route = useRoute() as any;
  const isEdit = route.params?.isEdit || false;

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState<string>("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const [price, setPrice] = useState(0);
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<Errors>({});

  /* ---------------- IMAGE PICKER ---------------- */
  const pickCoverImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!res.canceled) {
      setCoverImage(res.assets[0].uri);
    }
  };

  /* ---------------- VALIDATE FORM ---------------- */
  const validateForm = () => {
    const newErrors: Errors = {};
    const now = new Date();

    if (!eventName.trim()) {
      newErrors.eventName = "Event name is required";
    }

    if (!eventType) {
      newErrors.eventType = "Event type is required";
    }

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!date || date <= now) {
      newErrors.date = "Event date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        title: eventName.trim(),
        description: description.trim(),
        category: eventType,
        price,
        date,
        time: date.toTimeString().split(" ")[0],
        location: location.trim(),
        images: coverImage || undefined,
      };

      await createEvent(payload);

      Alert.alert("Success", "Event created successfully");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Create event failed"
      );
    }
  };

  /* ---------------- FORM VALIDITY ---------------- */
  const isFormValid =
    eventName.trim() &&
    eventType &&
    location.trim() &&
    description.trim() &&
    date > new Date();

  return (
    <>
      {/* ================= CATEGORY MODAL ================= */}
      {showCategoryModal && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          <View className="bg-white w-4/5 rounded-2xl p-4">
            <Text className="text-lg font-semibold mb-4">Select Category</Text>

            {CATEGORIES.map(item => (
              <TouchableOpacity
                key={item.key}
                className="py-3 border-b border-gray-200"
                onPress={() => {
                  setEventType(item.key);
                  setErrors(prev => ({ ...prev, eventType: undefined }));
                  setShowCategoryModal(false);
                }}
              >
                <Text className="text-base">{item.label}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              className="mt-3 py-3 items-center"
              onPress={() => setShowCategoryModal(false)}
            >
              <Text className="text-orange-500 font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= FORM ================= */}
      <ScrollView className="flex-1 bg-white px-5 pt-10">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} />
          </TouchableOpacity>

          <Text className="text-xl font-semibold">Create New Event</Text>
          <View className="w-6" />
        </View>

        {/* Cover Image */}
        <TouchableOpacity
          className="border-2 border-dashed border-orange-400 rounded-2xl h-40 items-center justify-center mb-4"
          onPress={pickCoverImage}
        >
          {coverImage ? (
            <Image
              source={{ uri: coverImage }}
              className="w-full h-full rounded-2xl"
            />
          ) : (
            <View className="items-center">
              <Ionicons name="add" size={30} color="#FF7A00" />
              <Text className="text-gray-400 mt-1">Add Cover Photos</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Event Name */}
        <Text className="font-medium mb-1">Event Name *</Text>
        <TextInput
          className={`border rounded-xl p-3 mb-1 ${errors.eventName ? "border-red-500" : "border-gray-300"
            }`}
          value={eventName}
          onChangeText={(text) => {
            setEventName(text);
            if (errors.eventName)
              setErrors(prev => ({ ...prev, eventName: undefined }));
          }}
          placeholder="Type your event name"
        />
        {errors.eventName && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.eventName}
          </Text>
        )}

        {/* Category */}
        <Text className="font-medium mb-1">Event Type *</Text>
        <TouchableOpacity
          className={`border rounded-xl p-3 mb-1 flex-row justify-between items-center ${errors.eventType ? "border-red-500" : "border-gray-300"
            }`}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text className={eventType ? "text-black" : "text-gray-400"}>
            {eventType
              ? CATEGORIES.find(c => c.key === eventType)?.label
              : "Choose event type"}
          </Text>
          <Ionicons name="chevron-down" size={20} />
        </TouchableOpacity>
        {errors.eventType && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.eventType}
          </Text>
        )}

        {/* Date */}
        <Text className="font-medium mb-1">Select Date and Time *</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className={`border rounded-xl p-3 mb-1 flex-row justify-between items-center ${errors.date ? "border-red-500" : "border-gray-300"
            }`}
        >
          <Text>{date.toLocaleString("en-GB")}</Text>
          <Ionicons name="calendar-outline" size={20} />
        </TouchableOpacity>

        {errors.date && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.date}
          </Text>
        )}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(_, selected) => {
              setShowPicker(false);
              if (selected) {
                setDate(selected);
                if (selected <= new Date()) {
                  setErrors(prev => ({
                    ...prev,
                    date: "Event date must be in the future",
                  }));
                } else {
                  setErrors(prev => ({ ...prev, date: undefined }));
                }
              }
            }}
          />
        )}

        {/* Location */}
        <Text className="font-medium mb-1">Location *</Text>
        <TextInput
          className={`border rounded-xl p-3 mb-1 ${errors.location ? "border-red-500" : "border-gray-300"
            }`}
          value={location}
          onChangeText={(text) => {
            setLocation(text);
            if (errors.location)
              setErrors(prev => ({ ...prev, location: undefined }));
          }}
          placeholder="Enter event location"
        />
        {errors.location && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.location}
          </Text>
        )}

        {/* Price */} <Text className="font-medium mb-1">Price</Text>
        <TextInput
          className="border border-gray-300 rounded-xl p-3 mb-4"
          keyboardType="numeric"
          value={price === 0 ? "" : String(price)}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9]/g, "");
            setPrice(Number(numericValue));
          }}
          placeholder="$0"
        />


        {/* Description */}
        <Text className="font-medium mb-1">Event Description *</Text>
        <TextInput
          className={`border rounded-xl p-3 h-28 mb-1 ${errors.description ? "border-red-500" : "border-gray-300"
            }`}
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            if (errors.description)
              setErrors(prev => ({ ...prev, description: undefined }));
          }}
          placeholder="Type your event description..."
          multiline
          textAlignVertical="top"
        />
        {errors.description && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.description}
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          disabled={!isFormValid}
          className={`mt-8 rounded-xl py-4 mb-10 ${isFormValid ? "bg-black" : "bg-gray-300"
            }`}
          onPress={handleSubmit}
        >
          <Text className="text-white text-center font-semibold text-lg">
            PUBLISH NOW
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
