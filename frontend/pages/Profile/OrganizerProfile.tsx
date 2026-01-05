import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useIsFocused } from "@react-navigation/native";
import { getOrganizerFollowers } from "../../services/bookmark.service";
import { getOrganizerEvents } from "../../services/event.service";
import EventPriceCard from "../../components/Cards/EventPriceCard";

export default function OrganizerProfile() {
  const [tab, setTab] = useState<"about" | "events" | "reviews">("about");
  const navigation = useNavigation();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  
  const organizer = route.params?.organizer;
  
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!organizer?._id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch followers
        const followersCount = await getOrganizerFollowers(organizer._id);
        setFollowers(followersCount);
        
        // Fetch organizer's events
        const organizerEvents = await getOrganizerEvents(organizer._id);
        setEvents(organizerEvents);
      } catch (error) {
        console.log("Fetch organizer data error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchData();
    }
  }, [organizer?._id, isFocused]);

  return (
    <ScrollView className="flex-1 bg-white px-5 pt-12">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="justify-start">
          <TouchableOpacity onPress={()=>navigation.goBack()} className="p-1">
            <Ionicons name="chevron-back" size={26} color="#111827" />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>
      </View>

      {/* Avatar */}
      <View className="items-center">
        <Image
          source={{
            uri: organizer?.avatar || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2281862025.jpg",
          }}
          className="w-24 h-24 rounded-full"
        />
        <Text className="mt-3 text-lg font-semibold">{organizer?.name || "Unknown Organizer"}</Text>
      </View>

      {/* Stats */}
      <View className="flex-row justify-center mt-6">
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">{followers}</Text>
          <Text className="text-gray-500 text-sm">Followers</Text>
        </View>
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">{following}</Text>
          <Text className="text-gray-500 text-sm">Following</Text>
        </View>
        <View className="items-center mx-4">
          <Text className="text-lg font-bold">{events.length}</Text>
          <Text className="text-gray-500 text-sm">Events</Text>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row mt-8 border-b border-gray-200">
        {["About", "Events", "Reviews"].map((label) => {
          const key = label.toLowerCase() as "about" | "events" | "reviews";
          const active = tab === key;
          return (
            <TouchableOpacity
              key={label}
              className="flex-1 items-center pb-3"
              onPress={() => setTab(key)}
            >
              <Text
                className={`font-medium ${active ? "text-orange-500" : "text-gray-500"
                  }`}
              >
                {label}
              </Text>
              {active && <View className="h-1 w-10 bg-orange-500 rounded-full mt-2" />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      {tab === "about" && (
        <View className="mt-6">
          <Text className="text-lg font-semibold mb-2">About</Text>
          <Text className="text-gray-600 leading-6">
            {organizer?.description || "No description"}
          </Text>
        </View>
      )}

      {tab === "events" && (
        <View className="mt-6">
          {events.length === 0 ? (
            <Text className="text-center mt-10 text-gray-400">No events yet</Text>
          ) : (
            events.map((event) => (
              <View key={event._id} className="mb-4">
                <EventPriceCard {...event} />
              </View>
            ))
          )}
        </View>
      )}

      {tab === "reviews" && (
        <Text className="text-center mt-10 text-gray-400">Reviews…</Text>
      )}

      <View className="h-10" />
    </ScrollView>
  );
}
