export interface InvitationCardProps {
  avatar: string;
  name: string;
  message: string;
  time: string;
  type?: "invite" | "follow" | "comment" | "like";
  onAccept?: () => void;
  onReject?: () => void;
}