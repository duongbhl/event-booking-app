import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";

interface EventFormProps {
  isEdit?: boolean;
}

export default function CreateEditEvent() {
  const navigation = useNavigation();
  const route = useRoute() as any;
  const isEdit = route.params?.isEdit || false;

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState(
    isEdit ? "International Band Music Concert" : ""
  );
  const [eventType, setEventType] = useState(isEdit ? "Music" : "");
  const [date, setDate] = useState<Date>(new Date());
  const [price,setPrice] = useState(isEdit ? 'Enter your price here':'0');
  const [showPicker, setShowPicker] = useState(false);
  const [description, setDescription] = useState(
    isEdit
      ? "Venenatis in lorem faucibus lobortis at. Est odio varius nisl congue aliquam nunc..."
      : ""
  );

  // Pick cover photo
  const pickCoverImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!res.canceled) {
      setCoverImage(res.assets[0].uri);
    }
  };


  return (
    <ScrollView className="flex-1 bg-white px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color="black" />
        </TouchableOpacity>

        <Text className="text-xl font-semibold">
          {isEdit ? "Create New Event" : "Create New Event"}
        </Text>

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

      

      {/* Inputs */}
      <Text className="font-medium mb-1">Event Name *</Text>
      <TextInput
        className="border border-gray-300 rounded-xl p-3 mb-4"
        value={eventName}
        onChangeText={setEventName}
        placeholder="Type your event name"
      />

      <Text className="font-medium mb-1">Event Type *</Text>
      <TouchableOpacity className="border border-gray-300 rounded-xl p-3 mb-4 flex-row justify-between items-center">
        <Text className="text-gray-700">
          {eventType || "Choose event type"}
        </Text>
        <Ionicons name="chevron-down" size={20} color="gray" />
      </TouchableOpacity>

      <Text className="font-medium mb-1">Select Date and Time *</Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="border border-gray-300 rounded-xl p-3 mb-4 flex-row justify-between items-center"
      >
        <Text className="text-gray-700">
          {date.toLocaleString("en-GB")}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="gray" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="datetime"
          onChange={(e, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {/* Inputs */}
      <Text className="font-medium mb-1">Price</Text>
      <TextInput
        className="border border-gray-300 rounded-xl p-3 mb-4"
        value={price}
        onChangeText={setPrice}
        placeholder="Type your price here"
      />

      <Text className="font-medium mb-1">Event Description *</Text>
      <TextInput
        className="border border-gray-300 rounded-xl p-3 h-28"
        value={description}
        onChangeText={setDescription}
        placeholder="Type your event description..."
        multiline
      />

      {/* Submit Button */}
      <TouchableOpacity className="bg-black mt-8 rounded-xl py-4 mb-10">
        <Text className="text-white text-center font-semibold text-lg">
          {isEdit ? "SAVE CHANGES" : "PUBLISH NOW"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
