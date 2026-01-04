import api from "./api";
import { uploadImageToCloudinary } from "./upload.service";

export interface UpdateProfilePayload {
  name?: string;
  avatar?: string;
  country?: string;
  interests?: string[];
  location?: string;
  description?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  country?: string;
  interests?: string[];
  location?: string;
  description?: string;
  role: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export const getMyProfile = async (token: string): Promise<UserProfile> => {
  const { data } = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateProfile = async (
  payload: UpdateProfilePayload,
  token: string
): Promise<UserProfile> => {
  // Upload avatar to Cloudinary if it's a local file
  let avatarUrl = payload.avatar;
  if (avatarUrl && avatarUrl.startsWith("file://")) {
    avatarUrl = await uploadImageToCloudinary(avatarUrl);
  }

  const { data } = await api.put(
    "/users/me",
    {
      ...payload,
      avatar: avatarUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return data;
};
