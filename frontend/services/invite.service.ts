import api from "./api";
import { authHeader } from "./auHeader";

/**
 * Send event invitations to users
 */
export const sendInvitation = async (
  data: {
    userIds: string[];
    eventId: string;
  },
  token: string
) => {
  const res = await api.post("/notifications/invite", data, authHeader(token));
  return res.data;
};
