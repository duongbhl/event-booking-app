import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SelectInterestScreen() {
    const [selected, setSelected] = useState<number[]>([]);

    const toggleSelect = (id: number) => {
        if (selected.includes(id)) {
            setSelected(selected.filter((x) => x !== id));
        } else if (selected.length < 3) {
            setSelected([...selected, id]);
        }
    };

    const interests = [
        {
            id: 1,
            name: "Design",
            image: require("../assets/interests/vector.png"),
        },
        {
            id: 2,
            name: "Music",
            image: require("../assets/interests/music.png"),
        },
        {
            id: 3,
            name: "Art",
            image: require("../assets/interests/paint-palette.png"),
        },
        {
            id: 4,
            name: "Sports",
            image: require("../assets/interests/sports.png"),
        },
        {
            id: 5,
            name: "Food",
            image: require("../assets/interests/salad.png"),
        },
        {
            id: 6,
            name: "Others",
            image: require("../assets/interests/ellipsis.png"),
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between mt-2">
                    <TouchableOpacity className="p-1">
                        <Ionicons name="chevron-back" size={26} color="#111827" />
                    </TouchableOpacity>
                    <View style={{ width: 24 }} />
                </View>

                {/* Title */}
                <Text className="text-xl font-semibold text-center mt-4 text-gray-900">
                    Select Your 3 Interests
                </Text>

                {/* Grid */}
                <View className="mt-8 flex-row flex-wrap justify-between" style={{ rowGap: 24 }}>
                    {interests.map((item) => {
                        const isSelected = selected.includes(item.id);

                        return (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleSelect(item.id)}
                                className="w-[45%] items-center"
                            >
                                <View
                                    className="w-full h-32 rounded-2xl bg-gray-50 justify-center items-center"
                                    style={{
                                        borderWidth: 2,
                                        borderColor: isSelected ? "#F97316" : "transparent",
                                    }}
                                >
                                    <Image
                                        source={item.image}
                                        style={{ width: 60, height: 60 }}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text className="text-center mt-2 text-gray-700">{item.name}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* NEXT Button */}
                <TouchableOpacity className="mt-12">
                    <LinearGradient
                        colors={["#383838", "#121212"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="justify-center items-center"
                        style={{
                            height: 56,
                            borderRadius: 28,
                        }}
                    >
                        <Text className="text-white text-center mt-5 text-lg font-semibold tracking-wider">
                            NEXT
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
