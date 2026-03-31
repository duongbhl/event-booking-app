import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
      Alert.alert("Error", "Tier name is required");
      return;
    }

    if (formData.price < 0) {
      Alert.alert("Error", "Price must be a positive number");
      return;
    }

    if (formData.quota <= 0) {
      Alert.alert("Error", "Quota must be greater than 0");
      return;
    }

    const newTiers = [...tiers];

    if (editIndex !== null) {
      newTiers[editIndex] = formData;
    } else {
      // Check for duplicate names
      if (newTiers.some((t) => t.name.toLowerCase() === formData.name.toLowerCase())) {
        Alert.alert("Error", "Tier name already exists");
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
    Alert.alert("Delete Tier", "Are you sure you want to delete this tier?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
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
      <View className="flex-row justify-between items-center mb-3">
        <Text className="font-semibold text-lg">Ticket Tiers *</Text>
        <TouchableOpacity
          className="bg-orange-500 px-3 py-2 rounded-lg flex-row items-center"
          onPress={() => handleOpenForm()}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text className="text-white ml-1 font-semibold">Add Tier</Text>
        </TouchableOpacity>
      </View>

      {tiers.length === 0 && (
        <View className="bg-gray-100 p-4 rounded-xl items-center">
          <Text className="text-gray-500">No tiers added yet</Text>
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
              className="bg-white border border-gray-300 rounded-xl p-3 mr-3 w-48"
            >
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-semibold text-base flex-1">
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
                <Text className="text-gray-600 text-sm">Price</Text>
                <Text className="text-lg font-semibold text-black">
                  ${tier.price.toFixed(2)}
                </Text>
              </View>

              <View className="mb-3">
                <Text className="text-gray-600 text-sm">Quota</Text>
                <Text className="text-lg font-semibold text-black">
                  {tier.quota} tickets
                </Text>
              </View>

              <TouchableOpacity
                className="bg-blue-500 py-2 rounded-lg items-center"
                onPress={() => handleOpenForm(index)}
              >
                <Text className="text-white font-semibold">Edit</Text>
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
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-5">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-semibold">
                {editIndex !== null ? "Edit Tier" : "Add Tier"}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {/* Tier Name */}
            <Text className="font-medium mb-1">Tier Name *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-4"
              placeholder="e.g., VIP, Standard, Economy"
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
            />

            {/* Price */}
            <Text className="font-medium mb-1">Price ($) *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-4"
              placeholder="0"
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
            <Text className="font-medium mb-1">Quota (Number of Tickets) *</Text>
            <TextInput
              className="border border-gray-300 rounded-xl p-3 mb-6"
              placeholder="0"
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
                <Text className="font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-black py-3 rounded-xl items-center"
                onPress={handleSaveTier}
              >
                <Text className="text-white font-semibold">
                  {editIndex !== null ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
