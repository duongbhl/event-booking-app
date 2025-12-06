export interface UserInviteCardProps  {
  name: string;
  followers: string;
  avatar: string;
  status?: "sent" | "accept" | "none";
};
