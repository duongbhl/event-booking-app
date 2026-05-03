import React, { useEffect, useState } from "react";
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

import { createEvent, updateEvent } from "../../services/event.service";
import { uploadImageToCloudinary } from "../../services/upload.service";
import { CATEGORIES } from "../Home";
import TicketTierForm, { ITicketTier } from "../../components/Cards/TicketTierForm";
import { useLocalization } from "../../context/LocalizationContext";



type Errors = {
  eventName?: string;
  eventType?: string;
  location?: string;
  description?: string;
  date?: string;
  ticketTiers?: string;
};

export default function CreateEditEvent() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const isEdit = route.params?.isEdit ?? false;
  const editEvent = route.params?.event;
  const { t } = useLocalization();
  

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [ticketTiers, setTicketTiers] = useState<ITicketTier[]>([]);

  const [showPicker, setShowPicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  /* ---------------- FORMAT DATE (UI ONLY) ---------------- */
  const formatDateTime = (d: Date) => {
    const datePart = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timePart = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${datePart} • ${timePart}`;
  };

  /* ---------------- IMAGE PICKER ---------------- */


  const pickCoverImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };



  /* ---------------- VALIDATE ---------------- */
  const validateForm = () => {
    const newErrors: Errors = {};
    const now = new Date();

    if (!eventName.trim()) newErrors.eventName = t('addEvent.eventName') + " " + t('common.error');
    if (!eventType) newErrors.eventType = t('addEvent.eventType') + " " + t('common.error');
    if (!location.trim()) newErrors.location = t('addEvent.location') + " " + t('common.error');
    if (!description.trim())
      newErrors.description = t('addEvent.description') + " " + t('common.error');
    if (!date || date <= now)
      newErrors.date = t('common.error');
    if (ticketTiers.length === 0)
      newErrors.ticketTiers = t('common.error');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = coverImage || undefined;

      if (coverImage && coverImage.startsWith("file")) {
        imageUrl = await uploadImageToCloudinary(coverImage);
      }

      const payload = {
        title: eventName.trim(),
        description: description.trim(),
        category: eventType,
        date,
        time: date.toTimeString().split(" ")[0],
        location: location.trim(),
        images: imageUrl,
        ticketTiers,
      };

      if (isEdit) {
        await updateEvent(editEvent._id, payload);
        Alert.alert(t('common.success'), t('events.eventUpdated'));
      } else {
        await createEvent(payload);
        Alert.alert(t('common.success'), t('events.eventCreated'));
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), "Submit failed");
      console.log(err);
    }
  };



  const isFormValid =
    !!eventName.trim() &&
    !!eventType &&
    !!location.trim() &&
    !!description.trim() &&
    date > new Date() &&
    ticketTiers.length > 0;

  useEffect(() => {
    if (isEdit && editEvent) {
      setEventName(editEvent.title);
      setEventType(editEvent.category);
      setLocation(editEvent.location);
      setDescription(editEvent.description || "");
      setDate(new Date(editEvent.date));
      setCoverImage(editEvent.images);
      if (editEvent.ticketTiers) {
        setTicketTiers(editEvent.ticketTiers);
      }
    }
  }, [isEdit, editEvent]);


  return (
    <>
      {/* ================= CATEGORY MODAL ================= */}
      {showCategoryModal && (
        <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
          <View className="bg-white w-4/5 rounded-2xl p-4">
            <Text className="text-lg font-semibold mb-4">
              {t('addEvent.events')}
            </Text>

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
              <Text className="text-orange-500 font-semibold">
                {t('addEvent.cancel')}
              </Text>
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
          <Text className="text-xl font-semibold">
            {isEdit ? t('addEvent.editEvent') : t('addEvent.createEvent')}
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
              <Text className="text-gray-400 mt-1">
                {t('addEvent.addCoverImage')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Event Name */}
        <Text className="font-medium mb-1">{t('addEvent.eventName')} *</Text>
        <TextInput
          className={`border rounded-xl p-3 mb-1 ${errors.eventName ? "border-red-500" : "border-gray-300"
            }`}
          value={eventName}
          onChangeText={setEventName}
          placeholder={t('addEvent.typeEventName')}
        />
        {errors.eventName && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.eventName}
          </Text>
        )}

        {/* Category */}
        <Text className="font-medium mb-1">{t('addEvent.eventType')} *</Text>
        <TouchableOpacity
          className={`border rounded-xl p-3 mb-1 flex-row justify-between items-center ${errors.eventType ? "border-red-500" : "border-gray-300"
            }`}
          onPress={() => setShowCategoryModal(true)}
        >
          <Text className={eventType ? "text-black" : "text-gray-400"}>
            {eventType
              ? CATEGORIES.find(c => c.key === eventType)?.label
              : t('addEvent.selectEventType')}
          </Text>
          <Ionicons name="chevron-down" size={20} />
        </TouchableOpacity>
        {errors.eventType && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.eventType}
          </Text>
        )}

        {/* Date */}
        <Text className="font-medium mb-1">{t('addEvent.selectDateTime')} *</Text>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className={`border rounded-xl p-3 mb-1 flex-row justify-between items-center ${errors.date ? "border-red-500" : "border-gray-300"
            }`}
        >
          <Text>{formatDateTime(date)}</Text>
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
              if (selected) setDate(selected);
            }}
          />
        )}

        

        {/* Location */}
        <Text className="font-medium mb-1">{t('addEvent.location')} *</Text>
        <TextInput
          className={`border rounded-xl p-3 mb-1 ${errors.location ? "border-red-500" : "border-gray-300"
            }`}
          value={location}
          onChangeText={setLocation}
          placeholder={t('addEvent.enterEventLocation')}
        />
        {errors.location && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.location}
          </Text>
        )}

        {/* Ticket Tiers */}
        <TicketTierForm
          tiers={ticketTiers}
          onTiersChange={setTicketTiers}
        />
        {errors.ticketTiers && (
          <Text className="text-red-500 text-xs mb-3">
            {errors.ticketTiers}
          </Text>
        )}

        {/* Description */}
        <Text className="font-medium mb-1">{t('addEvent.description')} *</Text>
        <TextInput
          className={`border rounded-xl p-3 h-28 mb-1 ${errors.description ? "border-red-500" : "border-gray-300"
            }`}
          value={description}
          onChangeText={setDescription}
          placeholder={t('addEvent.typeDescription')}
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
            {isEdit ? t('addEvent.updateEvent') : t('addEvent.publishNow')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
