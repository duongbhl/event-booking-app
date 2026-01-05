import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventCardProps } from "../components/Interface/EventCardProps";
import api from "./api";


export interface CreateEventPayload {
  title: string;
  description?: string;
  category: string;
  price?: number;
  date: Date; // ISO string
  member:number;
  time: string;
  location: string;
  images?: string;
}


export const getEvents = async () => {
  try {
    const { data } = await api.get("/events/");
    return data.items as EventCardProps[];
  } catch (error: any) {
    console.error("Error fetching events:", error.message);
    throw error;
  }
};

export const getMyEvents = async (token: string) => {
  try {
    const { data } = await api.get("/events/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data as EventCardProps[];
  } catch (error: any) {
    console.error("Error fetching my events:", error.message);
    throw error;
  }
};

export const getOrganizerEvents = async (organizerId: string) => {
  try {
    const { data } = await api.get(`/events/organizer/${organizerId}`);
    return data as EventCardProps[];
  } catch (error: any) {
    console.error("Error fetching organizer events:", error.message);
    throw error;
  }
};


export const createEvent = async (payload: CreateEventPayload) => {
  const token = await AsyncStorage.getItem("token");

  const res = await api.post("/events/", payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};


export const updateEvent = async (
  eventId: string,
  payload: CreateEventPayload
) => {
  const token = await AsyncStorage.getItem("token");

  const res = await api.put(`/events/${eventId}`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return res.data;
};
