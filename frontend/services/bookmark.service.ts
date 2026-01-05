import axios from "axios";
import api from "./api";



export const toggleBookmark = async (eventId: string, token: string) => {
  const res = await api.post(
    `/bookmarks/toggle`,
    { eventId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data as { bookmarked: boolean };
};



export const getMyBookmarks = async (token: string) => {
  const res = await api.get(`/bookmarks/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // array bookmark (đã populate event)
};

export const getMyFollowers = async (token: string) => {
  const res = await api.get(`/bookmarks/me/followers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.followers;
};

export const getOrganizerFollowers = async (organizerId: string) => {
  const res = await api.get(`/bookmarks/organizer/${organizerId}/followers`);
  return res.data.followers;
};
