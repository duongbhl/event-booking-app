import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalization } from "../../context/LocalizationContext";

export interface ITicketTier {
  name: string;
  price: number;
  quota: number;
  sold?: number;
}

interface TicketTierFormProps {
  tiers: ITicketTier[];
  onTiersChange: (tiers: ITicketTier[]) => void;
}

export default function TicketTierForm({
  tiers,
  onTiersChange,
}: TicketTierFormProps) {
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  const tierCardWidth = Math.min(Math.max(width * 0.46, 156), 210);
  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ITicketTier>({
    name: "",
    price: 0,
    quota: 0,
  });

  const handleOpenForm = (index?: number) => {
    if (index !== undefined && tiers[index]) {
      setFormData(tiers[index]);
      setEditIndex(index);
    } else {
      setFormData({ name: "", price: 0, quota: 0 });
      setEditIndex(null);
    }
    setShowModal(true);
  };

  const handleSaveTier = () => {
    if (!formData.name.trim()) {
      Alert.alert(t('common.error'), t('ticketTierForm.tierNameRequired'));
      return;
    }

    if (formData.price < 0) {
      Alert.alert(t('common.error'), t('ticketTierForm.priceMustBePositive'));
      return;
    }

    if (formData.quota <= 0) {
      Alert.alert(t('common.error'), t('ticketTierForm.quotaMustBeGreater'));
      return;
    }

    const newTiers = [...tiers];

    if (editIndex !== null) {
      newTiers[editIndex] = formData;
    } else {
      // Check for duplicate names
      if (newTiers.some((t) => t.name.toLowerCase() === formData.name.toLowerCase())) {
        Alert.alert(t('common.error'), t('ticketTierForm.tierNameExists'));
        return;
      }
      newTiers.push(formData);
    }

    onTiersChange(newTiers);
    setShowModal(false);
    setFormData({ name: "", price: 0, quota: 0 });
    setEditIndex(null);
  };

  const handleDeleteTier = (index: number) => {
    Alert.alert(t('ticketTierForm.deleteTier'), t('ticketTierForm.confirmDeleteTier'), [
      { text: t('common.cancel'), onPress: () => {} },
      {
        text: t('common.delete'),
        onPress: () => {
          const newTiers = tiers.filter((_, i) => i !== index);
          onTiersChange(newTiers);
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-3 gap-2">
        <Text className="font-semibold flex-1" style={{ fontSize: isSmall ? 16 : 18 }}>{t('ticketTierForm.ticketTiers')} *</Text>
        <TouchableOpacity
          className="bg-orange-500 rounded-lg flex-row items-center" style={{ paddingHorizontal: isSmall ? 10 : 12, paddingVertical: 8 }}
          onPress={() => handleOpenForm()}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white ml-1 font-semibold" style={{ fontSize: isSmall ? 12 : 14 }}>{t('ticketTierForm.addTier')}</Text>
        </TouchableOpacity>
      </View>

      {tiers.length === 0 && (
        <View className="bg-gray-100 p-4 rounded-xl items-center">
          <Text className="text-gray-500">{t('ticketTierForm.noTiersAdded')}</Text>
        </View>
      )}

      {tiers.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          {tiers.map((tier, index) => (
            <View
              key={index}
              className="bg-white border border-gray-300 rounded-xl p-3 mr-3"
              style={{ width: tierCardWidth }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold flex-1" style={{ fontSize: isSmall ? 14 : 16 }} numberOfLines={1}>
                  {tier.name}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteTier(index)}
                  className="ml-2"
                >
                  <Ionicons name="trash" size={18} color="red" />
                </TouchableOpacity>
              </View>

              <View className="mb-2">
                <Text className="text-gray-600 text-sm">{t('ticketTierForm.price')}</Text>
                <Text className="font-semibold text-black" style={{ fontSize: isSmall ? 16 : 18 }}>
                  ${tier.price.toFixed(2)}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">{t('ticketTierForm.quota')}</Text>
                <Text className="font-semibold text-black" style={{ fontSize: isSmall ? 16 : 18 }}>
                  {tier.quota} {t('ticketTierForm.tickets')}
                </Text>
              </View>

              <TouchableOpacity
                className="bg-blue-500 py-2 rounded-lg items-center"
                onPress={() => handleOpenForm(index)}
              >
                <Text className="text-white font-semibold">{t('ticketTierFormModal.editButton')}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal Form */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl" style={{ padding: isSmall ? 16 : 20, maxHeight: "90%" }}>
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-semibold">
                {editIndex !== null ? t('ticketTierFormModal.editTier') : t('ticketTierFormModal.addTier')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {/* Tier Name */}
            <Text className="font-medium mb-1">{t('ticketTierFormModal.tierName')} *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-4"
              placeholder={t('ticketTierFormModal.tierNamePlaceholder')}
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
            />

            {/* Price */}
            <Text className="font-medium mb-1">{t('ticketTierFormModal.price')} *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-4"
              placeholder={t('ticketTierFormModal.pricePlaceholder')}
              keyboardType="decimal-pad"
              value={formData.price === 0 ? "" : String(formData.price)}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  price: parseFloat(text) || 0,
                })
              }
            />

            {/* Quota */}
            <Text className="font-medium mb-1">{t('ticketTierFormModal.quota')} *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-6"
              placeholder={t('ticketTierFormModal.quotaPlaceholder')}
              keyboardType="numeric"
              value={formData.quota === 0 ? "" : String(formData.quota)}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  quota: parseInt(text) || 0,
                })
              }
            />

            {/* Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 border border-gray-300 py-3 rounded-xl items-center"
                onPress={() => setShowModal(false)}
              >
                <Text className="font-semibold">{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-xl items-center"
                onPress={handleSaveTier}
              >
                <Text className="text-white font-semibold">
                  {editIndex !== null ? t('common.edit') : t('ticketTierFormModal.addTier')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
