import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createEvent,
  generateEventContent,
  updateEvent,
} from "../../services/event.service";
import { uploadImageToCloudinary } from "../../services/upload.service";
import { CATEGORIES } from "../Home";
import TicketTierForm, {
  ITicketTier,
} from "../../components/Cards/TicketTierForm";
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
  const { t, language } = useLocalization();
  const { width } = useWindowDimensions();
  const routeName = route.name as string;

  const isEdit = route.params?.isEdit ?? false;
  const editEvent = route.params?.event;
  const isTabCreateMode = routeName === "AddEvent" && !isEdit;
  const showBackButton = !isTabCreateMode;

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 36 : isSmallDevice ? 16 : 20;
  const inputHeight = isSmallDevice ? 48 : 52;
  const imageHeight = isTablet ? 220 : isSmallDevice ? 150 : 170;
  const modalWidth = isTablet ? 420 : Math.min(width - 40, 340);

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventType, setEventType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [ticketTiers, setTicketTiers] = useState<ITicketTier[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);

  const formatDateTime = useCallback((d: Date) => {
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
  }, []);

  const isFormValid = useMemo(() => {
    return (
      !!eventName.trim() &&
      !!eventType &&
      !!location.trim() &&
      !!description.trim() &&
      date > new Date() &&
      ticketTiers.length > 0
    );
  }, [eventName, eventType, location, description, date, ticketTiers]);

  useEffect(() => {
    if (isEdit && editEvent) {
      setEventName(editEvent.title || "");
      setEventType(editEvent.category || "");
      setLocation(editEvent.location || "");
      setDescription(editEvent.description || "");
      setDate(new Date(editEvent.date));
      setCoverImage(editEvent.images || null);

      if (editEvent.ticketTiers) {
        setTicketTiers(editEvent.ticketTiers);
      }
    }
  }, [isEdit, editEvent]);

  const pickCoverImage = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(t("common.error"), "Image permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  }, [t]);

  const validateForm = useCallback(() => {
    const newErrors: Errors = {};
    const now = new Date();

    if (!eventName.trim()) {
      newErrors.eventName = `${t("addEvent.eventName")} ${t("common.error")}`;
    }

    if (!eventType) {
      newErrors.eventType = `${t("addEvent.eventType")} ${t("common.error")}`;
    }

    if (!location.trim()) {
      newErrors.location = `${t("addEvent.location")} ${t("common.error")}`;
    }

    if (!description.trim()) {
      newErrors.description = `${t("addEvent.description")} ${t(
        "common.error"
      )}`;
    }

    if (!date || date <= now) {
      newErrors.date = t("common.error");
    }

    if (ticketTiers.length === 0) {
      newErrors.ticketTiers = t("common.error");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [eventName, eventType, location, description, date, ticketTiers, t]);

  const handleGenerateWithAI = useCallback(async () => {
    if (!eventType) {
      setErrors((prev) => ({ ...prev, eventType: t("common.error") }));
      Alert.alert(t("common.error"), t("addEvent.aiCategoryRequired"));
      return;
    }

    try {
      setGeneratingContent(true);

      const suggestion = await generateEventContent({
        category: eventType,
        location: location.trim() || undefined,
        date: date.toISOString(),
        title: eventName.trim() || undefined,
        description: description.trim() || undefined,
        prompt: aiPrompt.trim() || undefined,
        language,
      });

      setEventName(suggestion.title);
      setDescription(suggestion.description);
      setTicketTiers(
        suggestion.ticketTiers.map((tier) => ({
          ...tier,
          sold: 0,
        }))
      );
      setErrors((prev) => ({
        ...prev,
        eventName: undefined,
        description: undefined,
        ticketTiers: undefined,
      }));

      Alert.alert(t("common.success"), t("addEvent.aiGeneratedSuccess"));
    } catch (error) {
      console.log("Generate event content error:", error);
      Alert.alert(t("common.error"), t("addEvent.aiGeneratedFailed"));
    } finally {
      setGeneratingContent(false);
    }
  }, [aiPrompt, date, description, eventName, eventType, language, location, t]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm() || submitting) return;

    try {
      setSubmitting(true);

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
        Alert.alert(t("common.success"), t("events.eventUpdated"));
        navigation.goBack();
      } else {
        await createEvent(payload);
        Alert.alert(t("common.success"), t("events.eventCreated"));

        setCoverImage(null);
        setEventName("");
        setEventType("");
        setLocation("");
        setDescription("");
        setAiPrompt("");
        setDate(new Date());
        setTicketTiers([]);
        setErrors({});

        if (routeName === "AddEvent") {
          navigation.navigate("Home");
        } else {
          navigation.goBack();
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert(t("common.error"), "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }, [
    validateForm,
    submitting,
    coverImage,
    eventName,
    description,
    eventType,
    date,
    location,
    ticketTiers,
    isEdit,
    editEvent?._id,
    t,
    navigation,
    routeName,
  ]);

  const selectCategory = useCallback((key: string) => {
    setEventType(key);
    setErrors((prev) => ({ ...prev, eventType: undefined }));
    setShowCategoryModal(false);
  }, []);

  const openLocationPicker = useCallback(() => {
    if (submitting) return;

    navigation.navigate("SelectLocation", {
      fromAddEvent: true,
      returnToRoute: routeName,
      selectedLocation: location,
      onSelectLocation: (value: string) => {
        setLocation(value);
        setErrors((prev) => ({ ...prev, location: undefined }));
      },
    });
  }, [navigation, location, routeName, submitting]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <Modal
          transparent
          visible={showCategoryModal}
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View className="flex-1 bg-black/40 justify-center items-center px-5">
            <TouchableOpacity
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowCategoryModal(false)}
            />

            <View
              className="bg-white rounded-2xl p-4"
              style={{ width: modalWidth }}
            >
              <Text
                className="font-semibold mb-4"
                style={{
                  fontSize: isSmallDevice ? 17 : 18,
                }}
              >
                {t("addEvent.events")}
              </Text>

              {CATEGORIES.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  className="py-3 border-b border-gray-200 flex-row justify-between items-center"
                  activeOpacity={0.75}
                  onPress={() => selectCategory(item.key)}
                >
                  <Text
                    className="text-gray-900"
                    style={{
                      fontSize: isSmallDevice ? 14 : 15,
                    }}
                  >
                    {item.label}
                  </Text>

                  {eventType === item.key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FF7A00"
                    />
                  )}
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="mt-3 py-3 items-center"
                activeOpacity={0.75}
                onPress={() => setShowCategoryModal(false)}
              >
                <Text className="text-orange-500 font-semibold">
                  {t("addEvent.cancel")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView
          className="flex-1 bg-white"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            paddingHorizontal: horizontalPadding,
            paddingTop: isSmallDevice ? 8 : 12,
            paddingBottom: Platform.OS === "ios" ? 120 : 90,
          }}
        >
          <View className="flex-row justify-between items-center mb-6">
            {showBackButton ? (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                hitSlop={10}
                activeOpacity={0.7}
                className="p-1"
              >
                <Ionicons name="chevron-back" size={isTablet ? 32 : 26} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: isTablet ? 32 : 26 }} />
            )}

            <Text
              numberOfLines={1}
              className="font-semibold flex-1 text-center mx-3"
              style={{
                fontSize: isTablet ? 24 : isSmallDevice ? 18 : 20,
              }}
            >
              {isEdit ? t("addEvent.editEvent") : t("addEvent.createEvent")}
            </Text>

            <View style={{ width: isTablet ? 32 : 26 }} />
          </View>

          <TouchableOpacity
            className="border-2 border-dashed border-orange-400 rounded-2xl items-center justify-center mb-4 overflow-hidden"
            activeOpacity={0.75}
            onPress={pickCoverImage}
            style={{ height: imageHeight }}
          >
            {coverImage ? (
              <Image
                source={{ uri: coverImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Ionicons name="add" size={30} color="#FF7A00" />
                <Text
                  className="text-gray-400 mt-1"
                  style={{ fontSize: isSmallDevice ? 13 : 14 }}
                >
                  {t("addEvent.addCoverImage")}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <FieldLabel label={`${t("addEvent.eventName")} *`} />
          <TextInput
            className={`border rounded-xl px-4 mb-1 ${
              errors.eventName ? "border-red-500" : "border-gray-300"
            }`}
            style={{
              height: inputHeight,
              fontSize: isSmallDevice ? 14 : 15,
              paddingVertical: Platform.OS === "ios" ? 10 : 6,
            }}
            value={eventName}
            onChangeText={(text) => {
              setEventName(text);
              if (errors.eventName) {
                setErrors((prev) => ({ ...prev, eventName: undefined }));
              }
            }}
            placeholder={t("addEvent.typeEventName")}
            placeholderTextColor="#9CA3AF"
            editable={!submitting}
          />
          <ErrorText error={errors.eventName} />

          <FieldLabel label={t("addEvent.aiBriefLabel")} />
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 mb-4"
            style={{
              minHeight: isSmallDevice ? 84 : 96,
              fontSize: isSmallDevice ? 14 : 15,
            }}
            value={aiPrompt}
            onChangeText={setAiPrompt}
            placeholder={t("addEvent.aiBriefPlaceholder")}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            editable={!submitting && !generatingContent}
          />

          <TouchableOpacity
            disabled={submitting || generatingContent}
            className="rounded-xl items-center justify-center mb-5 border border-orange-400 bg-orange-50"
            activeOpacity={0.85}
            style={{
              height: isSmallDevice ? 46 : 50,
              opacity: submitting ? 0.65 : 1,
            }}
            onPress={handleGenerateWithAI}
          >
            {generatingContent ? (
              <ActivityIndicator color="#FF7A00" />
            ) : (
              <Text
                className="text-orange-500 font-semibold"
                style={{ fontSize: isSmallDevice ? 14 : 15 }}
              >
                {t("addEvent.generateWithAI")}
              </Text>
            )}
          </TouchableOpacity>

          <FieldLabel label={`${t("addEvent.eventType")} *`} />
          <TouchableOpacity
            className={`border rounded-xl px-4 mb-1 flex-row justify-between items-center ${
              errors.eventType ? "border-red-500" : "border-gray-300"
            }`}
            activeOpacity={0.75}
            style={{ height: inputHeight }}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              numberOfLines={1}
              className={eventType ? "text-black flex-1" : "text-gray-400 flex-1"}
              style={{ fontSize: isSmallDevice ? 14 : 15 }}
            >
              {eventType
                ? CATEGORIES.find((c) => c.key === eventType)?.label
                : t("addEvent.selectEventType")}
            </Text>

            <Ionicons name="chevron-down" size={20} />
          </TouchableOpacity>
          <ErrorText error={errors.eventType} />

          <FieldLabel label={`${t("addEvent.selectDateTime")} *`} />
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className={`border rounded-xl px-4 mb-1 flex-row justify-between items-center ${
              errors.date ? "border-red-500" : "border-gray-300"
            }`}
            activeOpacity={0.75}
            style={{ height: inputHeight }}
          >
            <Text
              numberOfLines={1}
              className="text-gray-900 flex-1"
              style={{ fontSize: isSmallDevice ? 14 : 15 }}
            >
              {formatDateTime(date)}
            </Text>

            <Ionicons name="calendar-outline" size={20} />
          </TouchableOpacity>
          <ErrorText error={errors.date} />

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              minimumDate={new Date()}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(_, selected) => {
                if (Platform.OS === "android") setShowPicker(false);

                if (selected) {
                  setDate(selected);
                  setErrors((prev) => ({ ...prev, date: undefined }));
                }
              }}
            />
          )}

          {Platform.OS === "ios" && showPicker && (
            <TouchableOpacity
              className="bg-orange-500 rounded-xl items-center justify-center mb-4"
              activeOpacity={0.85}
              style={{ height: 44 }}
              onPress={() => setShowPicker(false)}
            >
              <Text className="text-white font-semibold">Done</Text>
            </TouchableOpacity>
          )}

          <FieldLabel label={`${t("addEvent.location")} *`} />
          <TouchableOpacity
            className={`border rounded-xl px-4 mb-1 flex-row justify-between items-center ${
              errors.location ? "border-red-500" : "border-gray-300"
            }`}
            activeOpacity={0.75}
            style={{
              height: inputHeight,
            }}
            onPress={openLocationPicker}
            disabled={submitting}
          >
            <Text
              numberOfLines={1}
              className={location ? "text-gray-900 flex-1" : "text-gray-400 flex-1"}
              style={{ fontSize: isSmallDevice ? 14 : 15 }}
            >
              {location || t("addEvent.enterEventLocation")}
            </Text>

            <Ionicons name="location-outline" size={20} color="#FF7A00" />
          </TouchableOpacity>
          <ErrorText error={errors.location} />

          <TicketTierForm tiers={ticketTiers} onTiersChange={setTicketTiers} />
          <ErrorText error={errors.ticketTiers} />

          <FieldLabel label={`${t("addEvent.description")} *`} />
          <TextInput
            className={`border rounded-xl px-4 py-3 mb-1 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            style={{
              height: isSmallDevice ? 100 : 112,
              fontSize: isSmallDevice ? 14 : 15,
            }}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) {
                setErrors((prev) => ({ ...prev, description: undefined }));
              }
            }}
            placeholder={t("addEvent.typeDescription")}
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
            editable={!submitting}
          />
          <ErrorText error={errors.description} />

          <TouchableOpacity
            disabled={!isFormValid || submitting || generatingContent}
            className="mt-8 rounded-xl items-center justify-center"
            activeOpacity={0.85}
            style={{
              height: isSmallDevice ? 50 : 54,
              backgroundColor:
                isFormValid && !submitting && !generatingContent
                  ? "#000"
                  : "#D1D5DB",
            }}
            onPress={handleSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                className="text-white text-center font-semibold"
                style={{ fontSize: isSmallDevice ? 15 : 17 }}
              >
                {isEdit ? t("addEvent.updateEvent") : t("addEvent.publishNow")}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="font-medium mb-1 text-gray-900">{label}</Text>;
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;

  return <Text className="text-red-500 text-xs mb-3">{error}</Text>;
}
